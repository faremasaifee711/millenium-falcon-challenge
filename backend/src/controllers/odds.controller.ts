import { calculateFinalProbability } from "../core/optimal/oddsCalculator";
import { OddsRequest, OddsResponse } from "../types/api.types";
import { Route } from "../types/db.types";
import { RequestHandler } from "express";
import { getCachedMillenniumFalconData, getCachedRoutes } from "../loaders/data.loader";

/**
 * POST /api/odds
 *
 * Calculates the maximum probability of mission success based on:
 * - Available hyperspace routes
 * - Millennium Falcon constraints
 * - Empire data provided in the request body
 *
 * This controller:
 * 1. Loads default route data from the database
 * 2. Loads Millennium Falcon configuration data
 * 3. Computes the best achievable success probability
 * 4. Returns the result as a JSON response
 *
 * @param req - Express request containing Empire data in the body
 * @param res - Express response used to return calculated odds
 *
 * @returns JSON response with success flag and calculated odds
 *
 * @example
 * Request body:
 * ```json
 * {
 *   "bounty_hunters": [
 *     { "planet": "Hoth", "day": 6 },
 *     { "planet": "Hoth", "day": 7 }
 *   ],
 *   "countdown": 4
 * }
 * ```
 *
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "odds": 87
 * }
 * ```
 *
 * @remarks
 * - Odds are returned as a percentage (0–100)
 * - Assumes route and Millennium Falcon data are preconfigured and available
 * - Validation of request payload should be handled by middleware
 */
export const postOdds: RequestHandler = (req, res) => {
    const body: OddsRequest = req.body;

    // INIT or load from the cache. 
    // Now routes & falconData are loaded once per server process, not per request.
    const routes : Route[] = getCachedRoutes();
    const millenniumFalconData = getCachedMillenniumFalconData();

    const odds = calculateFinalProbability(routes, millenniumFalconData, body);

    const response: OddsResponse = {
        success: true,
        odds,
    };

    res.json(response);
}