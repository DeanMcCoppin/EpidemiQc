import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'epidemiqc.db');

// Create SQLite database connection
export const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ SQLite Database connected:', dbPath);

// Query wrapper to match PostgreSQL interface
export const query = async (text: string, params?: any[]) => {
  try {
    const stmt = db.prepare(text);

    // Convert PostgreSQL $1, $2 syntax to ? syntax
    const sqliteQuery = text.replace(/\$(\d+)/g, '?');
    const sqliteStmt = db.prepare(sqliteQuery);

    // Determine if it's a SELECT query
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
      const rows = params ? sqliteStmt.all(...params) : sqliteStmt.all();
      return {
        rows,
        rowCount: rows.length,
      };
    } else {
      const info = params ? sqliteStmt.run(...params) : sqliteStmt.run();
      return {
        rows: [],
        rowCount: info.changes,
      };
    }
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};

// Pool-like interface for compatibility
export const pool = {
  query,
  connect: async () => ({
    query,
    release: () => {},
  }),
  end: () => db.close(),
};
