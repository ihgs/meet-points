import 'server-only';
import { getDb } from './db';
import type { ParsedStop, ParsedEdge } from './gtfs-parser';

export function importToDb(
  stops: ParsedStop[],
  edges: ParsedEdge[],
  stopLines: { stop_id: string; line_name: string }[],
  source: string,
  operator: string,
): { stopCount: number; edgeCount: number } {
  const db = getDb();

  const upsertStop = db.prepare(`
    INSERT OR REPLACE INTO stops (stop_id, stop_name, stop_lat, stop_lon, parent_station, operator)
    VALUES (@stop_id, @stop_name, @stop_lat, @stop_lon, @parent_station, @operator)
  `);

  const upsertEdge = db.prepare(`
    INSERT OR REPLACE INTO route_edges (from_stop, to_stop, line_name, minutes)
    VALUES (@from_stop, @to_stop, @line_name, @minutes)
  `);

  const upsertStopLine = db.prepare(`
    INSERT OR REPLACE INTO stop_lines (stop_id, line_name)
    VALUES (@stop_id, @line_name)
  `);

  const insertLog = db.prepare(`
    INSERT INTO import_log (source, imported_at, stop_count, edge_count, status, error)
    VALUES (@source, @imported_at, @stop_count, @edge_count, @status, @error)
  `);

  const runImport = db.transaction(() => {
    for (const stop of stops) {
      upsertStop.run({ ...stop, operator });
    }
    for (const edge of edges) {
      upsertEdge.run(edge);
    }
    for (const sl of stopLines) {
      upsertStopLine.run(sl);
    }
    insertLog.run({
      source,
      imported_at: new Date().toISOString(),
      stop_count: stops.length,
      edge_count: edges.length,
      status: 'success',
      error: null,
    });
  });

  runImport();

  return { stopCount: stops.length, edgeCount: edges.length };
}

export function logImportError(source: string, error: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO import_log (source, imported_at, status, error)
    VALUES (@source, @imported_at, 'error', @error)
  `).run({ source, imported_at: new Date().toISOString(), error });
}
