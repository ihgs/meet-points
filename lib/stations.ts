export type Station = {
  id: string;
  name: string;
  yomi: string;
  lines: string[];
};

export type Route = {
  minutes: number;
  transfers: number;
  fare: number;
  path: string[];
  lines: string[];
};

export type MemberRoute = {
  memberId: string;
  route: Route;
};

export type SearchResult = {
  candId: string;
  candName: string;
  routes: MemberRoute[];
  total: number;
  avg: number;
  std: number;
  fairness: number;
  totalFare: number;
  maxTransfers: number;
  tags: string[];
};

export type Member = {
  id: string;
  stationId: string | null;
};

export type Candidate = {
  id: string;
  stationId: string | null;
};

export const FALLBACK_STATIONS: Station[] = [
  { id: 'shinjuku',   name: '新宿',       yomi: 'しんじゅく',          lines: ['JR山手線','JR中央線','小田急','京王','丸ノ内線','大江戸線'] },
  { id: 'shibuya',    name: '渋谷',       yomi: 'しぶや',              lines: ['JR山手線','東急東横線','田園都市線','銀座線','半蔵門線','副都心線'] },
  { id: 'tokyo',      name: '東京',       yomi: 'とうきょう',          lines: ['JR山手線','JR東海道線','JR中央線','丸ノ内線'] },
  { id: 'ikebukuro',  name: '池袋',       yomi: 'いけぶくろ',          lines: ['JR山手線','東武東上線','西武池袋線','丸ノ内線','有楽町線','副都心線'] },
  { id: 'shinagawa',  name: '品川',       yomi: 'しながわ',            lines: ['JR山手線','JR東海道線','京急本線'] },
  { id: 'ueno',       name: '上野',       yomi: 'うえの',              lines: ['JR山手線','JR京浜東北線','銀座線','日比谷線'] },
  { id: 'akihabara',  name: '秋葉原',     yomi: 'あきはばら',          lines: ['JR山手線','JR総武線','日比谷線','つくばエクスプレス'] },
  { id: 'yurakucho',  name: '有楽町',     yomi: 'ゆうらくちょう',      lines: ['JR山手線','有楽町線'] },
  { id: 'meguro',     name: '目黒',       yomi: 'めぐろ',              lines: ['JR山手線','東急目黒線','南北線','三田線'] },
  { id: 'ebisu',      name: '恵比寿',     yomi: 'えびす',              lines: ['JR山手線','日比谷線'] },
  { id: 'harajuku',   name: '原宿',       yomi: 'はらじゅく',          lines: ['JR山手線'] },
  { id: 'yotsuya',    name: '四ツ谷',     yomi: 'よつや',              lines: ['JR中央線','丸ノ内線','南北線'] },
  { id: 'iidabashi',  name: '飯田橋',     yomi: 'いいだばし',          lines: ['JR中央線','東西線','南北線','有楽町線','大江戸線'] },
  { id: 'roppongi',   name: '六本木',     yomi: 'ろっぽんぎ',          lines: ['日比谷線','大江戸線'] },
  { id: 'omotesando', name: '表参道',     yomi: 'おもてさんどう',      lines: ['銀座線','千代田線','半蔵門線'] },
  { id: 'aoyama',     name: '青山一丁目', yomi: 'あおやまいっちょうめ', lines: ['銀座線','半蔵門線','大江戸線'] },
  { id: 'nakameguro', name: '中目黒',     yomi: 'なかめぐろ',          lines: ['東急東横線','日比谷線'] },
  { id: 'jiyugaoka',  name: '自由が丘',   yomi: 'じゆうがおか',        lines: ['東急東横線','大井町線'] },
  { id: 'kichijoji',  name: '吉祥寺',     yomi: 'きちじょうじ',        lines: ['JR中央線','京王井の頭線'] },
  { id: 'nakano',     name: '中野',       yomi: 'なかの',              lines: ['JR中央線','東西線'] },
  { id: 'koenji',     name: '高円寺',     yomi: 'こうえんじ',          lines: ['JR中央線'] },
  { id: 'kawasaki',   name: '川崎',       yomi: 'かわさき',            lines: ['JR東海道線','JR京浜東北線'] },
  { id: 'yokohama',   name: '横浜',       yomi: 'よこはま',            lines: ['JR東海道線','東急東横線','京急本線','みなとみらい線'] },
  { id: 'omiya',      name: '大宮',       yomi: 'おおみや',            lines: ['JR京浜東北線','JR埼京線','東武野田線'] },
  { id: 'tachikawa',  name: '立川',       yomi: 'たちかわ',            lines: ['JR中央線','JR南武線'] },
  { id: 'machida',    name: '町田',       yomi: 'まちだ',              lines: ['JR横浜線','小田急小田原線'] },
  { id: 'kashiwa',    name: '柏',         yomi: 'かしわ',              lines: ['JR常磐線','東武野田線'] },
  { id: 'funabashi',  name: '船橋',       yomi: 'ふなばし',            lines: ['JR総武線','東武野田線','京成本線'] },
  { id: 'chiba',      name: '千葉',       yomi: 'ちば',                lines: ['JR総武線','京成千葉線'] },
  { id: 'ofuna',      name: '大船',       yomi: 'おおふな',            lines: ['JR東海道線','JR横須賀線'] },
];

// Keep STATIONS as an alias so Storybook/test imports don't break until migrated
export const STATIONS = FALLBACK_STATIONS;

export const STATION_TAGS: Record<string, string[]> = {
  shinjuku:   ['居酒屋多数','カフェ','映画館','ターミナル','商業施設'],
  shibuya:    ['カフェ','若者向け','商業施設','レストラン','ナイトライフ'],
  tokyo:      ['丸の内','ビジネス街','商業施設','落ち着いた'],
  ikebukuro:  ['居酒屋多数','商業施設','カラオケ','ターミナル'],
  shinagawa:  ['ビジネス街','ホテル','落ち着いた'],
  ueno:       ['美術館','公園','居酒屋','下町風情'],
  akihabara:  ['ガジェット','カフェ','メイド喫茶','カジュアル'],
  yurakucho:  ['ビジネス','ガード下居酒屋','劇場','落ち着いた'],
  meguro:     ['カフェ','ビストロ','落ち着いた','大人向け'],
  ebisu:      ['カフェ','ビストロ','大人向け','おしゃれ'],
  harajuku:   ['カフェ','若者向け','ファッション'],
  yotsuya:    ['静か','ビジネス','落ち着いた'],
  iidabashi:  ['居酒屋','学生街','カジュアル'],
  roppongi:   ['バー','ナイトライフ','レストラン','大人向け'],
  omotesando: ['カフェ','ファッション','おしゃれ','大人向け'],
  aoyama:     ['カフェ','ビジネス','落ち着いた','おしゃれ'],
  nakameguro: ['カフェ','ビストロ','おしゃれ','大人向け'],
  jiyugaoka:  ['カフェ','スイーツ','落ち着いた','おしゃれ'],
  kichijoji:  ['居酒屋','カフェ','公園','カジュアル'],
  nakano:     ['居酒屋','サブカル','カジュアル'],
  koenji:     ['居酒屋','古着','カジュアル','下町'],
  kawasaki:   ['商業施設','居酒屋'],
  yokohama:   ['商業施設','レストラン','ターミナル','観光'],
  omiya:      ['商業施設','居酒屋','ターミナル'],
  tachikawa:  ['商業施設','カフェ'],
  machida:    ['商業施設','居酒屋'],
  kashiwa:    ['商業施設','居酒屋'],
  funabashi:  ['商業施設','居酒屋'],
  chiba:      ['商業施設','落ち着いた'],
  ofuna:      ['静か','落ち着いた'],
};

type Edge = [string, string, number, string];

const EDGES: Edge[] = [
  ['shinjuku','harajuku',3,'JR山手線'],
  ['harajuku','shibuya',2,'JR山手線'],
  ['shibuya','ebisu',2,'JR山手線'],
  ['ebisu','meguro',3,'JR山手線'],
  ['meguro','shinagawa',6,'JR山手線'],
  ['shinagawa','tokyo',8,'JR山手線'],
  ['tokyo','yurakucho',2,'JR山手線'],
  ['yurakucho','akihabara',5,'JR山手線'],
  ['akihabara','ueno',4,'JR山手線'],
  ['ueno','ikebukuro',12,'JR山手線'],
  ['ikebukuro','shinjuku',7,'JR山手線'],
  ['shinjuku','yotsuya',5,'JR中央線'],
  ['yotsuya','iidabashi',3,'JR中央線'],
  ['iidabashi','tokyo',8,'JR中央線'],
  ['shinjuku','nakano',4,'JR中央線'],
  ['nakano','koenji',2,'JR中央線'],
  ['koenji','kichijoji',8,'JR中央線'],
  ['kichijoji','tachikawa',18,'JR中央線'],
  ['shibuya','nakameguro',3,'東急東横線'],
  ['nakameguro','jiyugaoka',5,'東急東横線'],
  ['jiyugaoka','yokohama',18,'東急東横線'],
  ['ebisu','roppongi',4,'日比谷線'],
  ['roppongi','akihabara',14,'日比谷線'],
  ['nakameguro','roppongi',7,'日比谷線'],
  ['shibuya','omotesando',2,'銀座線'],
  ['omotesando','aoyama',2,'銀座線'],
  ['aoyama','tokyo',9,'半蔵門線'],
  ['roppongi','aoyama',3,'大江戸線'],
  ['aoyama','iidabashi',8,'大江戸線'],
  ['shinagawa','kawasaki',8,'JR東海道線'],
  ['kawasaki','yokohama',8,'JR東海道線'],
  ['yokohama','ofuna',18,'JR東海道線'],
  ['tokyo','ueno',6,'JR京浜東北線'],
  ['ikebukuro','omiya',24,'JR埼京線'],
  ['shinjuku','machida',32,'小田急小田原線'],
  ['akihabara','funabashi',24,'JR総武線'],
  ['funabashi','chiba',22,'JR総武線'],
  ['ueno','kashiwa',26,'JR常磐線'],
  ['kawasaki','tachikawa',38,'JR南武線'],
  ['yokohama','machida',26,'JR横浜線'],
];

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

type GraphNode = { to: string; m: number; line: string };

function buildGraph(): Record<string, GraphNode[]> {
  const graph: Record<string, GraphNode[]> = {};
  EDGES.forEach(([a, b, m, line]) => {
    (graph[a] = graph[a] || []).push({ to: b, m, line });
    (graph[b] = graph[b] || []).push({ to: a, m, line });
  });
  return graph;
}

const FALLBACK_GRAPH = buildGraph();

export function findRoute(fromId: string, toId: string, graph?: Record<string, GraphNode[]>): Route | null {
  const g = graph ?? FALLBACK_GRAPH;
  if (fromId === toId) return { minutes: 0, transfers: 0, fare: 0, path: [fromId], lines: [] };

  type QueueItem = { id: string; line: string | null; time: number; transfers: number; path: string[]; lines: string[] };
  const best: Record<string, number> = {};
  const queue: QueueItem[] = [{ id: fromId, line: null, time: 0, transfers: 0, path: [fromId], lines: [] }];

  let result: QueueItem | null = null;
  let iters = 0;
  while (queue.length && iters < 5000) {
    iters++;
    queue.sort((a, b) => a.time - b.time);
    const cur = queue.shift()!;

    if (cur.id === toId) {
      if (!result || cur.time < result.time) result = cur;
      continue;
    }
    if (result && cur.time >= result.time) continue;

    const key = cur.id + '|' + (cur.line || '');
    if (best[key] !== undefined && best[key] <= cur.time) continue;
    best[key] = cur.time;

    for (const e of (g[cur.id] || [])) {
      const transferPenalty = (cur.line && cur.line !== e.line) ? 5 : 0;
      const t = cur.time + e.m + transferPenalty;
      const tr = cur.transfers + (cur.line && cur.line !== e.line ? 1 : 0);
      queue.push({ id: e.to, line: e.line, time: t, transfers: tr, path: [...cur.path, e.to], lines: [...cur.lines, e.line] });
    }
  }

  if (!result) return null;
  return { minutes: result.time, transfers: result.transfers, fare: estimateFare(result.time), path: result.path, lines: result.lines };
}

export function searchMeetingPoints(memberStations: string[], candidateIds: string[], stations?: Station[]): SearchResult[] {
  const stationList = stations ?? FALLBACK_STATIONS;
  const candidates = candidateIds.length > 0 ? candidateIds : stationList.map(s => s.id);
  const results: SearchResult[] = [];

  for (const candId of candidates) {
    const routes = memberStations.map(memberId => ({ memberId, route: findRoute(memberId, candId) }));
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
      candId, candName: stationList.find(s => s.id === candId)?.name ?? candId,
      routes: validRoutes, total, avg, std, fairness, totalFare, maxTransfers,
      tags: STATION_TAGS[candId] ?? [],
    });
  }

  results.sort((a, b) => {
    const sa = a.total + (100 - a.fairness) * 0.5;
    const sb = b.total + (100 - b.fairness) * 0.5;
    return sa - sb;
  });

  return results;
}

export function getStationById(id: string, stations?: Station[]): Station | undefined {
  return (stations ?? FALLBACK_STATIONS).find(s => s.id === id);
}
