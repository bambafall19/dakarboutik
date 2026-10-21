export const RECENT_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

export function isRecentlyAdded(createdAt: string | undefined, now: number = Date.now()): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return created > now - RECENT_WINDOW_MS;
}

export function getNewProducts<
  T extends { isNew?: boolean; createdAt: string; isBestseller?: boolean },
>(products: T[], limit = 8, now: number = Date.now()): T[] {
  return products
    .filter(p => p.isNew || isRecentlyAdded(p.createdAt, now))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
