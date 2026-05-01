// Usage: npx tsx scripts/fetch-gtfs.ts [--source TokyoMetro] [--all]
import { fetchAndParseGtfs } from '../lib/gtfs-parser';
import { importToDb, logImportError } from '../lib/gtfs-importer';
import { getGtfsSources } from '../gtfs.config';

async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const sourceIdx = args.indexOf('--source');
  const sourceName = sourceIdx !== -1 ? args[sourceIdx + 1] : null;

  const allSources = getGtfsSources();

  let targets = allSources;
  if (!allFlag && sourceName) {
    const found = allSources.find(s => s.name === sourceName);
    if (!found) {
      console.error(`Source "${sourceName}" not found. Available: ${allSources.map(s => s.name).join(', ')}`);
      process.exit(1);
    }
    targets = [found];
  } else if (!allFlag && !sourceName) {
    console.error('Usage: npx tsx scripts/fetch-gtfs.ts [--source NAME] [--all]');
    process.exit(1);
  }

  let anyError = false;

  for (const source of targets) {
    console.log(`\n[${source.name}] Fetching from ${source.url.replace(/consumerKey=[^&]+/, 'consumerKey=***')}...`);
    const start = Date.now();
    try {
      const { stops, edges, stopLines } = await fetchAndParseGtfs(source.url, source.operator);
      const { stopCount, edgeCount } = importToDb(stops, edges, stopLines, source.name, source.operator);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`[${source.name}] Done: ${stopCount} stops, ${edgeCount} edges (${elapsed}s)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${source.name}] Error: ${msg}`);
      try {
        logImportError(source.name, msg);
      } catch {
        // DB may not be initialized yet; ignore
      }
      anyError = true;
    }
  }

  if (anyError) process.exit(1);
}

main();
