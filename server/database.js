const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'AkuKaya.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS pockets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    platform TEXT NOT NULL,
    instrument TEXT NOT NULL,
    frequency TEXT NOT NULL,
    routine_amount REAL NOT NULL,
    estimated_date DATETIME,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS pocket_savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pocket_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (pocket_id) REFERENCES pockets(id) ON DELETE CASCADE
  );
`);

module.exports = db;
