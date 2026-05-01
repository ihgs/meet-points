'use server';
import 'server-only';

import { FALLBACK_STATIONS, STATION_TAGS, findRoute, type Station, type SearchResult } from '@/lib/stations';

type GraphNode = { to: string; m: number; line: string };

// Module-level graph cache; reset on process restart
let _graphCache: Record<string, GraphNode[]> | null = null;

function buildGraphFromDb(): Record<string, GraphNode[]> {
  if (_graphCache) return _graphCache;

  try {
    const { getDb } = require('@/lib/db') as typeof import('@/lib/db');
    const db = getDb();
    const edges = db.prepare('SELECT from_stop, to_stop, line_name, minutes FROM route_edges').all() as {
      from_stop: string; to_stop: string; line_name: string; minutes: number;
    }[];

    if (edges.length === 0) return {};

    const graph: Record<string, GraphNode[]> = {};
    for (const e of edges) {
      (graph[e.from_stop] = graph[e.from_stop] || []).push({ to: e.to_stop, m: e.minutes, line: e.line_name });
      (graph[e.to_stop] = graph[e.to_stop] || []).push({ to: e.from_stop, m: e.minutes, line: e.line_name });
    }
    _graphCache = graph;
    return graph;
  } catch {
    return {};
  }
}

function estimateFare(minutes: number): number {
  if (minutes <= 5)  return 150;
  if (minutes <= 10) return 170;
  if (minutes <= 15) return 200;
  if (minutes <= 20) return 230;
  if (minutes <= 30) return 280;
  if (minutes <= 45) return 380;
  if (minutes <= 60) return 480;
  return 600;
}

export async function getStationsAction(): Promise<Station[]> {
  try {
    const { getDb } = require('@/lib/db') as typeof import('@/lib/db');
    const db = getDb();
    const rows = db.prepare(`
      SELECT s.stop_id AS id, s.stop_name AS name, '' AS yomi,
             GROUP_CONCAT(sl.line_name, '|') AS lines
      FROM stops s
      LEFT JOIN stop_lines sl ON s.stop_id = sl.stop_id
      WHERE s.parent_station = '' OR s.parent_station IS NULL
      GROUP BY s.stop_id
    `).all() as { id: string; name: string; yomi: string; lines: string | null }[];

    if (rows.length === 0) return FALLBACK_STATIONS;

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      yomi: r.yomi,
      lines: r.lines ? r.lines.split('|').filter(Boolean) : [],
    }));
  } catch {
    return FALLBACK_STATIONS;
  }
}

export async function searchAction(memberIds: string[], candidateIds: string[]): Promise<SearchResult[]> {
  const graph = buildGraphFromDb();
  const usingDb = Object.keys(graph).length > 0;

  if (!usingDb) {
    // Fall back to hardcoded data
    const { searchMeetingPoints } = await import('@/lib/stations');
    return searchMeetingPoints(memberIds, candidateIds);
  }

  // 自動検索: スマート候補選定（全駅ブルートフォース不要）
  if (candidateIds.length === 0) {
    const { smartSearch } = await import('@/lib/smart-search');
    const stations = await getStationsAction();
    const stationNameMap = new Map(stations.map(s => [s.id, s.name]));
    return smartSearch(memberIds, graph, stationNameMap, STATION_TAGS);
  }

  // 手動候補指定: 指定駅のみをブルートフォースで評価
  const stations = await getStationsAction();
  const results: SearchResult[] = [];

  for (const candId of candidateIds) {
    const routes = memberIds.map(memberId => ({ memberId, route: findRoute(memberId, candId, graph) }));
    if (routes.some(r => !r.route)) continue;

    const validRoutes = routes as { memberId: string; route: NonNullable<ReturnType<typeof findRoute>> }[];
    const times = validRoutes.map(r => r.route.minutes);
    const total = times.reduce((a, b) => a + b, 0);
    const avg = total / times.length;
    const variance = times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length;
    const std = Math.sqrt(variance);
    const fairness = Math.max(0, Math.min(100, Math.round(100 - std * 5)));
    const totalFare = validRoutes.reduce((s, r) => s + estimateFare(r.route.minutes), 0);
    const maxTransfers = Math.max(...validRoutes.map(r => r.route.transfers));

    results.push({
      candId,
      candName: stations.find(s => s.id === candId)?.name ?? candId,
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
