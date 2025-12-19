import Database from "better-sqlite3";
import { paths } from "../config/config";

// Connect to the database
const db = new Database(paths.db, { verbose: console.log });

export default db;