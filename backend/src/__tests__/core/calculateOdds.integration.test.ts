import fs from "fs";
import path from "path";
import { calculateOdds } from "../../core/bruteForce/oddsCalculator";
import { EmpireData, MillenniumFalconData } from "../../types/config.types";

/**
 * Integration tests for calculateOdds function.
 * 
 * Reads test data from examples folder structure:
 * - examples/
 *   - <test-case-name>/
 *     - millennium-falcon.json
 *     - empire.json
 *     - answer.json
 * 
 * Each subfolder represents a test case with expected results.
 */
describe("calculateOdds Integration Tests", () => {
  const examplesDir = path.join(__dirname, "../../../../examples");
  
  // Skip tests if examples directory doesn't exist
  if (!fs.existsSync(examplesDir)) {
    console.warn(`Sample data directory not found at ${examplesDir}. Skipping integration tests.`);
    return;
  }

  // Get all subdirectories in examples
  const testCases = fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  if (testCases.length === 0) {
    console.warn(`No test cases found in ${examplesDir}. Skipping integration tests.`);
    return;
  }

  // Generate dynamic test cases for each subfolder
  testCases.forEach((testCaseName) => {
    const testCaseDir = path.join(examplesDir, testCaseName);
    
    // Try both spellings: millennium-falcon.json (user specified) and millennium-falcon.json (standard)
    const millenniumFalconPath1 = path.join(testCaseDir, "millennium-falcon.json");
    const millenniumFalconPath2 = path.join(testCaseDir, "millennium-falcon.json");
    const millenniumFalconPath = fs.existsSync(millenniumFalconPath1) 
      ? millenniumFalconPath1 
      : millenniumFalconPath2;
    
    const empirePath = path.join(testCaseDir, "empire.json");
    const answerPath = path.join(testCaseDir, "answer.json");

    describe(`Test Case: ${testCaseName}`, () => {
      let millenniumFalconData: MillenniumFalconData;
      let empireData: EmpireData;
      let expectedOdds: number;

      beforeAll(() => {
        // Read and parse test data files
        if (!fs.existsSync(millenniumFalconPath)) {
          throw new Error(
            `Missing millennium-falcon.json or millennium-falcon.json in test case: ${testCaseName}`
          );
        }
        if (!fs.existsSync(empirePath)) {
          throw new Error(`Missing empire.json in test case: ${testCaseName}`);
        }
        if (!fs.existsSync(answerPath)) {
          throw new Error(`Missing answer.json in test case: ${testCaseName}`);
        }

        const millenniumFalconContent = fs.readFileSync(
          millenniumFalconPath,
          "utf-8"
        );
        const empireContent = fs.readFileSync(empirePath, "utf-8");
        const answerContent = fs.readFileSync(answerPath, "utf-8");

        try {
          millenniumFalconData = JSON.parse(
            millenniumFalconContent
          ) as MillenniumFalconData;
          empireData = JSON.parse(empireContent) as EmpireData;
          const answerData = JSON.parse(answerContent) as { odds: number };
          
          // Convert answer.json odds (0-1 decimal) to percentage (0-100)
          expectedOdds = answerData.odds;
        } catch (error) {
          throw new Error(
            `Failed to parse JSON files in test case ${testCaseName}: ${error}`
          );
        }
      });

      it(`should calculate correct odds for ${testCaseName}`, () => {
        // Calculate odds using the function
        const calculatedOdds = calculateOdds(
          millenniumFalconPath,
          millenniumFalconData,
          empireData
        );

        // Compare with expected result (allowing small floating point differences)
        expect(calculatedOdds).toBeCloseTo(expectedOdds, 2);
      });

      it(`should return a valid probability (0-100) for ${testCaseName}`, () => {
        const calculatedOdds = calculateOdds(
          millenniumFalconPath,
          millenniumFalconData,
          empireData
        );

        expect(calculatedOdds).toBeGreaterThanOrEqual(0);
        expect(calculatedOdds).toBeLessThanOrEqual(100);
      });
    });
  });
});
