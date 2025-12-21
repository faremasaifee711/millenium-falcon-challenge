import { db } from "./db";

// List all tables
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table';`).all();
console.log("Tables in universe.db:", tables);

// Query a specific table
const routes = db.prepare(`SELECT * FROM routes LIMIT 10`).all();
console.log("First 10 routes:", routes);