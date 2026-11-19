export type EngagementStats = {
  days: number;
  orderCount?: number;
  totals: { kind: string; total: number }[];
  daily: { day: string; kind: string; total: number }[];
  campaigns: { id: string; title: string; views: number; clicks: number }[];
};
export function statisticsDays(value: string | null): number {
  return value === "7" || value === "90" ? Number(value) : 30;
}
// Dakar has a fixed UTC offset of zero. Calendar days stay independent of the browser's timezone.
export function engagementTimeline(
  rows: EngagementStats["daily"],
  days: number,
  now = new Date(),
) {
  const byDay = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const day = byDay.get(row.day) ?? {};
    day[row.kind] = (day[row.kind] ?? 0) + row.total;
    byDay.set(row.day, day);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - days + 1 + i,
      ),
    );
    const day = date.toISOString().slice(0, 10);
    const totals = byDay.get(day) ?? {};
    return {
      day: day.slice(5),
      shops: totals.shop_view ?? 0,
      whatsapp: totals.whatsapp_click ?? 0,
      views: totals.ad_view ?? 0,
      clicks: totals.ad_click ?? 0,
    };
  });
}
