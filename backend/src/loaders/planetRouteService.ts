
import { Route } from "../types/db.types";
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
export function getAllRoutesData(inputDb: any) : Route[] {
    // Query Routes table
    const statement = inputDb.prepare("SELECT * FROM routes");
    const rawRows: any[] = statement.all();

    const routes : Route[] = rawRows.map(row => ({
        origin: row.origin,
        destination: row.destination,
        travelTime: row.travel_time
    }));

    return routes;
  
}

/**
 * Loads route data from a database file located relative to
 * a provided Falcon configuration file path.
 *
 * @param millenniumFalconFilePath - Path to the Millennium Falcon config file (can be absolute or relative)
 * @param dbName - Name of the database file to load
 * @returns An array of Route objects from the specified database
 *
 * @throws Error if the database file does not exist
 *
 * @remarks
 * - Resolves the DB path relative to the Falcon file directory
 * - Opens the database in read mode and logs queries if verbose
 */
export function getRoutesDataFromDBFilePath(millenniumFalconFilePath: string, dbName: string) : Route[] {
    const millenniumFalconDir = path.dirname(
        path.resolve(process.cwd(), millenniumFalconFilePath)
    );
    const dbPath = path.resolve(
        millenniumFalconDir,
        dbName
    );
    if (!fs.existsSync(dbPath)) {
        throw new Error("DB file does not exist ---- " + millenniumFalconDir + "-----" + dbName);
    }
    // Connect to the database
    const inputDb = new Database(dbPath);
  
    return getAllRoutesData(inputDb);
}
  