# Millennium Falcon Challenge Solution App (Business logic)

This backend application provides both a CLI and HTTP APIs to calculate the odds of mission success for the Millennium Falcon, based on hyperspace routes, ship constraints, and Empire intelligence data (bounty hunters and countdown).

The core computation engine evaluates all feasible travel strategies while respecting:
- Travel time between planets
- Fuel autonomy and refueling delays
- Empire countdown limits
- Bounty hunter presence by planet and day

Each bounty hunter encounter reduces the probability of success, and the system determines the maximum achievable probability across all valid strategies.

### Key Features

#### Dual Interfaces
- **CLI**: Allows odds calculation directly from configuration files (routes DB, Falcon data, Empire data).
- **REST API**: Exposes endpoints (e.g. POST /api/odds) to compute odds dynamically from request payloads.


#### Intelligent Path Evaluation
- Uses graph traversal with priority-based state exploration to minimize bounty hunter encounters.
- Supports waiting, refueling, and alternate routes to optimize outcomes.
- Efficient memoization ensures performance even with complex graphs.

#### Deterministic & Testable
- Pure, deterministic core logic
- Well-structured services, controllers, and utilities
- Designed for unit and integration testing

## Assumptions 

### Rules of travel
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

### Planet Routes Service:
- Reads planets path as nodes from DB
- we later convert these routes into a Map of adjacency list.
- pathExists uses DFS to explore all reachable nodes from start.
- Returns true if end is found, otherwise false.
- Works for bi-directional routes because we add edges both ways.

## 🧾 1. Core Assumptions

### File Upload
- File size is not very large for our system currently

### Backend API
- API is expecting client to verify the input JSON and send it in body of the API
- returns odds between 0 and 1 of winning

### System Architecture
- Built in **Typescript** with **Node**.
- Follows a **modular architecture**:
  - `Core` → defines core logic around calculation of winning probablity for Millennium Falcon.
  - `DataLoader` → component to fetch data from configs and databases.
  - `Utils` → helper functions to make the lookup for a route faster.
- Designed to support **easy extension** (new universe routes component etc.)
- No persistence layer or external data store (all data is in-memory).



---

## ⚖️ 2. Tradeoffs

| Area | Design Choice | Tradeoff |
|------|----------------|-----------|
| **Data Storage** | In-memory repository | Fast and simple but no persistence |
| **Sending JSON In the API Body** | Sending JSon vs sending File in the API | Fast and simple but can"t handle very large files due to payload size restrictions |

### Limitation
- Cannot upload a very large file (in GBs) via the UI as the API is not supported with file upload but rather parses it and sends the file contents as POST body. 
- Current logic assumes that a planet will not be revisited while reaching the destination. However there are specific scenarios where a planet may need to be revisited say to avoid a bounty hunter

---

## 🚀 3. Possible Extensions

### Persist Empire Intelligence in a Database
- Store bounty hunter data and countdown information in a database (e.g., PostgreSQL, SQLite, DynamoDB)
- Allow querying historical or versioned Empire intelligence
- Enable multiple Empire scenarios without resending full input each time

###  Improve Pathfinding Performance
- Replace the array-based priority queue with a true binary heap or Fibonacci heap
   ```import { MinPriorityQueue } from '@datastructures-js/priority-queue';```
- Reduce time complexity for large graphs and long countdowns

### Caching & Memoization
- Cache Falcon configuration and route data in memory or Redis
- Avoid recomputation for repeated queries with identical inputs

### Observability & Monitoring
- Add structured logging around path exploration
- Track performance metrics for computation time and memory usage
- Expose health and metrics endpoints for production readiness

### Enhanced CLI Capabilities
- Add verbose/debug modes for path exploration
- Export evaluated paths and encounter timelines

---

## 🧩 3.AI Usage
AI-assisted tools were used selectively during the development of this project to improve productivity and clarity, while all core business logic and algorithms were designed and implemented manually.

### Tests Support
- Assistance in setting up unit tests and integration tests
- Generating example test structures and assertions
- Verifying test coverage and edge cases

### Planning & Learning Support
- Using AI as a reference and explanation tool during problem-solving
- Clarifying algorithmic concepts during preparation, such as:
    - State-space search problems
    - Dijkstra’s shortest path algorithm
    - Priority queue–based graph traversal
- Syntax checks and refactoring suggestions for TypeScript

### What AI Was Not Used For
- Designing the mission success probability algorithm
- Implementing route traversal, bounty hunter encounter logic, or optimization strategies
- Making architectural or domain-specific decisions

---

## Commands mvn

Command to build and Run the web app

```
npm run build && npm run preview  
```

Command to build and Run the tests

```
npm run build && npm run test  
```

Command to run the cli

```
give-me-the-odds ../examples/example1/millennium-falcon.json ../examples/example1/empire.json
```

---