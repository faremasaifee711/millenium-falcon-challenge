import { Route } from "../types/db.types";
import { buildTravelTimeMap } from "../utils/TravelTimeMapUtil";
import { getBountyHunterDaysByPlanet } from "../utils/bountyHunterUtils";
import { getRoutesDataFromDBFilePath } from "../loaders/planetRouteService";
import { EmpireData, MillenniumFalconData } from "../types/config.types";

interface State {
    encounters: number;
    planetIdx: number;
    day: number;
    fuel: number;
}
  
interface PlanetIndexing {
    planetList: string[];
    planetIndex: Map<string, number>;
}

/**
 * Calculates the maximum probability of mission success given the available
 * hyperspace routes, Millennium Falcon constraints, and Empire (bounty hunter) data.
 *
 * The algorithm models the problem as a state-space search where each state is
 * defined by:
 *   - current planet
 *   - current day
 *   - remaining fuel
 *   - number of bounty hunter encounters so far
 *
 * Using a priority-queue–based search (Dijkstra-style), the algorithm:
 * 1. Explores reachable states starting from the departure planet at day 0.
 * 2. Accounts for travel time, refueling delays, and optional waiting on planets.
 * 3. Tracks bounty hunter encounters by planet and day.
 * 4. Prunes suboptimal states using memoization to avoid redundant exploration.
 * 5. Stops when the destination is reached within the Empire countdown.
 *
 * The success probability is computed as:
 *   probability = 0.9 ^ k
 * where k is the minimum number of bounty hunter encounters along the path.
 *
 * @param routes - All available hyperspace routes between planets
 * @param millenniumFalconData - Falcon constraints such as departure, arrival, and fuel autonomy
 * @param empireData - Empire constraints including countdown and bounty hunter schedules
 *
 * @returns The highest achievable mission success probability in the range [0, 1]
 *
 * @remarks
 * - Waiting or refueling consumes one day and may trigger bounty hunter encounters.
 * - Routes that exceed fuel autonomy or countdown constraints are discarded.
 * - If no valid path exists within the countdown, the function returns 0.
 */
export function calculateFinalProbability(
    routes: Route[],
    millenniumFalconData: MillenniumFalconData,
    empireData: EmpireData
  ): number {
    const { departure, arrival, autonomy } = millenniumFalconData;
    const { countdown, bounty_hunters } = empireData;
  
    // Build data structures
    const travelTimeMap = buildTravelTimeMap(routes);
    const bountyMap = getBountyHunterDaysByPlanet(bounty_hunters);
    const { planetList, planetIndex } = buildPlanetIndex(routes);
  
    // 3D Memo: memo[planetIdx][day][fuel] = min encounters to reach this state
    const memo = initializeMemo(
      planetList.length,
      countdown + 1,
      autonomy + 1
    );
  
    const queue: State[] = [];
  
    // Start state
    const startPlanetIdx = planetIndex.get(departure)!;
    const startEncounters = isBountyHunterPresent(bountyMap, departure, 0) ? 1 : 0;
  
    queue.push({
      encounters: startEncounters,
      planetIdx: startPlanetIdx,
      day: 0,
      fuel: autonomy,
    });
  
    memo[startPlanetIdx][0][autonomy] = startEncounters;
  
    let bestProbability = 0;
  
    while (queue.length > 0) {
        // Extract min encounters
        queue.sort((a, b) => a.encounters - b.encounters);
        const state = queue.shift()!;
    
        // Prune if worse path already found
        if (state.encounters > memo[state.planetIdx][state.day][state.fuel]) continue;
    
        const planet = planetList[state.planetIdx];
    
        if (planet === arrival) {
            bestProbability = Math.max(
            bestProbability,
            Math.pow(0.9, state.encounters)
            );
            continue;
        }
    
        // Action 1: Travel to neighbors
        expandTravelMoves(
            state,
            {
                travelTimeMap,
                planetList,
                planetIndex,
                autonomy,
                countdown,
                bountyMap,
            },
            memo,
            queue
        );
  
        // Only wait if it doesn't exceed countdown and might be beneficial
        // We limit waiting to avoid infinite loops (max wait up to countdown)

        // Action 2: Wait on current planet (to avoid future bounty hunters)
        expandWaitAndRefuel(
            state,
            {
                autonomy,
                countdown,
                planetList,
                bountyMap,
            },
            memo,
            queue
        );
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

function buildPlanetIndex(routes: Route[]): PlanetIndexing {
    const allPlanets = new Set<string>();
  
    for (const route of routes) {
        allPlanets.add(route.origin);
        allPlanets.add(route.destination);
    }
  
    const planetList = Array.from(allPlanets);
    const planetIndex = new Map<string, number>();
    planetList.forEach((planet, idx) => planetIndex.set(planet, idx));
  
    return { planetList, planetIndex };
}

function initializeMemo(
    numPlanets: number,
    maxDay: number,
    maxFuel: number
): number[][][] {
    return Array.from({ length: numPlanets }, () =>
        Array.from({ length: maxDay }, () =>
            Array(maxFuel).fill(Infinity)
        )
    );
}

function isBountyHunterPresent(
    bountyMap: Map<string, Set<number>>,
    planet: string,
    day: number
): boolean {
    return bountyMap.get(planet)?.has(day) ?? false;
}

function tryPushState(
    queue: State[],
    memo: number[][][],
    state: State
) {
    const { planetIdx, day, fuel, encounters } = state;
  
    if (encounters < memo[planetIdx][day][fuel]) {
      memo[planetIdx][day][fuel] = encounters;
      queue.push(state);
    }
}

function expandTravelMoves(
    state: State,
    params: {
        travelTimeMap: Map<string, Map<string, number>>;
        planetList: string[];
        planetIndex: Map<string, number>;
        autonomy: number;
        countdown: number;
        bountyMap: Map<string, Set<number>>;
    },
    memo: number[][][],
    queue: State[]
) {
    const { encounters, planetIdx, day, fuel } = state;
    const planet = params.planetList[planetIdx];
    const neighbors = params.travelTimeMap.get(planet);

    if (!neighbors) return;

    for (const [nextPlanet, travelTime] of neighbors.entries()) {
        if (travelTime > params.autonomy) continue;

        let newDay = day;
        let newFuel = fuel;
        let newEncounters = encounters;

        // Refuel if needed
        if (newFuel < travelTime) {
            newDay += 1;
            if (newDay > params.countdown) continue;

            if (isBountyHunterPresent(params.bountyMap, planet, newDay)) {
                newEncounters++;
            }

            newFuel = params.autonomy;
        }

        newDay += travelTime;
        if (newDay > params.countdown) continue;

        newFuel -= travelTime;

        if (isBountyHunterPresent(params.bountyMap, nextPlanet, newDay)) {
            newEncounters++;
        }

        const nextPlanetIdx = params.planetIndex.get(nextPlanet)!;

        tryPushState(queue, memo, {
            encounters: newEncounters,
            planetIdx: nextPlanetIdx,
            day: newDay,
            fuel: newFuel,
        });
    }
}

function expandWaitAndRefuel(
    state: State,
    params: {
        autonomy: number;
        countdown: number;
        planetList: string[];
        bountyMap: Map<string, Set<number>>;
    },
    memo: number[][][],
    queue: State[]
) {
    const { encounters, planetIdx, day, fuel } = state;
    const planet = params.planetList[planetIdx];

    if (day + 1 > params.countdown) return;
    
    const newDay = day + 1;
    const encounterDelta = isBountyHunterPresent(params.bountyMap, planet, newDay) ? 1 : 0;

    // Wait
    tryPushState(queue, memo, {
        encounters: encounters + encounterDelta,
        planetIdx,
        day: newDay,
        fuel,
    });

    // Refuel
    if (fuel < params.autonomy) {
        tryPushState(queue, memo, {
            encounters: encounters + encounterDelta,
            planetIdx,
            day: newDay,
            fuel: params.autonomy,
        });
    }
}
