import { getBountyHunterDaysByPlanet } from "../../../utils/bountyHunterUtils";
import { BountyHunter } from "../../../types/config.types";

describe("bountyHunterUtils", () => {
    describe("getBountyHunterDaysByPlanet", () => {
        it("should return empty map when given no bounty hunters", () => {
            const bountyHunters: BountyHunter[] = [];
            const map = getBountyHunterDaysByPlanet(bountyHunters);
            
            expect(map.size).toBe(0);
        });

        it("should map single bounty hunter to correct planet and day", () => {
            const bountyHunters: BountyHunter[] = [
                { planet: "Tatooine", day: 4 },
            ];
            const map = getBountyHunterDaysByPlanet(bountyHunters);
            
            expect(map.has("Tatooine")).toBe(true);
            expect(map.get("Tatooine")?.has(4)).toBe(true);
        });

        it("should map multiple bounty hunters on same planet", () => {
            const bountyHunters: BountyHunter[] = [
                { planet: "Hoth", day: 6 },
                { planet: "Hoth", day: 7 },
                { planet: "Hoth", day: 8 },
            ];
            const map = getBountyHunterDaysByPlanet(bountyHunters);
            
            expect(map.get("Hoth")?.has(6)).toBe(true);
            expect(map.get("Hoth")?.has(7)).toBe(true);
            expect(map.get("Hoth")?.has(8)).toBe(true);
            expect(map.get("Hoth")?.size).toBe(3);
        });

        it("should map bounty hunters on different planets", () => {
            const bountyHunters: BountyHunter[] = [
                { planet: "Tatooine", day: 4 },
                { planet: "Dagobah", day: 5 },
            ];
            const map = getBountyHunterDaysByPlanet(bountyHunters);
            
            expect(map.get("Tatooine")?.has(4)).toBe(true);
            expect(map.get("Dagobah")?.has(5)).toBe(true);
            expect(map.size).toBe(2);
        });

        it("should handle duplicate planet and day combinations", () => {
            const bountyHunters: BountyHunter[] = [
                { planet: "Tatooine", day: 4 },
                { planet: "Tatooine", day: 4 },
            ];
            const map = getBountyHunterDaysByPlanet(bountyHunters);
            
            // Set should deduplicate
            expect(map.get("Tatooine")?.size).toBe(1);
            expect(map.get("Tatooine")?.has(4)).toBe(true);
        });
    });
});
