const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('portal.db');

db.serialize(() => {

  // USERS TABLE
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )`);

  // POLICIES TABLE (full new schema)
  db.run(`CREATE TABLE IF NOT EXISTS policies(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    policy_number TEXT,

    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_engine TEXT,
    vehicle_year TEXT,

    vehicle TEXT,
    registration TEXT,

    start_date TEXT,
    end_date TEXT,
    duration_days INTEGER,

    estimated_premium REAL,
    cover_level TEXT,

    first_name TEXT,
    last_name TEXT,
    dob TEXT,
    phone TEXT,

    occupation TEXT,
    licence_number TEXT,
    address TEXT,
    postcode TEXT,
    card_ending TEXT,

    status TEXT DEFAULT 'pending',
    created_at TEXT,
    approved_at TEXT
  )`);

});

module.exports = db;
