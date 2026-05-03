import type { Station } from './stations';
import type { GraphNode } from './smart-search';

export type DataBundle = {
  stations: Station[];
  graph: Record<string, GraphNode[]>;
  stationNameMap: Map<string, string>;
};

type EdgeTuple = [string, string, string, number];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

let _cache: Promise<DataBundle | null> | null = null;

export function loadData(): Promise<DataBundle | null> {
  if (_cache) return _cache;
  _cache = (async () => {
    try {
      const [stationsRes, edgesRes] = await Promise.all([
        fetch(`${BASE_PATH}/data/stations.json`),
        fetch(`${BASE_PATH}/data/edges.json`),
      ]);
      if (!stationsRes.ok || !edgesRes.ok) return null;

      const stations = (await stationsRes.json()) as Station[];
      const edges = (await edgesRes.json()) as EdgeTuple[];

      const graph: Record<string, GraphNode[]> = {};
      for (const [a, b, line, m] of edges) {
        (graph[a] = graph[a] || []).push({ to: b, m, line });
        (graph[b] = graph[b] || []).push({ to: a, m, line });
      }

      return {
        stations,
        graph,
        stationNameMap: new Map(stations.map(s => [s.id, s.name])),
      };
    } catch {
      return null;
    }
  })();
  return _cache;
}
