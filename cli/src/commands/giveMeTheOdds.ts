#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { calculateOdds } from "./../../../backend/src/services/oddsCalculator";

function readJSON(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
}

function main() {
  const [, , falconPath, empirePath] = process.argv;

  if (!falconPath || !empirePath) {
    console.error(
      "Usage: give-me-the-odds <millennium-falcon.json> <empire.json>"
    );
    process.exit(1);
  }

  const falconConfig = readJSON(falconPath);
  const empireConfig = readJSON(empirePath);

  const odds = calculateOdds(falconConfig, empireConfig);

  console.log(odds);
}

main();