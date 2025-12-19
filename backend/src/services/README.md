# Business logic (calculations)

## Route Service

### Usage 

import { getRoutes } from "./services/routeService";

const routes = getRoutes("Tatooine", "Endor");
console.log(routes);


## UniverseService:
- Reads planets path as nodes from DB
- buildGraph converts routes into a graph adjacency list.
- pathExists uses DFS to explore all reachable nodes from start.
- Returns true if end is found, otherwise false.
- Works for bi-directional routes because we add edges both ways.