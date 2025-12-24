# Odds Frontend App

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
