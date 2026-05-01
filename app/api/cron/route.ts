import { NextRequest, NextResponse } from 'next/server';
import { fetchKantoStations } from '@/lib/heartrails';
import { importToDb, logImportError } from '@/lib/gtfs-importer';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages: string[] = [];
  try {
    const { stops, edges, stopLines } = await fetchKantoStations((msg) => {
      messages.push(msg);
    });
    const { stopCount, edgeCount } = importToDb(stops, edges, stopLines, 'heartrails', 'HeartRails');
    return NextResponse.json({ ok: true, stopCount, edgeCount, log: messages.slice(-5) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[cron] heartrails failed: ${msg}`);
    logImportError('heartrails', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
