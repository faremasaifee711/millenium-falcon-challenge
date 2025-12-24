import { calculatePathSuccessProbabilityWithBountyHunters } from "../../core/bruteForce/pathEvaluation";
import { buildTravelTimeMap } from "../../utils/TravelTimeMapUtil";
import { Route } from "../../types/db.types";

describe("calculatePathSuccessProbabilityWithBountyHunters", () => {
  const routes: Route[] = [
    { origin: "A", destination: "B", travelTime: 1 },
    { origin: "B", destination: "C", travelTime: 1 },
  ];

  const bountyIndex = new Map<string, Set<number>>([
    ["B", new Set([1])],
  ]);

  it("should calculate probability correctly", () => {
    const path = ["A", "B", "C"];
    const prob = calculatePathSuccessProbabilityWithBountyHunters(path, 2, 3, bountyIndex, buildTravelTimeMap(routes), 0);
    expect(prob).toBeLessThanOrEqual(1);
    expect(prob).toBeGreaterThanOrEqual(0);
  });
});