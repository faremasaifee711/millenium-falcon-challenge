import { Route } from "../../types/db.types";
import { PathResult } from "../../types/internal.types";
import { TravelTimeMap, getTravelTime, buildTravelTimeMap } from "../../utils/TravelTimeMapUtil";

/**
 * Evaluates the success probability of a single travel path while accounting
 * for Millennium Falcon autonomy, Empire countdown constraints, and bounty hunter encounters.
 *
 * The evaluation simulates the journey day by day:
 * - Traveling between planets consumes fuel and time
 * - Refueling costs one full day
 * - Each bounty hunter encounter reduces success probability by 10%
 *
 * The function uses early-exit pruning to skip paths that:
 * - Exceed the Empire countdown
 * - Cannot outperform the current best probability
 *
 * @param path - Ordered list of planets representing a travel path
 * @param autonomy - Maximum number of days the Millennium Falcon can travel without refueling
 * @param countdown - Maximum allowed number of days before mission failure
 * @param bountyHunterDaysByPlanet - Map of planet → set of days when bounty hunters are present
 * @param travelTimeMap - MAp of all planets and their available neighbours with their ditances 
 * @param bestProbability - Current best probability used for pruning inferior paths
 *
 * @returns The success probability as a decimal between 0 and 1
 *
 * @remarks
 * - Each bounty hunter encounter multiplies success probability by 0.9
 * - Refueling may itself trigger an encounter if bounty hunters are present
 * - Paths that exceed countdown or fall below bestProbability are discarded early
 *
 * @example
 * ```ts
 * const probability = calculatePathSuccessProbabilityWithBountyHunters(
 *   ["Tatooine", "Hoth", "Endor"],
 *   6,
 *   7,
 *   bountyIndex,
 *   routes,
 *   0.5
 * );
 *
 * // probability might be 0.81 (two encounters)
 * ```
 */
export function calculatePathSuccessProbabilityWithBountyHunters(
    path: string[],
    autonomy: number,
    countdown: number,
    bountyHunterDaysByPlanet: Map<string, Set<number>>,
    travelTimeMap: TravelTimeMap,
    cutoffProbablity: number
): number {
    console.log("paths: ", path);
    
    let day = 0;
    let fuelAvailability = autonomy;
    let totalBountyHunterEncounters = 0;
    let presentPlanet = path[0];

    const isBountyHunterPresent = (planet: string, day: number) =>
    bountyHunterDaysByPlanet.get(planet)?.has(day) ?? false;

    for (let i = 1; i < path.length; i++) {
        // Travel based on the routes from the DB
        const travelTime = getTravelTime(path[i-1]!, path[i], travelTimeMap);

        // if travelTime > autonomy? This path cannot be possible then.
        if (travelTime > autonomy) return 0;
        
        // Refuel is needed
        if (fuelAvailability === 0 || fuelAvailability < travelTime) {
            // do complete refill in 1 day
            day += 1;
            fuelAvailability = autonomy;

            if (day > countdown) return 0;
            if (isBountyHunterPresent(presentPlanet, day)) totalBountyHunterEncounters++;
        }

        day += travelTime;
        fuelAvailability -= travelTime;

        presentPlanet = path[i];

        if (day > countdown || Math.pow(0.9, totalBountyHunterEncounters) < cutoffProbablity) return 0;
        if (isBountyHunterPresent(presentPlanet, day)) totalBountyHunterEncounters++;
    }
    console.log("paths encounters ", totalBountyHunterEncounters);
    
    // Success probability = (0.9)^k
    return Math.pow(0.9, totalBountyHunterEncounters);
}

/**
 * 
 * Paths exceeding the Empire countdown are discarded
 * 
 * @param routes  - All available hyperspace routes between planets
 * @param originPlanet - Planet on which Millienium Falcon is present on Day 0
 * @param destinationPlanet - Planet on which Millienium Falcon want to go
 * @param countDown - number of days to filter paths on
 * 
 * @returns PathResult - List of paths from originPlanet to destinationPlanet
 */
export function findAllPathsWithinCountdown(
    routes: Route[],
    originPlanet: string,
    destinationPlanet: string,
    countDown: number
): PathResult[] {
    const travelTimeMap: TravelTimeMap = buildTravelTimeMap(routes);
    const possiblePaths: PathResult[] = [];
  
    function depthFirstSearch(
        currentPlanet: string,
        visitedPlanets: Set<string>,
        currentPath: string[],
        daysElapsed: number
    ) {
        if (currentPlanet === destinationPlanet) {
            possiblePaths.push({ path: [...currentPath], durationInDays: daysElapsed });
            return;
        }

        const neighbors = travelTimeMap.get(currentPlanet);
        if (!neighbors) return;
  
        for (const [nextPlanet, travelTime] of neighbors.entries()) {
            if (!visitedPlanets.has(nextPlanet)) {
                visitedPlanets.add(nextPlanet);
                currentPath.push(nextPlanet);
        
                // prune branch early if limit is not met
                if(daysElapsed + travelTime <= countDown) {
                    depthFirstSearch(
                        nextPlanet,
                        visitedPlanets,
                        currentPath,
                        daysElapsed + travelTime
                    );
                }
                
                currentPath.pop();
                visitedPlanets.delete(nextPlanet);
            }
        }
    }
    
    depthFirstSearch(originPlanet, new Set([originPlanet]), [originPlanet], 0);
    return possiblePaths;
}

