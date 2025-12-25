import { getRoutesDataFromDBFilePath } from "./planetRouteService";
import { Route } from "../types/db.types";
import { MillenniumFalconData } from "../types/config.types";
import { paths } from "../config/config";
import fs from "fs";

let routesCache: Route[] | null = null;
let millenniumFalconDataCache: MillenniumFalconData | null = null;

/**
 * Reads the database for Routes on the start of the Node server.
 * Caches it so we don"t have to load it again on API calls.
 * 
 * @returns List of all Routes from databse provided in Millennium Falcon Json.
 */
export function getCachedRoutes(): Route[] {
  if (!routesCache) {
    routesCache = getRoutesDataFromDBFilePath(paths.millenniumFalconJson, getCachedMillenniumFalconData().routes_db);
  }
  return routesCache!;
}

/**
 * Reads the contents of Millennium Falcon Json. on the start of the Node server.
 * 
 * @returns MillenniumFalconData 
 */
export function getCachedMillenniumFalconData(): MillenniumFalconData {
    if (millenniumFalconDataCache === null) {
        const data = fs.readFileSync(paths.millenniumFalconJson, "utf-8");
        millenniumFalconDataCache = JSON.parse(data);
    }
    return millenniumFalconDataCache!;
}