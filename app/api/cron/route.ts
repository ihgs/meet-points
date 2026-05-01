import { NextRequest, NextResponse } from 'next/server';
import { getGtfsSources } from '@/gtfs.config';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sources = getGtfsSources();
  const results: { name: string; stopCount?: number; edgeCount?: number; error?: string }[] = [];

  for (const source of sources) {
    try {
      const { fetchAndParseGtfs } = await import('@/lib/gtfs-parser');
      const { importToDb } = await import('@/lib/gtfs-importer');
      const { stops, edges, stopLines } = await fetchAndParseGtfs(source.url, source.operator);
      const { stopCount, edgeCount } = importToDb(stops, edges, stopLines, source.name, source.operator);
      results.push({ name: source.name, stopCount, edgeCount });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron] ${source.name} failed: ${msg}`);
      results.push({ name: source.name, error: msg });
    }
  }

  return NextResponse.json({ ok: true, results });
}
