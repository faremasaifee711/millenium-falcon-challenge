import { Route } from "../../types/db.types";
import { EmpireData, MillenniumFalconData } from "../../types/config.types";
import { buildTravelTimeMap, TravelTimeMap } from "../../utils/TravelTimeMapUtil";
import { getBountyHunterDaysByPlanet } from "../../utils/bountyHunterUtils";
import { getRoutesDataFromDBFilePath } from "../planetRouteService";

/**
 * State representation for the Dijkstra's algorithm.
 * Represents the spaceship's current position and status.
 */
interface State {
    planet: string;
    day: number;
    fuel: number;
    encounters: number;
}

/**
 * Calculates the maximum probability of mission success using an optimal algorithm
 * that finds the path with minimum encounters.
 * 
 * Uses Dijkstra's algorithm with state space (planet, day, fuel) to find the
 * path from departure to arrival that minimizes bounty hunter encounters while
 * respecting fuel constraints and countdown limits.
 *
 * The algorithm:
 * 1. Builds a graph of all possible routes
 * 2. Uses Dijkstra's algorithm to explore states (planet, day, fuel)
 * 3. Considers three actions: travel, wait, refuel
 * 4. Tracks minimum encounters for each reachable state
 * 5. Returns success probability based on minimum encounters found
 *
 * @param routes - All available hyperspace routes between planets
 * @param millenniumFalconData - Falcon constraints (departure, arrival, autonomy)
 * @param empireData - Empire constraints (countdown, bounty hunters)
 *
 * @returns The highest mission success probability as a percentage (0–100)
 *
 * @remarks
 * - Success probability = 0.9^k where k is minimum encounters
 * - If no valid path exists within countdown, returns 0
 * - Waiting on a planet can avoid encounters but consumes time
 */
export function calculateFinalProbability(
    routes: Route[],
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
): number {
    const { departure, arrival, autonomy } = millenniumFalconData;
    const { countdown, bounty_hunters } = empireData;

    // Build data structures for efficient lookups
    const travelTimeMap = buildTravelTimeMap(routes);
    const bountyHunterDaysByPlanet = getBountyHunterDaysByPlanet(bounty_hunters);

    // Build bidirectional travel map (routes can be traveled in both directions)
    const bidirectionalMap: TravelTimeMap = new Map();
    for (const { origin, destination, travelTime } of routes) {
        // Add origin -> destination
        if (!bidirectionalMap.has(origin)) {
            bidirectionalMap.set(origin, new Map());
        }
        bidirectionalMap.get(origin)!.set(destination, travelTime);

        // Add destination -> origin (bidirectional)
        if (!bidirectionalMap.has(destination)) {
            bidirectionalMap.set(destination, new Map());
        }
        bidirectionalMap.get(destination)!.set(origin, travelTime);
    }

    // Helper to check if bounty hunter is present
    const hasBountyHunter = (planet: string, day: number): boolean => {
        return bountyHunterDaysByPlanet.get(planet)?.has(day) ?? false;
    };

    // Priority queue for Dijkstra's (min-heap by encounters, then by day)
    // Using array with manual min extraction for simplicity
    const queue: State[] = [];
    const visited = new Set<string>();

    // State key generator for visited tracking
    const getStateKey = (state: State): string => {
        return `${state.planet}:${state.day}:${state.fuel}`;
    };

    // Initialize: start at departure on day 0 with full fuel
    const initialState: State = {
        planet: departure,
        day: 0,
        fuel: autonomy,
        encounters: 0,
    };

    // Check initial encounter
    if (hasBountyHunter(departure, 0)) {
        initialState.encounters = 1;
    }

    queue.push(initialState);
    let minEncounters = Infinity;

    // Dijkstra's algorithm
    while (queue.length > 0) {
        // Extract state with minimum encounters (simple min search for small state space)
        let minIdx = 0;
        for (let i = 1; i < queue.length; i++) {
            if (
                queue[i].encounters < queue[minIdx].encounters ||
                (queue[i].encounters === queue[minIdx].encounters &&
                    queue[i].day < queue[minIdx].day)
            ) {
                minIdx = i;
            }
        }
        const current = queue.splice(minIdx, 1)[0];

        // Skip if already visited with better or equal state
        const stateKey = getStateKey(current);
        if (visited.has(stateKey)) {
            continue;
        }
        visited.add(stateKey);

        // Check if we reached the destination
        if (current.planet === arrival) {
            minEncounters = Math.min(minEncounters, current.encounters);
            // Early termination: if we found a path with 0 encounters, that's optimal
            if (minEncounters === 0) {
                return 1; // 0.9^0 = 1.0 = 100%
            }
            continue; // Continue to find potentially better paths
        }

        // Prune: if we've exceeded countdown, skip
        // Note: day can equal countdown if we arrive exactly on the countdown day
        if (current.day > countdown) {
            continue;
        }

        // Prune: if we already found a path with fewer encounters, skip
        if (current.encounters >= minEncounters) {
            continue;
        }

        // Action 1: Travel to neighboring planets (bidirectional routes)
        const neighbors = bidirectionalMap.get(current.planet);
        if (neighbors) {
            for (const [nextPlanet, travelTime] of neighbors.entries()) {
                // Check if route is possible (travel time <= autonomy)
                if (travelTime > autonomy) {
                    continue; // Impossible route
                }

                let newDay = current.day;
                let newFuel = current.fuel;
                let newEncounters = current.encounters;

                // Check if refueling is needed before travel
                if (newFuel < travelTime) {
                    // Refuel takes 1 day, then travel takes travelTime days
                    // Total days needed: 1 (refuel) + travelTime
                    // Must arrive on or before countdown
                    if (current.day + 1 + travelTime > countdown) {
                        continue; // Would exceed countdown
                    }
                    newDay += 1;
                    // Check encounter during refuel
                    if (hasBountyHunter(current.planet, newDay)) {
                        newEncounters += 1;
                    }
                    newFuel = autonomy; // Full tank after refuel
                }

                // Travel to next planet
                newDay += travelTime;
                if (newDay > countdown) {
                    continue; // Exceeds countdown (must arrive on or before countdown)
                }
                newFuel -= travelTime;

                // Check encounter upon arrival
                if (hasBountyHunter(nextPlanet, newDay)) {
                    newEncounters += 1;
                }

                // Add new state to queue
                const newState: State = {
                    planet: nextPlanet,
                    day: newDay,
                    fuel: newFuel,
                    encounters: newEncounters,
                };

                const newStateKey = getStateKey(newState);
                if (!visited.has(newStateKey) && newEncounters < minEncounters) {
                    queue.push(newState);
                }
            }
        }

        // Action 2: Wait on current planet (to avoid future bounty hunters)
        // Only wait if it doesn't exceed countdown and might be beneficial
        // We limit waiting to avoid infinite loops (max wait up to countdown)
        if (current.day + 1 <= countdown) {
            const waitState: State = {
                planet: current.planet,
                day: current.day + 1,
                fuel: current.fuel, // Fuel doesn't change when waiting
                encounters: current.encounters,
            };

            // Check if waiting causes an encounter
            if (hasBountyHunter(current.planet, waitState.day)) {
                waitState.encounters += 1;
            }

            const waitStateKey = getStateKey(waitState);
            // Only add if not visited and potentially better than current best
            if (!visited.has(waitStateKey) && waitState.encounters < minEncounters) {
                queue.push(waitState);
            }
        }
    }

    // If no path found, mission fails
    if (minEncounters === Infinity) {
        return 0;
    }

    // Calculate success probability: 0.9^k where k is minimum encounters
    // Convert to percentage (0-100)
    const probability = Math.pow(0.9, minEncounters);
    return probability;
}


export function calculateOdds (
    millenniumFalconFilePath: string,
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
): number {
    const routes : Route[] = getRoutesDataFromDBFilePath(millenniumFalconFilePath, millenniumFalconData.routes_db);
    return calculateFinalProbability(routes, millenniumFalconData, empireData);
}