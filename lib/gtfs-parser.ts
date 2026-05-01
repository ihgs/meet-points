import 'server-only';
import AdmZip from 'adm-zip';

export type ParsedStop = {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  parent_station: string;
};

export type ParsedEdge = {
  from_stop: string;
  to_stop: string;
  line_name: string;
  minutes: number;
};

function timeToMinutes(t: string): number {
  const [h, m, s] = t.split(':').map(Number);
  return h * 60 + m + (s ?? 0) / 60;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = fields[idx]?.trim() ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // quoted field
      let val = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          val += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          val += line[i++];
        }
      }
      fields.push(val);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

export async function fetchAndParseGtfs(url: string, operatorName: string): Promise<{
  stops: ParsedStop[];
  edges: ParsedEdge[];
  stopLines: { stop_id: string; line_name: string }[];
}> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buf);

  const readEntry = (name: string): string | null => {
    const entry = zip.getEntry(name);
    if (!entry) return null;
    return zip.readAsText(entry);
  };

  // Parse stops
  const stopsText = readEntry('stops.txt');
  if (!stopsText) throw new Error('stops.txt not found in GTFS zip');
  const stopsRaw = parseCsv(stopsText);
  const stops: ParsedStop[] = stopsRaw.map(r => ({
    stop_id: r['stop_id'] ?? '',
    stop_name: r['stop_name'] ?? '',
    stop_lat: parseFloat(r['stop_lat'] ?? '0'),
    stop_lon: parseFloat(r['stop_lon'] ?? '0'),
    parent_station: r['parent_station'] ?? '',
  })).filter(s => s.stop_id);

  // Parse routes
  const routesText = readEntry('routes.txt');
  if (!routesText) throw new Error('routes.txt not found in GTFS zip');
  const routesRaw = parseCsv(routesText);
  const routeIdToName: Record<string, string> = {};
  for (const r of routesRaw) {
    const name = r['route_long_name'] || r['route_short_name'] || r['route_id'] || '';
    routeIdToName[r['route_id']] = name;
  }

  // Parse trips
  const tripsText = readEntry('trips.txt');
  if (!tripsText) throw new Error('trips.txt not found in GTFS zip');
  const tripsRaw = parseCsv(tripsText);
  const tripToRoute: Record<string, string> = {};
  for (const t of tripsRaw) {
    tripToRoute[t['trip_id']] = t['route_id'];
  }

  // Parse stop_times
  const stopTimesText = readEntry('stop_times.txt');
  if (!stopTimesText) throw new Error('stop_times.txt not found in GTFS zip');
  const stopTimesRaw = parseCsv(stopTimesText);

  // Group by trip_id
  const tripStops: Record<string, { stop_id: string; departure_time: string; stop_sequence: number }[]> = {};
  for (const st of stopTimesRaw) {
    const tripId = st['trip_id'];
    if (!tripId) continue;
    if (!tripStops[tripId]) tripStops[tripId] = [];
    tripStops[tripId].push({
      stop_id: st['stop_id'] ?? '',
      departure_time: st['departure_time'] ?? st['arrival_time'] ?? '',
      stop_sequence: parseInt(st['stop_sequence'] ?? '0', 10),
    });
  }

  // Build edge accumulator: key = "from|to|line" -> array of minutes
  const edgeAccum: Record<string, number[]> = {};
  const stopLineSet = new Set<string>();

  for (const [tripId, stops_] of Object.entries(tripStops)) {
    const routeId = tripToRoute[tripId];
    if (!routeId) continue;
    const lineName = routeIdToName[routeId] ?? routeId;

    // Sort by stop_sequence
    const sorted = stops_.slice().sort((a, b) => a.stop_sequence - b.stop_sequence);

    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const next = sorted[i + 1];
      if (!cur.departure_time || !next.departure_time) continue;

      const fromMin = timeToMinutes(cur.departure_time);
      const toMin = timeToMinutes(next.departure_time);
      const diff = toMin - fromMin;
      if (diff <= 0 || diff > 120) continue; // skip unreasonable values

      const key = `${cur.stop_id}|${next.stop_id}|${lineName}`;
      if (!edgeAccum[key]) edgeAccum[key] = [];
      edgeAccum[key].push(diff);

      stopLineSet.add(`${cur.stop_id}|${lineName}`);
      stopLineSet.add(`${next.stop_id}|${lineName}`);
    }
  }

  // Average edges
  const edges: ParsedEdge[] = [];
  for (const [key, diffs] of Object.entries(edgeAccum)) {
    const [from_stop, to_stop, line_name] = key.split('|');
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    edges.push({ from_stop, to_stop, line_name, minutes: avg });
  }

  const stopLines = Array.from(stopLineSet).map(k => {
    const [stop_id, line_name] = k.split('|');
    return { stop_id, line_name };
  });

  return { stops, edges, stopLines };
}
