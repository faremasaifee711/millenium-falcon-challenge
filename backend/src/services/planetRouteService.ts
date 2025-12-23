import { db as defaultDtabase } from "../db/db";
import { Route } from "../models/routes";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * Reads all route records from the given database and maps them
 * into an array of Route domain objects.
 *
 * @param inputDb - An open database connection instance
 * @returns An array of Route objects fetched from the database
 *
 * @remarks
 * - Expects a table named `routes`
 * - Column names must match: origin, destination, travel_time
 */
export function getRoutesDataToDB(inputDb: any) : Route[] {
    // Query Routes table
    const stmt = inputDb.prepare("SELECT * FROM routes");
    const rawRows: any[] = stmt.all();

    const routes : Route[] = rawRows.map(row => ({
        origin: row.origin,       // match your DB column names
        destination: row.destination,
        travel_time: row.travel_time
    }));

    return routes;
  
}

/**
 * Initializes and retrieves the default routes data from
 * the application's default database.
 *
 * @returns An array of Route objects from the default database
 *
 * @remarks
 * - Uses the globally configured `defaultDtabase` via DATA_DIR env variable
 */
export function initializeDefaultRoutes() : Route[] {
    return getRoutesDataToDB(defaultDtabase);
}

/**
 * Loads route data from a database file located relative to
 * a provided Falcon configuration file path.
 *
 * @param falconFilePath - Path to the Falcon config file
 * @param dbName - Name of the database file to load
 * @returns An array of Route objects from the specified database
 *
 * @throws Error if the database file does not exist
 *
 * @remarks
 * - Resolves the DB path relative to the Falcon file directory
 * - Opens the database in read mode and logs queries if verbose
 */
export function getRoutesDataFromDBFilePath(falconFilePath: string, dbName: string) : Route[] {
    const falconDir = path.dirname(
        path.resolve(process.cwd(), falconFilePath)
    );
    const dbPath = path.resolve(
        falconDir,
        dbName
    );
    if (!fs.existsSync(dbPath)) {
        throw new Error("DB file does not exist ---- " + falconDir + "-----" + dbName);
    }
    // Connect to the database
    const inputDb = new Database(dbPath, { verbose: console.log });
  
    return getRoutesDataToDB(inputDb);
}
  