import path from "path";
import fs from "fs";

export const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, "../../examples/example1");

export const paths = {
  falconJson: path.join(DATA_DIR, "millennium-falcon.json"),
  empireJson: path.join(DATA_DIR, "empire.json"),
  db: path.join(DATA_DIR, "universe.db"),
  answerJson: path.join(DATA_DIR, "answer.json")
};

// Validate that files exist
for (const [key, filePath] of Object.entries(paths)) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${key} file not found at ${filePath}`);
  }
}