const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function renderShell() {
  const changes = [], effects = [], events = [], focus = [];
  let stateIndex = 0;
  class Element {
    isConnected = true;
    focus(options) { focus.push(options); }
  }
  const opener = new Element();
  const imports = {
    react: {
      Suspense: 'Suspense',
      useState: initial => { const index = stateIndex++; return [initial, value => changes.push({ index, value })]; },
      useRef: current => ({ current }),
      useEffect: callback => effects.push(callback),
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@/hooks/use-site-data': { useSiteSettings: () => ({}), useCategories: () => ({ categories: [] }) },
    'next/navigation': { usePathname: () => '/' },
    '@/hooks/use-snow': { useSnow: () => ({ isSnowing: false }) },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/components/app-shell.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, HTMLElement: Element,
    document: { activeElement: opener },
    window: { dispatchEvent: event => events.push(event.type) }, Event,
    require: name => imports[name] || new Proxy({}, { get: (_, key) => String(key) }),
  });
  const tree = module.exports.AppShell({ children: 'page' });
  function find(type, node = tree) {
    if (!node || typeof node !== 'object') return;
    if (node.type === type) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      if (!child || typeof child !== 'object') continue;
      const found = find(type, child);
      if (found) return found;
    }
  }
  return { find, changes, effects, events, focus, opener };
}

test('Hamburger and Plus share the menu opener and restore focus after ordinary dismissal', () => {
  const f = renderShell();
  assert.equal(f.find('HeaderWrapper').props.onMobileMenuClick, f.find('MobileBottomNav').props.onMenuClick);
  f.find('HeaderWrapper').props.onMobileMenuClick();
  assert.equal(f.changes.at(-1).value, true);
  let prevented = false;
  f.find('SheetContent').props.onCloseAutoFocus({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(f.focus.length, 1);
  assert.equal(f.events.length, 0);
});

test('Help opens only after the sheet releases its modal scope, once, without a timer', () => {
  const f = renderShell();
  f.find('HeaderWrapper').props.onMobileMenuClick();
  f.find('MobileNav').props.onHelpClick();
  assert.equal(f.changes.at(-1).value, false);
  assert.equal(f.events.length, 0);
  f.find('SheetContent').props.onCloseAutoFocus({ preventDefault() {} });
  assert.deepEqual(f.events, ['dakarboutik:open-help']);
  f.find('SheetContent').props.onCloseAutoFocus({ preventDefault() {} });
  assert.equal(f.events.length, 1);
});

test('Navigating cancels pending help and ignores an opener removed by navigation', () => {
  const f = renderShell();
  f.find('HeaderWrapper').props.onMobileMenuClick();
  f.find('MobileNav').props.onHelpClick();
  f.effects[0]();
  f.opener.isConnected = false;
  f.find('SheetContent').props.onCloseAutoFocus({ preventDefault() {} });
  assert.equal(f.events.length, 0);
  assert.equal(f.focus.length, 0);
});
