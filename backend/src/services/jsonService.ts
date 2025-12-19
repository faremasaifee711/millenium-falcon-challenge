import fs from "fs";
import { paths } from "../config/config";

export function readJson(filePath: string) {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function getFalconData() {
  return readJson(paths.falconJson);
}

export function getEmpireData() {
  return readJson(paths.empireJson);
}

export function getAnswerData() {
    return readJson(paths.answerJson);
}