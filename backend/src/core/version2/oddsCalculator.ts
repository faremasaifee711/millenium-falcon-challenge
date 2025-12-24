import { Route } from "../../types/db.types";
import { findAllPathsWithinCountdown, calculatePathSuccessProbabilityWithBountyHunters } from "../bruteForce/pathEvaluation";
import { buildTravelTimeMap } from "../../utils/TravelTimeMapUtil";
import { getBountyHunterDaysByPlanet } from "../../utils/bountyHunterUtils";
import { getRoutesDataFromDBFilePath } from "../planetRouteService";
import { EmpireData, MillenniumFalconData } from "../../types/config.types";
import { PathResult } from "../../types/internal.types";

/**
 * Calculates the maximum probability of mission success given the available
 * routes, millennium Falcon constraints, and Empire (bounty hunter) data.
 *
 * The algorithm:
 * 1. Finds all valid paths from departure to arrival within the Empire countdown.
 * 2. Indexes bounty hunter locations by planet/day for fast lookup.
 * 3. Evaluates each path using bounty encounter rules and millennium Falcon autonomy limits.
 * 4. Tracks and returns the highest achievable success probability.
 *
 * @param routes - All available hyperspace routes between planets
 * @param millenniumFalconData - Falcon constraints such as departure, arrival, and autonomy
 * @param empireData - Empire constraints including countdown and bounty hunters
 *
 * @returns The highest mission success probability as a percentage (0–100)
 *
 * @remarks
 * - Each bounty hunter encounter reduces success probability
 *
 * @example
 * ```ts
 * const probability = calculateFinalProbability(
 *   routes,
 *   millenniumFalconData,
 *   empireData
 * );
 *
 * console.log(probability); // e.g. 87
 * ```
 */
export function calculateFinalProbability (
    routes: Route[],
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
): number {
    const paths: PathResult[] = findAllPathsWithinCountdown(routes, millenniumFalconData.departure, millenniumFalconData.arrival, empireData.countdown);
    const bountyHunters = empireData.bounty_hunters;
    const bountyIndex = getBountyHunterDaysByPlanet(bountyHunters);
    const travelTimeMap = buildTravelTimeMap(routes);

    let bestProbability = 0;

    for (const p of paths) {
        const successProbability = calculatePathSuccessProbabilityWithBountyHunters(
            p.path,
            millenniumFalconData.autonomy,
            empireData.countdown,
            bountyIndex,
            travelTimeMap,
            bestProbability
        );

        bestProbability = Math.max(bestProbability, successProbability);
    }

    return bestProbability;
}

export function calculateOdds (
    millenniumFalconFilePath: string,
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
): number {
    const routes : Route[] = getRoutesDataFromDBFilePath(millenniumFalconFilePath, millenniumFalconData.routes_db);
    return calculateFinalProbability(routes, millenniumFalconData, empireData);
}