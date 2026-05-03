// Usage: npx tsx scripts/export-data.ts
// Reads data/gtfs.db and writes JSON bundles to public/data/ for client-side use.
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

type StationRow = { id: string; name: string; lines: string | null };
type EdgeRow = { from_stop: string; to_stop: string; line_name: string; minutes: number };

const DB_PATH = path.join(process.cwd(), 'data', 'gtfs.db');
const OUT_DIR = path.join(process.cwd(), 'public', 'data');

function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`gtfs.db not found at ${DB_PATH} — run scripts/fetch-stations.ts first.`);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });

  const stations = db.prepare(`
    SELECT s.stop_id AS id, s.stop_name AS name,
           GROUP_CONCAT(sl.line_name, '|') AS lines
    FROM stops s
    LEFT JOIN stop_lines sl ON s.stop_id = sl.stop_id
    WHERE s.parent_station = '' OR s.parent_station IS NULL
    GROUP BY s.stop_id
  `).all() as StationRow[];

  const edges = db.prepare(`
    SELECT from_stop, to_stop, line_name, minutes FROM route_edges
  `).all() as EdgeRow[];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const stationsJson = stations.map(r => ({
    id: r.id,
    name: r.name,
    yomi: '',
    lines: r.lines ? r.lines.split('|').filter(Boolean) : [],
  }));

  // Compact tuple form to keep JSON small: [from, to, line, minutes]
  const edgesJson = edges.map(e => [e.from_stop, e.to_stop, e.line_name, e.minutes]);

  const meta = {
    generatedAt: new Date().toISOString(),
    stopCount: stationsJson.length,
    edgeCount: edgesJson.length,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'stations.json'), JSON.stringify(stationsJson));
  fs.writeFileSync(path.join(OUT_DIR, 'edges.json'), JSON.stringify(edgesJson));
  fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`書き出し完了: ${meta.stopCount} 駅, ${meta.edgeCount} エッジ → public/data/`);
}

main();
