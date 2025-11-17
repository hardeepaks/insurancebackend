
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database("portal.db");

app.use(session({
  secret: "replace_me",
  resave: false,
  saveUninitialized: false
}));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        name TEXT
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_number TEXT UNIQUE,
        holder_name TEXT,
        vehicle TEXT,
        premium REAL,
        start_date TEXT,
        end_date TEXT,
        created_by INTEGER
    )`);
});

const authRoutes = require("./routes/auth")(db);
const policyRoutes = require("./routes/policies")(db);

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
