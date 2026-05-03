// 接続性の診断スクリプト
// Usage: npx tsx scripts/debug-connectivity.ts
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'gtfs.db');

const db = new Database(DB_PATH);

const stopCount = (db.prepare('SELECT COUNT(*) as c FROM stops').get() as { c: number }).c;
const edgeCount = (db.prepare('SELECT COUNT(*) as c FROM route_edges').get() as { c: number }).c;
console.log(`\n=== DB状態 ===`);
console.log(`stops: ${stopCount}, route_edges: ${edgeCount}`);

const importLog = db.prepare('SELECT source, imported_at, stop_count, edge_count, status FROM import_log ORDER BY id DESC LIMIT 3').all();
console.log('\n=== 最新インポート ===');
console.table(importLog);

const TEST_STATIONS = ['千葉', '長津田', '橋本', '溝の口', '梶が谷', '渋谷', '新宿', '品川'];

console.log('\n=== 対象駅の存在確認 ===');
for (const st of TEST_STATIONS) {
  const row = db.prepare('SELECT stop_id FROM stops WHERE stop_id = ?').get(st) as { stop_id: string } | undefined;
  const ec = (db.prepare('SELECT COUNT(*) as c FROM route_edges WHERE from_stop = ? OR to_stop = ?').get(st, st) as { c: number }).c;
  console.log(`${row ? '✓' : '✗'} ${st.padEnd(6)} edges=${ec}`);
}

// BFS で千葉からの到達可能性チェック
console.log('\n=== 千葉からの接続確認 (BFS) ===');
const edges = db.prepare('SELECT from_stop, to_stop FROM route_edges').all() as { from_stop: string; to_stop: string }[];
const adj: Record<string, string[]> = {};
for (const e of edges) {
  (adj[e.from_stop] ??= []).push(e.to_stop);
  (adj[e.to_stop] ??= []).push(e.from_stop);
}

function bfsFrom(start: string): Set<string> {
  const visited = new Set<string>();
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const next of (adj[cur] ?? [])) {
      if (!visited.has(next)) queue.push(next);
    }
  }
  return visited;
}

const reachableFrom千葉 = bfsFrom('千葉');
console.log(`千葉から到達可能な駅数: ${reachableFrom千葉.size}`);
for (const st of TEST_STATIONS) {
  console.log(`  ${reachableFrom千葉.has(st) ? '✓' : '✗'} ${st}`);
}

// 4駅すべてから到達可能な駅数
const fourStations = ['千葉', '長津田', '橋本', '溝の口'];
const reachableSets = fourStations.map(st => bfsFrom(st));
const mutuallyReachable = [...reachableSets[0]].filter(st =>
  reachableSets.every(s => s.has(st))
);
console.log(`\n=== 4駅全員から到達可能な駅数: ${mutuallyReachable.length} ===`);
if (mutuallyReachable.length <= 20) {
  console.log(mutuallyReachable.join(', '));
}

// 千葉 → 渋谷 の経路があるか確認（BFS経路復元）
console.log('\n=== 千葉 → 渋谷 の経路 (BFS) ===');
{
  const prev: Record<string, string | null> = { '千葉': null };
  const q = ['千葉'];
  let found = false;
  outer: while (q.length) {
    const cur = q.shift()!;
    for (const next of (adj[cur] ?? [])) {
      if (prev[next] !== undefined) continue;
      prev[next] = cur;
      if (next === '渋谷') { found = true; break outer; }
      q.push(next);
    }
  }
  if (found) {
    const path: string[] = [];
    let cur: string | null = '渋谷';
    while (cur) { path.unshift(cur); cur = prev[cur] ?? null; }
    console.log(path.join(' → '));
  } else {
    console.log('経路なし（接続されていない）');
  }
}
