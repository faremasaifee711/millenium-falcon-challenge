import { Route } from "../models/routes";
import { PathResult } from "../types/pathResult.types";

/**
 * Evaluates the success probability of a single travel path while accounting
 * for Falcon autonomy, Empire countdown constraints, and bounty hunter encounters.
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
 * @param autonomy - Maximum number of days the Falcon can travel without refueling
 * @param countdown - Maximum allowed number of days before mission failure
 * @param bountyIndex - Map of planet → set of days when bounty hunters are present
 * @param routes - All available hyperspace routes (used to compute travel time)
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
 * const probability = evaluatePathWithBountyRules(
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
export function evaluatePathWithBountyRules(
    path: string[],
    autonomy: number,
    countdown: number,
    bountyIndex: Map<string, Set<number>>,
    routes: Route[],
    bestProbability: number
): number {
    let day = 0;
    let fuel = autonomy;
    let encounters = 0;
    let planet = path[0];

    const hasBounty = (p: string, d: number) =>
    bountyIndex.get(p)?.has(d) ?? false;

    for (let i = 1; i < path.length; i++) {
        // Refuel is needed
        if (fuel === 0) {
            day += 1;
            fuel = autonomy;

            if (day > countdown) return 0;
            if (hasBounty(planet, day)) encounters++;
        }

        // Travel based on the routes from the DB
        const travelTime = getTravelTime(path[i-1]!, path[i], routes);
        day += travelTime;
        fuel -= travelTime;
        planet = path[i];

        if (day > countdown || Math.pow(0.9, encounters) < bestProbability) return 0;
        if (hasBounty(planet, day)) encounters++;
    }
    console.log("ecncounters: " + encounters);
    
    // Success probability = (0.9)^k
    return Math.pow(0.9, encounters);
}

/**
 * 
 * Paths exceeding the Empire countdown are discarded
 * 
 * @param routes  - All available hyperspace routes between planets
 * @param start - Planet on which Millienium Falcon is present on Day 0
 * @param end - Planet on which Millienium Falcon want to go
 * @param limitTime - number of days to filter paths on
 * 
 * @returns PathResult - List of paths from start to end
 */
export function findAllPathsWithinTimeLimit(
    routes: Route[],
    start: string,
    end: string,
    limitTime: number
): PathResult[] {
    const graph : Graph = buildGraph(routes);
    const results: PathResult[] = [];
  
    function dfs(
        current: string,
        visited: Set<string>,
        path: string[],
        time: number
    ) {
        if (current === end) {
            results.push({ path: [...path], totalTime: time });
            return;
        }
  
        for (const neighbor of graph[current] || []) {
            if (!visited.has(neighbor.node)) {
            visited.add(neighbor.node);
            path.push(neighbor.node);
    
            // prune branch early if limit is not met
            if(time + neighbor.travel_time < limitTime) {
                dfs(
                    neighbor.node,
                    visited,
                    path,
                    time + neighbor.travel_time
                );
            }
            
            path.pop();
            visited.delete(neighbor.node);
            }
        }
    }
    
    dfs(start, new Set([start]), [start], 0);
    return results;
}

function getTravelTime(
    origin: string,
    destination: string,
    routes: Route[]
): number  {
    const route = routes.find(
        r => r.origin === origin && r.destination === destination
    );

    return route?.travel_time ?? 0; 
}

type Graph = Record<
    string,
    { node: string; travel_time: number }[]
>;

function buildGraph(routes?: Route[]): Graph {
    if (!Array.isArray(routes)) {
        throw new Error("buildGraph: routes is undefined or not an array");
    }

    const graph: Graph = {};

    routes.forEach(route => {
        if (!graph[route.origin]) graph[route.origin] = [];
        if (!graph[route.destination]) graph[route.destination] = [];

        graph[route.origin].push({ node: route.destination, travel_time: route.travel_time });
        graph[route.destination].push({ node: route.origin, travel_time: route.travel_time });
    });

    return graph;
}