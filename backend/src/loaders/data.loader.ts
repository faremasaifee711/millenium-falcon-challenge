import { getRoutesDataFromDBFilePath } from "../core/planetRouteService";
import { Route } from "../types/db.types";
import { MillenniumFalconData } from "../types/config.types";
import { paths } from "../config/config";
import fs from "fs";

let routesCache: Route[] | null = null;
let millenniumFalconDataCache: MillenniumFalconData | null = null;

export function getCachedRoutes(): Route[] {
  if (!routesCache) {
    routesCache = getRoutesDataFromDBFilePath(paths.millenniumFalconJson, getCachedMillenniumFalconData().routes_db);
  }
  return routesCache!;
}

export function getCachedMillenniumFalconData(): MillenniumFalconData {
    if (millenniumFalconDataCache === null) {
        const data = fs.readFileSync(paths.millenniumFalconJson, "utf-8");
        millenniumFalconDataCache = JSON.parse(data);
    }
    return millenniumFalconDataCache!;
}