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

## Rules of travel
- Autonomy
    - Falcon has autonomy = N days of fuel
    - Each travel day consumes 1 fuel
    - If fuel reaches 0, Falcon must refuel
    - Refueling:
        - Takes 1 full day
        - Resets fuel to autonomy
        - You stay on the same planet (and may meet bounty hunters)
- Waiting
    - Falcon may choose to wait on a planet (costs 1 day, no fuel)
    - Useful to avoid bounty hunters
- Bounty Hunters
    - If Falcon is on a planet on a day where bounty hunters are present:
        - Probability ×= 0.9
    - Multiple e ncounters multiply
- Hard constraints
    - Arrival at Endor must be <= countdown