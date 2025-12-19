import { Route } from "../models/routes";
import { simulatePathWithBountyRules } from "./simulation";

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


function pathExists(graph: Graph, start: string, end: string): boolean {
    const visited = new Set<string>();
  
    function dfs(node: string): boolean {
      if (node === end) return true;
      if (visited.has(node)) return false;
  
      visited.add(node);
  
      for (const neighbor of graph[node] || []) {
        if (dfs(neighbor.node)) return true;
      }
  
      return false;
    }
  
    return dfs(start);
}

interface PathResult {
    path: string[];
    totalTime: number;
  }
  
function findAllPaths(
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
  


interface BountyHunter {
    planet: string;
    day: number;
}

interface FalconData {
    autonomy: number,
    departure: string,
    arrival: string,
    routes_db: string
}

interface EmpireData {
    countdown: number,
    bounty_hunters: BountyHunter[]
}

// This makes lookup O(1).
function indexBountyHunters(bountyHunters: BountyHunter[]) {
    const map = new Map<string, Set<number>>();
  
    for (const bh of bountyHunters) {
      if (!map.has(bh.planet)) {
        map.set(bh.planet, new Set());
      }
      map.get(bh.planet)!.add(bh.day);
    }
  
    return map;
}
  

export function calculateFinalProbability (
    routes: Route[],
    falconData: FalconData,
    empireData: EmpireData
): number {
    const paths: PathResult[] = findAllPaths(routes, falconData.departure, falconData.arrival);
    const bountyHunters = empireData.bounty_hunters;
    const bountyIndex = indexBountyHunters(bountyHunters);

    let bestProbability = 0;

    for (const p of paths) {
        const successProbability = simulatePathWithBountyRules(
            p.path,
            falconData.autonomy,
            empireData.countdown,
            bountyIndex
        );

        bestProbability = Math.max(bestProbability, successProbability);
    }

    return bestProbability * 100;
}