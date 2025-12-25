import { buildTravelTimeMap, getTravelTime } from "../../../utils/TravelTimeMapUtil";
import { Route } from "../../../types/db.types";

describe("TravelTimeMapUtil", () => {
    describe("buildTravelTimeMap", () => {
        it("should build an empty map when given no routes", () => {
            const routes: Route[] = [];
            const map = buildTravelTimeMap(routes);
            expect(map.size).toBe(0);
        });

        it("should build a map with correct structure for single route", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
            ];
            const map = buildTravelTimeMap(routes);
            
            expect(map.has("Tatooine")).toBe(true);
            expect(map.get("Tatooine")?.get("Dagobah")).toBe(4);
        });

        it("should build a map with multiple routes from same origin", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
                { origin: "Tatooine", destination: "Hoth", travelTime: 6 },
            ];
            const map = buildTravelTimeMap(routes);
            
            expect(map.get("Tatooine")?.get("Dagobah")).toBe(4);
            expect(map.get("Tatooine")?.get("Hoth")).toBe(6);
        });

        it("should build a map with routes from different origins", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
                { origin: "Dagobah", destination: "Endor", travelTime: 1 },
            ];
            const map = buildTravelTimeMap(routes);
            
            expect(map.get("Tatooine")?.get("Dagobah")).toBe(4);
            expect(map.get("Dagobah")?.get("Endor")).toBe(1);
        });
    });

    describe("getTravelTime", () => {
        it("should return travel time for existing route", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
            ];
            const map = buildTravelTimeMap(routes);
            const travelTime = getTravelTime("Tatooine", "Dagobah", map);
            
            expect(travelTime).toBe(4);
        });

        it("should return 0 for non-existent route", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
            ];
            const map = buildTravelTimeMap(routes);
            const travelTime = getTravelTime("Tatooine", "Endor", map);
            
            expect(travelTime).toBe(0);
        });

        it("should return 0 for non-existent origin", () => {
            const routes: Route[] = [
                { origin: "Tatooine", destination: "Dagobah", travelTime: 4 },
            ];
            const map = buildTravelTimeMap(routes);
            const travelTime = getTravelTime("Unknown", "Dagobah", map);
            
            expect(travelTime).toBe(0);
        });
    });
});
