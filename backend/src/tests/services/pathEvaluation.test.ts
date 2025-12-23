import { evaluatePathWithBountyRules } from "../../services/pathEvaluation";

describe("Path simulation with bounty hunters", () => {

  const routes = [
    { origin: 'Tatooine', destination: 'Dagobah', travel_time: 6 },
    { origin: 'Dagobah', destination: 'Endor', travel_time: 4 },
    { origin: 'Dagobah', destination: 'Hoth', travel_time: 1 },
    { origin: 'Hoth', destination: 'Endor', travel_time: 1 },
    { origin: 'Tatooine', destination: 'Hoth', travel_time: 6 }
  ]

  const bountyIndex = new Map([
    ["Hoth", new Set([6, 7, 8])]
  ]);

  test("No bounty hunters encountered → 100%", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Dagobah", "Endor"],
      6,
      9,
      bountyIndex,
      routes,
      0
    );

    expect(probability).toBeCloseTo(0);
  });

  test("Encounter bounty hunter once", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Hoth", "Endor"],
      6,
      9,
      new Map([["Hoth", new Set([1])]]),
      routes,
      0
    );

    expect(probability).toBeCloseTo(0);
  });

  test("Encounter bounty hunter during refuel", () => {
    const probability = evaluatePathWithBountyRules(
      ["Tatooine", "Hoth", "Endor"],
      1,
      9,
      new Map([["Hoth", new Set([2])]]),
      routes,
      0
    );

    expect(probability).toBeCloseTo(0);
  });

});