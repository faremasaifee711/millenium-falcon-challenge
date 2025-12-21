import { Route } from "../models/routes";


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

export interface PathResult {
    path: string[];
    totalTime: number;
  }
  
export function findAllPaths(
    routes: Route[],
    start: string,
    end: string
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
    
            dfs(
                neighbor.node,
                visited,
                path,
                time + neighbor.travel_time
            );
    
            path.pop();
            visited.delete(neighbor.node);
            }
        }
    }
    
    dfs(start, new Set([start]), [start], 0);
    return results;
}

// We assume travel time is cumulative and arrival at each node happens at an integer day.
export function evaluatePathWithBountyRules(
    path: string[],
    autonomy: number,
    countdown: number,
    bountyIndex: Map<string, Set<number>>,
    routes: Route[]
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

        if (day > countdown) return 0;
        if (hasBounty(planet, day)) encounters++;
    }
    console.log("ecncounters: " + encounters);
    

    // Success probability = (0.9)^k
    return Math.pow(0.9, encounters);
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