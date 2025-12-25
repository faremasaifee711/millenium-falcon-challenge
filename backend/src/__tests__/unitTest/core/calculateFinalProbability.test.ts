import { calculateFinalProbability } from "../../../core/oddsCalculator";
import { EmpireData, MillenniumFalconData } from "../../../types/config.types";
import { Route } from "../../../types/db.types";

describe("calculateFinalProbability", () => {
    const routes: Route[] = [
        { origin: "A", destination: "B", travelTime: 2 },
        { origin: "B", destination: "C", travelTime: 2 },
    ];

    const millenniumFalconData: MillenniumFalconData = {
        departure: "A",
        arrival: "C",
        autonomy: 3,
        routes_db: "universe.db"
    };

    it("should return 0 if countdown is too low", () => {
        const empireData: EmpireData = {
            countdown: 1,
            bounty_hunters: [],
        };
        const prob = calculateFinalProbability(routes, millenniumFalconData, empireData);
        expect(prob).toBe(0);
    });

    it("should return probability less than or equal to 100", () => {
        const empireData: EmpireData = {
            countdown: 5,
            bounty_hunters: [{ planet: "B", day: 2 }],
        };
        const prob = calculateFinalProbability(routes, millenniumFalconData, empireData);
        expect(prob).toBeLessThanOrEqual(100);
    });
});