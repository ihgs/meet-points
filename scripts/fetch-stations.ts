// Usage: npx tsx scripts/fetch-stations.ts
import { fetchKantoStations } from '../lib/heartrails';
import { importToDb, logImportError } from '../lib/gtfs-importer';

async function main() {
  console.log('HeartRails Express から関東の駅データを取得します...');
  const start = Date.now();

  try {
    const { stops, edges, stopLines } = await fetchKantoStations((msg) => {
      process.stdout.write(`\r${msg}`.padEnd(80));
    });
    process.stdout.write('\n');

    const { stopCount, edgeCount } = importToDb(stops, edges, stopLines, 'heartrails', 'HeartRails');
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`完了: ${stopCount} 駅, ${edgeCount} エッジ (${elapsed}s)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`エラー: ${msg}`);
    try {
      logImportError('heartrails', msg);
    } catch {
      // DB未初期化の場合は無視
    }
    process.exit(1);
  }
}

main();
