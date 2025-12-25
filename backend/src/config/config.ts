/**
 * Responsible for providing path resolution for Millennium Falcon Config when passed in the commands
 */
import path from "path";
import fs from "fs";

export const millenniumFalconConfigPath = process.argv[2] || path.resolve(__dirname, "../../../examples/example1/millennium-falcon.json");

export const paths = {
  millenniumFalconJson: path.resolve(process.cwd(), millenniumFalconConfigPath),
};

// Validate that files exist
for (const [key, filePath] of Object.entries(paths)) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${key} file not found at ${filePath}`);
  }
}
