import { Route } from "../models/routes";
import { findAllPathsWithinTimeLimit, evaluatePathWithBountyRules } from "./pathEvaluation";
import { indexBountyHunters } from "./bountyHunterService";
import { getRoutesDataFromDBFilePath } from "./planetRouteService";
import { EmpireData } from "../types/empireData.types";
import { FalconData } from "../types/falconData.types";
import { PathResult } from "../types/pathResult.types";

/**
 * Calculates the maximum probability of mission success given the available
 * routes, Falcon constraints, and Empire (bounty hunter) data.
 *
 * The algorithm:
 * 1. Finds all valid paths from departure to arrival within the Empire countdown.
 * 2. Indexes bounty hunter locations by planet/day for fast lookup.
 * 3. Evaluates each path using bounty encounter rules and Falcon autonomy limits.
 * 4. Tracks and returns the highest achievable success probability.
 *
 * @param routes - All available hyperspace routes between planets
 * @param falconData - Falcon constraints such as departure, arrival, and autonomy
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
 *   falconData,
 *   empireData
 * );
 *
 * console.log(probability); // e.g. 87
 * ```
 */
export function calculateFinalProbability (
    routes: Route[],
    falconData: FalconData,
    empireData: EmpireData
): number {
    const paths: PathResult[] = findAllPathsWithinTimeLimit(routes, falconData.departure, falconData.arrival, empireData.countdown);
    const bountyHunters = empireData.bounty_hunters;
    const bountyIndex = indexBountyHunters(bountyHunters);

    let bestProbability = 0;

    for (const p of paths) {
        const successProbability = evaluatePathWithBountyRules(
            p.path,
            falconData.autonomy,
            empireData.countdown,
            bountyIndex,
            routes,
            bestProbability
        );

        bestProbability = Math.max(bestProbability, successProbability);
    }

    return bestProbability * 100;
}

export function calculateOdds (
    falconFilePath: string,
    falconData: FalconData,
    empireData: EmpireData
): number {
    const routes : Route[] = getRoutesDataFromDBFilePath(falconFilePath, falconData.routes_db);
    return calculateFinalProbability(routes, falconData, empireData);
}