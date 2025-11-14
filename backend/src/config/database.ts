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
const database = new Database(dbPath);

// Enable foreign keys
database.pragma('foreign_keys = ON');

console.log('✅ Database connected');

// Query wrapper to match PostgreSQL interface
export const query = async (text: string, params?: any[]) => {
  try {
    // Convert PostgreSQL $1, $2 syntax to ? syntax
    let sqliteQuery = text;
    if (params && params.length > 0) {
      sqliteQuery = text.replace(/\$\d+/g, '?');
    }

    // Determine if it's a SELECT query
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
    const isInsert = sqliteQuery.trim().toUpperCase().includes('RETURNING');

    const stmt = database.prepare(sqliteQuery);

    if (isSelect) {
      const rows = params ? stmt.all(...params) : stmt.all();
      return {
        rows,
        rowCount: rows.length,
      };
    } else if (isInsert) {
      // Handle INSERT ... RETURNING
      const cleanQuery = sqliteQuery.replace(/RETURNING.*/i, '');
      const stmt2 = database.prepare(cleanQuery);
      const info = params ? stmt2.run(...params) : stmt2.run();

      // Get the inserted row
      const idStmt = database.prepare('SELECT * FROM ' + extractTableName(cleanQuery) + ' WHERE id = ?');
      const row = idStmt.get(info.lastInsertRowid);

      return {
        rows: row ? [row] : [],
        rowCount: info.changes,
      };
    } else {
      const info = params ? stmt.run(...params) : stmt.run();
      return {
        rows: [],
        rowCount: info.changes,
      };
    }
  } catch (error: any) {
    console.error('SQLite query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// Extract table name from INSERT query
function extractTableName(query: string): string {
  const match = query.match(/INSERT INTO\s+(\w+)/i);
  return match ? match[1] : '';
}

// Pool-like interface for compatibility
export const pool = {
  query,
  connect: async () => ({
    query,
    release: () => {},
  }),
  end: () => database.close(),
  on: (event: string, callback: Function) => {
    if (event === 'connect') {
      callback();
    }
  },
};
