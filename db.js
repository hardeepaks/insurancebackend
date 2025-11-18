const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('portal.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS policies(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    policy_number TEXT,
    vehicle TEXT,
    registration TEXT,
    start_date TEXT,
    end_date TEXT,
    premium REAL,
    cover_level TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT,
    approved_at TEXT
  )`);
});

module.exports = db;
