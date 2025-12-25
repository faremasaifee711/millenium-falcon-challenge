#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { calculateOdds } from "../core/oddsCalculator";

function readJSON(filePath: string) {
	const absolutePath = path.resolve(process.cwd(), filePath);
	
	if (!fs.existsSync(absolutePath)) {
		console.warn(`Warning: config file not found at ${filePath}`);
	}

	return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
  
}

/**
 * Takes 2 files paths as input respectively the paths toward the:
 *  - millennium-falcon.json
 *  - empire.json files 
 * and prints the probability of success as a number ranging from 0 to 100.
 */
function main() {
	let [, , millenniumFalconPath, empirePath] = process.argv;

	if (!millenniumFalconPath || !empirePath) {
		console.error(
			"Usage: give-me-the-odds <millennium-falcon.json> <empire.json>"
		);
		process.exit(1);
	}

	const millenniumFalconConfig = readJSON(millenniumFalconPath);
	const empireConfig = readJSON(empirePath);

	const odds = calculateOdds( millenniumFalconPath, millenniumFalconConfig, empireConfig);

	// print result in the command line
	console.log(odds * 100);
}

main();