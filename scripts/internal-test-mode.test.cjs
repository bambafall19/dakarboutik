const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function fixture() {
  const values = new Map();
  const requests = [];
  const sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const browser = { window: { sessionStorage }, navigator: {},
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    fetch: (url, init) => { requests.push({ url, body: JSON.parse(init.body) }); return Promise.resolve(); },
    URL,
  };
  function load(file, imports = {}) {
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, { ...browser, module, exports: module.exports, require: name => {
      if (name in imports) return imports[name];
      throw Error('Unexpected import ' + name);
    } });
    return module.exports;
  }
  const client = load('src/lib/engagement-client.ts');
  return { client, requests, browser, load };
}

test('Internal mode suppresses every event and audience, then resumes new measurements', () => {
  const { client, requests } = fixture();
  const kinds = ['shop_view', 'whatsapp_click', 'ad_view', 'ad_click', 'checkout_open'];
  client.setInternalTestEnabled(true);
  for (const kind of kinds) for (const audience of ['partner', 'support', 'official'])
    client.recordEngagement(kind, 'shops', undefined, { audience });
  assert.equal(requests.length, 0);
  client.setInternalTestEnabled(false);
  for (const kind of kinds) client.recordEngagement(kind, 'shops');
  assert.deepEqual(requests.map(r => r.body.kind), kinds);
  assert.ok(requests.every(r => r.url === '/api/engagement'));
});

test('Activating internal mode preserves earlier events and does not replay excluded actions', () => {
  const { client, requests } = fixture();
  client.recordEngagement('shop_view', 'shops');
  const original = JSON.stringify(requests);
  client.setInternalTestEnabled(true);
  client.recordEngagement('whatsapp_click', 'shops');
  client.setInternalTestEnabled(false);
  assert.equal(JSON.stringify(requests), original);
});

test('Internal mode is isolated per session and respects privacy after deactivation', () => {
  const first = fixture(), second = fixture();
  first.client.setInternalTestEnabled(true);
  assert.equal(second.client.internalTestEnabled(), false);
  first.client.setInternalTestEnabled(false);
  first.browser.navigator.doNotTrack = '1';
  first.client.recordEngagement('shop_view', 'shops');
  assert.equal(first.requests.length, 0);
  delete first.browser.navigator.doNotTrack;
  first.browser.navigator.globalPrivacyControl = true;
  first.client.recordEngagement('whatsapp_click', 'shops');
  assert.equal(first.requests.length, 0);
});

test('Vercel page views are suppressed in test mode and retain private-route exclusions', () => {
  const f = fixture();
  const { SiteAnalytics } = f.load('src/components/site-analytics.tsx', {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    '@vercel/analytics/next': { Analytics: () => null },
    'next/navigation': { usePathname: () => '/' },
    react: { useEffect: () => {} },
    '@/lib/engagement-client': f.client,
    '@/lib/engagement-attribution': { contactAttribution: () => ({}) },
  });
  const beforeSend = SiteAnalytics().props.beforeSend;
  const event = { url: 'https://dakarboutik.net/boutiques?q=parfum#recherche' };
  f.client.setInternalTestEnabled(true);
  assert.equal(beforeSend(event), null);
  f.client.setInternalTestEnabled(false);
  assert.equal(beforeSend(event).url, 'https://dakarboutik.net/boutiques');
  assert.equal(beforeSend({ url: 'https://dakarboutik.net/admin/statistiques' }), null);
});
