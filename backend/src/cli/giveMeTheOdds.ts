#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { calculateOdds } from "./../services/oddsCalculator";
import Database from "better-sqlite3";
import { Route } from "../models/routes";

function readJSON(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
}

function main() {
    let [, , falconPath, empirePath] = process.argv;
    falconPath = "../examples/" + falconPath;
    empirePath = "../examples/" + empirePath;

    if (!falconPath || !empirePath) {
        console.error(
        "Usage: give-me-the-odds <millennium-falcon.json> <empire.json>"
        );
        process.exit(1);
    }

    const falconConfig = readJSON(falconPath);
    const empireConfig = readJSON(empirePath);

    

    const odds = calculateOdds( falconPath, falconConfig, empireConfig);

    console.log(falconConfig);
    console.log(empireConfig);
    
    console.log(odds);
}

main();