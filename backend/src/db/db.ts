import Database from "better-sqlite3";
import path from "path";

// Path to your existing SQLite DB
const dbPath = path.resolve(__dirname, "universe.db");

// Connect to the database
const db = new Database(dbPath, { verbose: console.log });

export default db;