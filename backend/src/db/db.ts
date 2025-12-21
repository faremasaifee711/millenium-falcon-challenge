import Database from "better-sqlite3";
import { paths } from "../config/config";
import { Route } from "../models/routes";

// Connect to the database
export const db = new Database(paths.db, { verbose: console.log });

