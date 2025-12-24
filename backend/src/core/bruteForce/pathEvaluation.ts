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
  
    const isBountyHunterPresent = (planet: string, day: number) =>
      bountyHunterDaysByPlanet.get(planet)?.has(day) ?? false;
  
    const getTravelTime = (from: string, to: string, tMap: TravelTimeMap): number => {
      // keep your existing impl / import; this is just a placeholder
      return tMap.get(from)?.get(to) ?? Infinity;
    };
  
    const memo = new Map<string, number>();
  
    const dfs = (
      pathIndex: number,
      day: number,
      fuelAvailability: number,
      totalBountyHunterEncounters: number
    ): number => {
      const presentPlanet = path[pathIndex];
  
      // cutoff by countdown and probability threshold
      const currentProb = Math.pow(0.9, totalBountyHunterEncounters);
      if (day > countdown || currentProb < cutoffProbablity) {
        return 0;
      }
  
      // reached destination
      if (pathIndex === path.length - 1) {
        return currentProb;
      }
  
      const memoKey = `${pathIndex}|${day}|${fuelAvailability}`;
      const bestSoFar = memo.get(memoKey);
      // memo keeps *best probability* reached so far for this state
      if (bestSoFar !== undefined && bestSoFar >= currentProb) {
        // already explored this state with equal or better probability
        return 0;
      }
      memo.set(memoKey, currentProb);
  
      let bestProbability = 0;
  
      const nextPlanet = path[pathIndex + 1]!;
      const travelTime = getTravelTime(presentPlanet, nextPlanet, travelTimeMap);
  
      // if next leg is impossible with full autonomy, whole path is impossible
      if (travelTime > autonomy) {
        return 0;
      }
  
      // 1) Option: wait 1 day on current planet (without refueling)
      {
        const newDay = day + 1;
        let newEncounters = totalBountyHunterEncounters;
        if (isBountyHunterPresent(presentPlanet, newDay)) {
          newEncounters++;
        }
        const prob = dfs(pathIndex, newDay, fuelAvailability, newEncounters);
        if (prob > bestProbability) bestProbability = prob;
      }
  
      // 2) Option: refuel (spend 1 day, set fuelAvailability to autonomy)
      {
        const newDay = day + 1;
        let newEncounters = totalBountyHunterEncounters;
        if (isBountyHunterPresent(presentPlanet, newDay)) {
          newEncounters++;
        }
        const prob = dfs(pathIndex, newDay, autonomy, newEncounters);
        if (prob > bestProbability) bestProbability = prob;
      }
  
      // 3) Option: travel to next planet now, if fuelAvailability is enough
      if (fuelAvailability >= travelTime) {
        const arrivalDay = day + travelTime;
        let newEncounters = totalBountyHunterEncounters;
        if (isBountyHunterPresent(nextPlanet, arrivalDay)) {
          newEncounters++;
        }
        const prob = dfs(
          pathIndex + 1,
          arrivalDay,
          fuelAvailability - travelTime,
          newEncounters
        );
        if (prob > bestProbability) bestProbability = prob;
      }
  
      return bestProbability;
    };
  
    // start state: day 0, full fuel, count encounter on starting planet if any
    let totalBountyHunterEncounters = 0;
    const presentPlanet = path[0];
    if (isBountyHunterPresent(presentPlanet, 0)) {
      totalBountyHunterEncounters++;
    }
  
    const bestProb = dfs(0, 0, autonomy, totalBountyHunterEncounters);
    console.log("best probability ", bestProb);
  
    return bestProb;
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

