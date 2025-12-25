# Backend App (Business logic)

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

In this project, we all user to upload bounty hunters data and when the destination planet is going to be destroye. Use this data to calculate odds of winning of Millennium Falcon.

## Assumptions 

## 🧾 1. Core Assumptions

### File Upload
- File size is not very large for our system currently

### Backend API
- API is expecting client to verify the input JSON and send it in body of the API
- returns odds between 0 and 1 of winning

### ⚙️ System Architecture
- Built in **Typescript** with **Node** and **React**.
- Follows a **modular architecture**:
  - `App` → defines the single page behavior
  - `FileUpload` → component to get and validate input file
  - `OddsResult` → interracts with backend to fetch the odds.
- Designed to support **easy extension** (new universe routes component etc.)
- No persistence layer or external data store (all data is in-memory).

---

## ⚖️ 2. Tradeoffs

| Area | Design Choice | Tradeoff |
|------|----------------|-----------|
| **Data Storage** | In-memory repository | Fast and simple but no persistence |
| **Sending JSON In the API Body** | Sending JSon vs sending File in the API | Fast and simple but can"t handle very large files due to payload size restrictions |

---

## 🚀 3. Possible Extensions

### 🧩 Feature Enhancements
- add more components

### 🧩 Prioirty Queue
- Use real priority queue for large graphs:
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

---

## 🚀 3.AI Usage

### 🧩 Tests setup
- unit tests
- integration tests

### 🧩 Planning
Using AI for boilerplate code snippets, syntax checks, or explaining concepts during prep.

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

---



TODO:
- implement logic for waiting, and optimizations on waiting
    - use memoization to store best probablities for each waiting state.