import { type Route, type SearchResult } from './stations';

export type GraphNode = { to: string; m: number; line: string };

// ─── Binary MinHeap ───────────────────────────────────────────────────────────

class MinHeap<T> {
  private data: [number, T][] = [];

  push(priority: number, value: T): void {
    this.data.push([priority, value]);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p][0] <= this.data[i][0]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  pop(): [number, T] | undefined {
    if (!this.data.length) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2, n = this.data.length;
        let m = i;
        if (l < n && this.data[l][0] < this.data[m][0]) m = l;
        if (r < n && this.data[r][0] < this.data[m][0]) m = r;
        if (m === i) break;
        [this.data[m], this.data[i]] = [this.data[i], this.data[m]];
        i = m;
      }
    }
    return top;
  }

  get size() { return this.data.length; }
}

// ─── Dijkstra (全到達駅、乗り換えペナルティあり) ─────────────────────────────

type DijkResult = {
  dist: Map<string, number>;
  prevStation: Map<string, string | null>;
  prevLine: Map<string, string | null>;
};

function dijkstraAll(startId: string, graph: Record<string, GraphNode[]>): DijkResult {
  const dist = new Map<string, number>([[startId, 0]]);
  const prevStation = new Map<string, string | null>([[startId, null]]);
  const prevLine = new Map<string, string | null>([[startId, null]]);

  // (stationId|line) → best time で古いエントリをスキップ
  const stateBest = new Map<string, number>([[`${startId}|`, 0]]);
  const heap = new MinHeap<[string, string | null]>();
  heap.push(0, [startId, null]);

  while (heap.size > 0) {
    const [time, [stId, inLine]] = heap.pop()!;
    const sk = `${stId}|${inLine ?? ''}`;
    if ((stateBest.get(sk) ?? Infinity) < time) continue;

    for (const edge of (graph[stId] ?? [])) {
      const penalty = inLine !== null && inLine !== edge.line ? 5 : 0;
      const nt = time + edge.m + penalty;
      const nsk = `${edge.to}|${edge.line}`;

      if (nt < (stateBest.get(nsk) ?? Infinity)) {
        stateBest.set(nsk, nt);
        heap.push(nt, [edge.to, edge.line]);

        if (nt < (dist.get(edge.to) ?? Infinity)) {
          dist.set(edge.to, nt);
          prevStation.set(edge.to, stId);
          prevLine.set(edge.to, edge.line);
        }
      }
    }
  }

  return { dist, prevStation, prevLine };
}

// ─── 最短経路の復元 ────────────────────────────────────────────────────────────

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

function reconstructRoute(endId: string, dijk: DijkResult): Route | null {
  const minutes = dijk.dist.get(endId);
  if (minutes === undefined) return null;

  const path: string[] = [];
  const lines: string[] = [];
  let cur: string | null = endId;

  while (cur !== null) {
    path.unshift(cur);
    const ps: string | null = dijk.prevStation.get(cur) ?? null;
    const pl: string | null = dijk.prevLine.get(cur) ?? null;
    if (ps === null) break;
    if (pl) lines.unshift(pl);
    cur = ps;
  }

  let transfers = 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] !== lines[i - 1]) transfers++;
  }

  return { minutes, transfers, fare: estimateFare(minutes), path, lines };
}

// ─── スマート候補選定 ─────────────────────────────────────────────────────────

const SLACK = 1.3;       // 最短経路の1.3倍以内を「経路上」と見なす
const MIN_PAIR_RATIO = 0.5; // 全メンバーペアの50%以上で経路上 → Phase3候補

export function smartSearch(
  memberIds: string[],
  graph: Record<string, GraphNode[]>,
  stationNameMap: Map<string, string>,
  stationTagMap: Record<string, string[]>,
): SearchResult[] {
  if (memberIds.length === 0) return [];

  // Phase 1: 各メンバーからDijkstra（1人につき1回のみ）
  const dijks = memberIds.map(id => dijkstraAll(id, graph));

  // Phase 2: メンバーペアごとに「経路上の駅」を集計
  //   駅 X が pair(i,j) の経路上 ⟺ dist[i][X] + dist[j][X] ≤ dist[i][j] × SLACK
  const pairCount = new Map<string, number>(); // 駅 → 何ペアの経路上か
  const totalPairs = memberIds.length * (memberIds.length - 1) / 2;

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const dIJ = dijks[i].dist.get(memberIds[j]) ?? Infinity;
      if (!isFinite(dIJ)) continue;
      const thresh = dIJ * SLACK;

      for (const [st, dI] of dijks[i].dist) {
        if (dI >= thresh) continue;
        const dJ = dijks[j].dist.get(st) ?? Infinity;
        if (dI + dJ <= thresh) {
          pairCount.set(st, (pairCount.get(st) ?? 0) + 1);
        }
      }
    }
  }

  // Phase 3: Phase2候補の組み合わせで「全ペアの中間」にある駅に絞る
  //   全メンバーから到達可能 かつ ≥50% のペアで経路上 → 候補確定
  const minPairs = Math.max(1, Math.round(totalPairs * MIN_PAIR_RATIO));
  const reachableFromAll = (st: string) =>
    memberIds.every((_, m) => isFinite(dijks[m].dist.get(st) ?? Infinity));

  let candidates = [...pairCount.entries()]
    .filter(([st, cnt]) => cnt >= minPairs && reachableFromAll(st))
    .map(([st]) => st);

  // フォールバック: 条件が厳しすぎる場合は1ペア以上まで緩和
  if (candidates.length < 5) {
    candidates = [...pairCount.keys()].filter(reachableFromAll);
  }

  // スコアリング（precompute済みのdist[][]を利用）
  const results: SearchResult[] = [];

  for (const candId of candidates) {
    const routes = memberIds.map((memberId, m) => ({
      memberId,
      route: reconstructRoute(candId, dijks[m]),
    }));
    if (routes.some(r => !r.route)) continue;

    const validRoutes = routes as { memberId: string; route: Route }[];
    const times = validRoutes.map(r => r.route.minutes);
    const total = times.reduce((a, b) => a + b, 0);
    const avg = total / times.length;
    const variance = times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length;
    const std = Math.sqrt(variance);
    const fairness = Math.max(0, Math.min(100, Math.round(100 - std * 5)));
    const totalFare = validRoutes.reduce((s, r) => s + r.route.fare, 0);
    const maxTransfers = Math.max(...validRoutes.map(r => r.route.transfers));

    results.push({
      candId,
      candName: stationNameMap.get(candId) ?? candId,
      routes: validRoutes,
      total, avg, std, fairness, totalFare, maxTransfers,
      tags: stationTagMap[candId] ?? [],
    });
  }

  results.sort((a, b) =>
    (a.total + (100 - a.fairness) * 0.5) - (b.total + (100 - b.fairness) * 0.5)
  );

  return results.slice(0, 3);
}
