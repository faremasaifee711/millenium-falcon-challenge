import { Route } from "../models/routes";
import { PathResult, findAllPaths, evaluatePathWithBountyRules } from "./pathEvaluation";
import { BountyHunter, indexBountyHunters } from "./bountyHunterService"
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";


interface FalconData {
    autonomy: number,
    departure: string,
    arrival: string,
    routes_db: string
}

interface EmpireData {
    countdown: number,
    bounty_hunters: BountyHunter[]
}

export function getRoutesDataFromDB(falconFilePath: string, dbName: string) : Route[] {
    const falconDir = path.dirname(
        path.resolve(process.cwd(), falconFilePath)
    );
    const dbPath = path.resolve(
        falconDir,
        dbName
    );
    if (!fs.existsSync(dbPath)) {
        throw new Error("DB file does not exist");
    }
    // Connect to the database
    const inputDb = new Database(dbPath, { verbose: console.log });
  
    const tables = inputDb.prepare(`SELECT name FROM sqlite_master WHERE type='table';`).all();
    console.log("Tables in universe.db:", tables);

    // Query a specific table
    const stmt = inputDb.prepare("SELECT * FROM routes");
    const rawRows: any[] = stmt.all();

    const routes : Route[] = rawRows.map(row => ({
        origin: row.origin,       // match your DB column names
        destination: row.destination,
        travel_time: row.travel_time
    }));

    return routes;
}

export function calculateOdds (
    falconFilePath: string,
    falconData: FalconData,
    empireData: EmpireData
): number {
    
    const routes : Route[] = getRoutesDataFromDB(falconFilePath, falconData.routes_db);
    console.log(routes);

    return calculateFinalProbability(routes, falconData, empireData);
}

export function calculateFinalProbability (
    routes: Route[],
    falconData: FalconData,
    empireData: EmpireData
): number {
    const paths: PathResult[] = findAllPaths(routes, falconData.departure, falconData.arrival);
    const bountyHunters = empireData.bounty_hunters;
    const bountyIndex = indexBountyHunters(bountyHunters);
    

    let bestProbability = 0;

    for (const p of paths) {

        console.log("current PAth: " + p.path + " - " + p.totalTime);
        // Don't consider path with total travel time more than encounter
        if(p.totalTime <= empireData.countdown) {
        
            const successProbability = evaluatePathWithBountyRules(
                p.path,
                falconData.autonomy,
                empireData.countdown,
                bountyIndex,
                routes
            );
        
            console.log("successProbability" + successProbability);

            bestProbability = Math.max(bestProbability, successProbability);
        }
    }

    return bestProbability * 100;
}