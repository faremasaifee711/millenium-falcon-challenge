import express from "express";
import fs from "fs";
import path from "path";
import { db } from "./db/db";
import { Route } from "./models/routes";
import { paths, DATA_DIR } from "./config/config";
import { getFalconData, getEmpireData, getAnswerData } from "./services/jsonService";
import { addDefaultRoutesDataToDB } from "./services/universeService";
import { calculateFinalProbability } from "./services/oddsCalculator";

// -------------------- INIT --------------------
const routes : Route[] = addDefaultRoutesDataToDB();

// -------------------- EXPRESS SERVER --------------------
const app = express();
app.use(express.json());

console.log(getFalconData());
console.log(getEmpireData());
console.log(getAnswerData());

console.log(calculateFinalProbability(routes, getFalconData(), getEmpireData() ));

// Endpoint: get all routes
app.get("/routes", (req, res) => {
  res.json(routes);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using external data folder: ${DATA_DIR}`);
});
