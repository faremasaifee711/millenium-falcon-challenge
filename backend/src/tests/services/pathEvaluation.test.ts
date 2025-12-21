import { evaluatePathWithBountyRules } from "../../services/pathEvaluation";

describe("Path simulation with bounty hunters", () => {

  const bountyIndex = new Map([
    ["Hoth", new Set([6, 7, 8])]
  ]);

  test("No bounty hunters encountered → 100%", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Dagobah", "Endor"],
      6,
      9,
      bountyIndex,
      []
    );

    expect(probability).toBeCloseTo(1.0);
  });

  test("Encounter bounty hunter once", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Hoth", "Endor"],
      6,
      9,
      new Map([["Hoth", new Set([1])]]),
      []
    );

    expect(probability).toBeCloseTo(0.9);
  });

  test("Encounter bounty hunter during refuel", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Hoth", "Endor"],
      1,
      9,
      new Map([["Hoth", new Set([2])]]),
      []
    );

    expect(probability).toBeCloseTo(0.9);
  });

});