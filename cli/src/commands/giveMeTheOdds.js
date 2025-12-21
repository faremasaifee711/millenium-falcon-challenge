#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const oddsCalculator_1 = require("../services/oddsCalculator");
function readJSON(filePath) {
    const absolutePath = path_1.default.resolve(process.cwd(), filePath);
    return JSON.parse(fs_1.default.readFileSync(absolutePath, "utf-8"));
}
function main() {
    const [, , falconPath, empirePath] = process.argv;
    if (!falconPath || !empirePath) {
        console.error("Usage: give-me-the-odds <millennium-falcon.json> <empire.json>");
        process.exit(1);
    }
    const falconConfig = readJSON(falconPath);
    const empireConfig = readJSON(empirePath);
    const odds = (0, oddsCalculator_1.calculateOdds)(falconConfig, empireConfig);
    console.log(odds);
}
main();
