import 'server-only';
import type { ParsedStop, ParsedEdge } from './gtfs-importer';

const BASE_URL = 'https://express.heartrails.com/api/json';
const REQUEST_DELAY_MS = 150;

// 対象都県（関東圏）
const PREFECTURES = ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県'];

// バス・非鉄道路線を除外するキーワード
const SKIP_KEYWORDS = ['バス', 'BRT', 'コミュニティ', 'スクール', 'シャトル', 'ループ', 'ライナー（', 'ケーブル'];

type HeartrailsStation = {
  name: string;
  x: string;  // 経度
  y: string;  // 緯度
  prefecture: string;
  line: string;
  postal: string;
  prev: string;
  next: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLines(prefecture: string): Promise<string[]> {
  const url = `${BASE_URL}?method=getLines&prefecture=${encodeURIComponent(prefecture)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`getLines(${prefecture}) failed: ${res.status}`);
  const data = await res.json() as { response: { line?: string[] } };
  return data.response.line ?? [];
}

async function getStationsByLine(line: string): Promise<HeartrailsStation[]> {
  const url = `${BASE_URL}?method=getStations&line=${encodeURIComponent(line)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`getStations(${line}) failed: ${res.status}`);
  const data = await res.json() as { response: { station?: HeartrailsStation[] } };
  return data.response.station ?? [];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 直線距離から所要時間を推定（平均速度 50km/h、線路係数 1.3）
function distanceToMinutes(km: number): number {
  return Math.max(1, Math.round((km * 1.3) / 50 * 60));
}

export async function fetchKantoStations(
  onProgress?: (msg: string) => void,
): Promise<{
  stops: ParsedStop[];
  edges: ParsedEdge[];
  stopLines: { stop_id: string; line_name: string }[];
}> {
  // ─── Phase 1: 路線一覧を取得 ───────────────────────────────────
  const lineSet = new Set<string>();
  for (const pref of PREFECTURES) {
    onProgress?.(`路線取得: ${pref}`);
    try {
      const lines = await getLines(pref);
      for (const line of lines) {
        if (!SKIP_KEYWORDS.some(kw => line.includes(kw))) {
          lineSet.add(line);
        }
      }
    } catch (err) {
      onProgress?.(`警告: ${pref} の路線取得失敗 (${err})`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const allLines = [...lineSet];
  onProgress?.(`対象路線数: ${allLines.length}`);

  // ─── Phase 2: 各路線の駅データを取得 ─────────────────────────
  type Coord = { lat: number; lon: number };
  const coordMap = new Map<string, Coord>();
  const stopLinesMap = new Map<string, Set<string>>();
  const stationsByLine = new Map<string, HeartrailsStation[]>();

  for (let i = 0; i < allLines.length; i++) {
    const lineName = allLines[i];
    onProgress?.(`[${i + 1}/${allLines.length}] ${lineName}`);
    try {
      const stations = await getStationsByLine(lineName);
      stationsByLine.set(lineName, stations);

      for (const st of stations) {
        const lat = parseFloat(st.y);
        const lon = parseFloat(st.x);
        if (isNaN(lat) || isNaN(lon)) continue;

        if (!coordMap.has(st.name)) coordMap.set(st.name, { lat, lon });

        if (!stopLinesMap.has(st.name)) stopLinesMap.set(st.name, new Set());
        stopLinesMap.get(st.name)!.add(lineName);
      }
    } catch (err) {
      onProgress?.(`スキップ: ${lineName} (${err})`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  // ─── Phase 3: エッジグラフを構築 ───────────────────────────────
  // キーを正規化（A-B と B-A を同一視）して重複排除
  const edgeSet = new Set<string>();
  const edges: ParsedEdge[] = [];

  for (const [lineName, stations] of stationsByLine) {
    for (const st of stations) {
      if (!st.next) continue;
      const fromName = st.name;
      const toName = st.next;

      const [a, b] = [fromName, toName].sort();
      const key = `${a}|${b}|${lineName}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);

      const fromCoord = coordMap.get(fromName);
      const toCoord = coordMap.get(toName);
      if (!fromCoord || !toCoord) continue;

      const km = haversineKm(fromCoord.lat, fromCoord.lon, toCoord.lat, toCoord.lon);
      edges.push({ from_stop: fromName, to_stop: toName, line_name: lineName, minutes: distanceToMinutes(km) });
    }
  }

  // ─── 結果を整形 ────────────────────────────────────────────────
  const stops: ParsedStop[] = [];
  for (const [name, coord] of coordMap) {
    stops.push({ stop_id: name, stop_name: name, stop_lat: coord.lat, stop_lon: coord.lon, parent_station: '' });
  }

  const stopLines: { stop_id: string; line_name: string }[] = [];
  for (const [stopId, lines] of stopLinesMap) {
    for (const line of lines) {
      stopLines.push({ stop_id: stopId, line_name: line });
    }
  }

  onProgress?.(`完了: ${stops.length} 駅, ${edges.length} エッジ`);
  return { stops, edges, stopLines };
}
