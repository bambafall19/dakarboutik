import 'server-only';
import { queryOne } from './db';
import { withDefaultSettings } from './settings-defaults';
import type { SiteSettings } from './types';

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await queryOne<{ data: any }>('select data from settings where id = $1', ['siteConfig']);
  return withDefaultSettings(row?.data) as SiteSettings;
}
