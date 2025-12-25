import { Route } from "../types/db.types";
import { buildTravelTimeMap } from "../utils/TravelTimeMapUtil";
import { getBountyHunterDaysByPlanet } from "../utils/bountyHunterUtils";
import { getRoutesDataFromDBFilePath } from "../loaders/planetRouteService";
import { EmpireData, MillenniumFalconData } from "../types/config.types";

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
 * @return Probability in range [0,1]
 *
 * @remarks
 * - Success probability = 0.9^k where k is minimum encounters
 * - If no valid path exists within countdown, returns 0
 * - Waiting on a planet can avoid encounters but consumes time
 *
 * @example
 * ```ts
 * const probability = calculateFinalProbability(
 *   routes,
 *   millenniumFalconData,
 *   empireData
 * );
 *
 * console.log(probability); // e.g. 0.87
 * ```
 */
export function calculateFinalProbability (
    routes: Route[],
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
): number {
    const { departure , arrival, autonomy } = millenniumFalconData;
    const { countdown, bounty_hunters } = empireData;

    // Build data structures
    const travelTimeMap = buildTravelTimeMap(routes);
    const bountyHunterDaysByPlanet = getBountyHunterDaysByPlanet(bounty_hunters);

    // Extract all unique planets for indexing
    const allPlanets = new Set<string>();
    for (const route of routes) {
        allPlanets.add(route.origin);
        allPlanets.add(route.destination);
    }
    const planetList: string[] = Array.from(allPlanets);
    const planetIndex = new Map<string, number>();
    planetList.forEach((planet, idx) => planetIndex.set(planet, idx));

    const NUM_PLANETS = planetList.length;
    const MAX_DAY = countdown + 1;
    const MAX_FUEL = autonomy + 1;

    const isBountyHunterPresent = (planet: string, day: number) =>
        bountyHunterDaysByPlanet.get(planet)?.has(day) ?? false;

    // 3D Memo: memo[planetIdx][day][fuel] = min encounters to reach this state
    const memo: number[][][] = Array.from({ length: NUM_PLANETS }, 
        () => Array.from({ length: MAX_DAY }, 
            () => Array(MAX_FUEL).fill(Infinity)
        )
    );

    // Priority queue state: [encounters, planet Index, day, fuel]
    interface State {
        encounters: number;
        planetIdx: number;
        day: number;
        fuel: number;
    }

    const priorityQueue: State[] = [];

    // Start state
    const startPlanetIdx = planetIndex.get(departure)!;
    const startEncounters = isBountyHunterPresent(departure, 0) ? 1 : 0;
    
    priorityQueue.push({ 
        encounters: startEncounters, 
        planetIdx: startPlanetIdx, 
        day: 0, 
        fuel: autonomy 
    });
    memo[startPlanetIdx][0][autonomy] = startEncounters;

    let bestProbability = 0;

    while (priorityQueue.length > 0) {
        // Extract min encounters
        priorityQueue.sort((a, b) => a.encounters - b.encounters);
        const { encounters, planetIdx, day, fuel } = priorityQueue.shift()!;

        // Prune if worse path already found
        if (encounters > memo[planetIdx][day][fuel]) continue;

        const planet = planetList[planetIdx];

        // Reached destination
        if (planet === arrival) {
            const prob = Math.pow(0.9, encounters);
            bestProbability = Math.max(prob, bestProbability);
            continue;
        }

        if (day > countdown) continue;

        // Action 1: Travel to neighbors
        const neighbors = travelTimeMap.get(planet);
        if (neighbors) {
            for (const [nextPlanet, travelTime] of neighbors.entries()) {
                // Check if route is possible (travel time <= autonomy)
                if (travelTime > autonomy) {
                    continue; // Impossible route
                }

                let newDay = day;
                let newFuel = fuel;
                let newEncounters = encounters;

                // Check if refueling is needed before travel
                if (newFuel < travelTime) {
                    // Refuel takes 1 day, then travel takes travelTime days
                    // Total days needed: 1 (refuel) + travelTime
                    // Must arrive on or before countdown
                    newDay += 1;
                    if (newDay > countdown) continue;
                    // Check encounter during refuel
                    if (isBountyHunterPresent(planet, newDay)) newEncounters++;
                     // Full tank after refuel
                    newFuel = autonomy;
                }

                // Travel to next planet
                newDay += travelTime;
                // Exceeds countdown (must arrive on or before countdown)
                if (newDay > countdown) continue; 
                newFuel -= travelTime;
                
                // Check encounter upon arrival
                const nextPlanetIdx = planetIndex.get(nextPlanet)!;
                if (isBountyHunterPresent(nextPlanet, newDay)) newEncounters++;

                // Update memo and push if better
                if (newEncounters < memo[nextPlanetIdx][newDay][newFuel]) {
                    memo[nextPlanetIdx][newDay][newFuel] = newEncounters;
                    priorityQueue.push({ 
                        encounters: newEncounters, 
                        planetIdx: nextPlanetIdx, 
                        day: newDay, 
                        fuel: newFuel 
                    });
                }
            }
        }

        // Only wait if it doesn't exceed countdown and might be beneficial
        // We limit waiting to avoid infinite loops (max wait up to countdown)

        // Action 2: Wait on current planet (to avoid future bounty hunters) (same fuel level)
        if (day + 1 <= countdown) {
            const newDay = day + 1;
            const newEncounters = encounters + (isBountyHunterPresent(planet, newDay) ? 1 : 0);
            if (newEncounters < memo[planetIdx][newDay][fuel]) {
                memo[planetIdx][newDay][fuel] = newEncounters;
                priorityQueue.push({ encounters: newEncounters, planetIdx, day: newDay, fuel });
            }
        }

        // Action 3: Refuel only  (sets fuel to autonomy, regardless of current fuel)
        if (day + 1 <= countdown && fuel < autonomy) {
            const newDay = day + 1;
            const newEncounters = encounters + (isBountyHunterPresent(planet, newDay) ? 1 : 0);
            if (newEncounters < memo[planetIdx][newDay][autonomy]) {
                memo[planetIdx][newDay][autonomy] = newEncounters;
                priorityQueue.push({ encounters: newEncounters, planetIdx, day: newDay, fuel: autonomy });
            }
        }
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