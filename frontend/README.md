# Millennium Falcon Challenge Solution Frontend App

This frontend application is built using React and provides a simple user interface for calculating the probability of mission success.

The user can upload a configuration file (containing Empire data such as countdown and bounty hunters). The application reads and parses the file locally in the browser, validates its contents, and then sends the parsed JSON payload to a backend API.

The backend processes the data and returns the odds of winning, which are then displayed to the user in a clear and user-friendly format.

### Key Features
- React-based UI with modern hooks
- File upload and client-side file reading
- JSON parsing and validation before API submission
- API integration to calculate mission success odds
- Clear presentation of results and error handling

## 🧾 1. Core Assumptions

### File Upload
- File size is not very large for our system currently

### Backend API
- API is expecting client to verify the input JSON and send it in body of the API
- returns odds between 0 and 1 of winning
- routes_db data doesn't change and hence loaded only once and then cached

### ⚙️ System Architecture
- Built in **Typescript** with **Node** and **React**.
- Follows a **modular architecture**:
  - `App` → defines the single page behavior
  - `FileUpload` → component to get and validate input file
  - `OddsResult` → interracts with backend to fetch the odds.
- Designed to support **easy extension** (new universe routes component etc.)
- No persistence layer or external data store (all data is in-memory).

---

## 🚀 3. Possible Extensions

### Stronger Input Validation
- Validate file schema using JSON Schema or Zod before sending data to the API
- Show detailed validation errors (missing fields, invalid values, incorrect types)
- Enforce constraints such as non-negative countdown values and valid planet names

### File Upload via Cloud Storage (S3)
- Upload the file to an S3 bucket (or similar object storage)
- Send only the file URL to the backend API instead of the full file content
- Improve scalability and reduce payload size for large files

### Multiple File Support
- Allow users to upload multiple Empire configurations and compare odds
- Display results side-by-side or in a table

### Progress & Loading Indicators
- Show upload progress for large files
- Add loading states while the odds are being calculated

### Result History
- Store past calculations in local storage or a backend database
- Allow users to revisit previous odds calculations

---

## 4. AI Usage

- Generating boilerplate React components
- Creating basic HTML structure and styling
- Assisting with file upload handling and API integration patterns
---

## 5. Commands npm

Command to build and Run the web app

```
npm run build && npm run preview  
```

Command to build and Run the tests

```
npm run build && npm run test  
```

---
