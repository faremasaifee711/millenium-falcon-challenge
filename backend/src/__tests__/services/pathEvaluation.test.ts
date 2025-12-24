import { calculatePathSuccessProbabilityWithBountyHunters } from "../../core/bruteForce/pathEvaluation";
import { buildTravelTimeMap } from "../../utils/TravelTimeMapUtil";

describe("Path simulation with bounty hunters", () => {

  const routes = [
    { origin: 'Tatooine', destination: 'Dagobah', travelTime: 6 },
    { origin: 'Dagobah', destination: 'Endor', travelTime: 4 },
    { origin: 'Dagobah', destination: 'Hoth', travelTime: 1 },
    { origin: 'Hoth', destination: 'Endor', travelTime: 1 },
    { origin: 'Tatooine', destination: 'Hoth', travelTime: 6 }
  ]

  const bountyIndex = new Map([
    ["Hoth", new Set([6, 7, 8])]
  ]);
  const travelTimeMap = buildTravelTimeMap(routes);

  test("No bounty hunters encountered → 100%", () => {
    const probability = calculatePathSuccessProbabilityWithBountyHunters(
      ["Tatooine", "Dagobah", "Endor"],
      6,
      9,
      bountyIndex,
      travelTimeMap,
      0
    );

    expect(probability).toBeCloseTo(0);
  });

  test("Encounter bounty hunter once", () => {
    const probability = calculatePathSuccessProbabilityWithBountyHunters(
      ["Tatooine", "Hoth", "Endor"],
      6,
      9,
      new Map([["Hoth", new Set([1])]]),
      travelTimeMap,
      0
    );

    expect(probability).toBeCloseTo(1);
  });

  test("Encounter bounty hunter during refuel", () => {
    const probability = calculatePathSuccessProbabilityWithBountyHunters(
      ["Tatooine", "Hoth", "Endor"],
      1,
      9,
      new Map([["Hoth", new Set([2])]]),
      travelTimeMap,
      0
    );

    expect(probability).toBeCloseTo(0);
  });

});