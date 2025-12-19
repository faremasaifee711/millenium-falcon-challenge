import db from "../db/db";
import { Route } from "../models/routes";

// Add Routes data to DB
export function addRoutesDataToDB() : Route[] {
  
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table';`).all();
    console.log("Tables in universe.db:", tables);

    // Query a specific table
    const stmt = db.prepare("SELECT * FROM routes");
    const rawRows: any[] = stmt.all();

    const routes : Route[] = rawRows.map(row => ({
        origin: row.origin,       // match your DB column names
        destination: row.destination,
        travel_time: row.travel_time
    }));

    return routes;
  
}



  
//export const graph = buildGraph(routes);