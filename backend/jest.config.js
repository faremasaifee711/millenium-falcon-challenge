/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/src/__tests__/**/*.test.ts", "**/src/tests/**/*.test.ts"],
  };