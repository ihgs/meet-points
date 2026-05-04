import {
  FALLBACK_STATIONS,
  STATION_TAGS,
  findRoute,
  searchMeetingPoints,
  type Station,
  type SearchResult,
  type Route,
} from './stations';
import { smartSearch } from './smart-search';
import { loadData } from './data-loader';

export async function getStations(): Promise<Station[]> {
  const data = await loadData();
  return data?.stations ?? FALLBACK_STATIONS;
}

export async function search(memberIds: string[], candidateIds: string[]): Promise<SearchResult[]> {
  const data = await loadData();

  if (!data || Object.keys(data.graph).length === 0) {
    return searchMeetingPoints(memberIds, candidateIds);
  }

  if (candidateIds.length === 0) {
    return smartSearch(memberIds, data.graph, data.stationNameMap, STATION_TAGS);
  }

  const results: SearchResult[] = [];
  for (const candId of candidateIds) {
    const routes = memberIds.map(memberId => ({ memberId, route: findRoute(memberId, candId, data.graph) }));
    if (routes.some(r => !r.route)) continue;

    const validRoutes = routes as { memberId: string; route: Route }[];
    const times = validRoutes.map(r => r.route.minutes);
    const total = times.reduce((a, b) => a + b, 0);
    const avg = total / times.length;
    const variance = times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length;
    const std = Math.sqrt(variance);
    const fairness = avg + std === 0 ? 100 : Math.round(100 * (1 - std / (avg + std)));
    const totalFare = validRoutes.reduce((s, r) => s + r.route.fare, 0);
    const maxTransfers = Math.max(...validRoutes.map(r => r.route.transfers));

    results.push({
      candId,
      candName: data.stationNameMap.get(candId) ?? candId,
      routes: validRoutes,
      total, avg, std, fairness, totalFare, maxTransfers,
      tags: STATION_TAGS[candId] ?? [],
    });
  }

  results.sort((a, b) => {
    const n = memberIds.length;
    const sa = Math.max(...a.routes.map(r => r.route.minutes)) * n + a.total * 0.3;
    const sb = Math.max(...b.routes.map(r => r.route.minutes)) * n + b.total * 0.3;
    return sa - sb;
  });

  return results;
}
