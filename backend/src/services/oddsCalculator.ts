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
  
interface BountyHunter {
    planet: string;
    day: number;
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

// We assume travel time is cumulative and arrival at each node happens at an integer day.
function simulatePath(
    path: string[],
    totalTime: number,
    bountyIndex: Map<string, Set<number>>,
    countdown: number
  ): number {
    if (totalTime > countdown) return 0; // impossible path
  
    let encounters = 0;
    let currentDay = 0;
  
    for (let i = 1; i < path.length; i++) {
      currentDay += 1; // arrive at next planet
  
      const planet = path[i];
      const bountyDays = bountyIndex.get(planet);
  
      if (bountyDays?.has(currentDay)) {
        encounters++;
      }
    }
  
    return Math.pow(0.9, encounters);
  }

  function calculateSuccessProbability(
    paths: PathResult[],
    countdown: number,
    bountyHunters: BountyHunter[]
  ): number {
    const bountyIndex = indexBountyHunters(bountyHunters);
  
    let bestProbability = 0;
  
    for (const p of paths) {
      const probability = simulatePath(
        p.path,
        p.totalTime,
        bountyIndex,
        countdown
      );
  
      bestProbability = Math.max(bestProbability, probability);
    }
  
    return Math.round(bestProbability * 100);
  }