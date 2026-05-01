import 'server-only';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'gtfs.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS stops (
      stop_id TEXT PRIMARY KEY,
      stop_name TEXT NOT NULL,
      stop_lat REAL,
      stop_lon REAL,
      parent_station TEXT,
      operator TEXT
    );

    CREATE TABLE IF NOT EXISTS stop_lines (
      stop_id TEXT NOT NULL,
      line_name TEXT NOT NULL,
      PRIMARY KEY (stop_id, line_name)
    );

    CREATE TABLE IF NOT EXISTS route_edges (
      from_stop TEXT NOT NULL,
      to_stop TEXT NOT NULL,
      line_name TEXT NOT NULL,
      minutes REAL NOT NULL,
      PRIMARY KEY (from_stop, to_stop, line_name)
    );

    CREATE INDEX IF NOT EXISTS idx_edges_from ON route_edges(from_stop);

    CREATE TABLE IF NOT EXISTS import_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      stop_count INTEGER DEFAULT 0,
      edge_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      error TEXT
    );
  `);

  return _db;
}
