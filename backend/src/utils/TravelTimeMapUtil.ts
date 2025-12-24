import { Route } from "../types/db.types";

export type TravelTimeMap = Map<string, Map<string, number>>;

/**
 * Builds a lookup map for travel times with O(1) access.
 *
 * Structure:
 *   origin -> destination -> travelTime
 *
 * @param routes - List of all routes
 * @returns TravelTimeMap
 */
export function buildTravelTimeMap(routes: Route[]): TravelTimeMap {
    const travelTimeMap: TravelTimeMap = new Map();

    for (const { origin, destination, travelTime } of routes) {
        if (!travelTimeMap.has(origin)) {
            travelTimeMap.set(origin, new Map());
        }

        travelTimeMap.get(origin)!.set(destination, travelTime);
    }

    return travelTimeMap;
}

// This makes lookup O(1).
export function getTravelTime(
    origin: string,
    destination: string,
    travelTimeByDestinationAndSource: TravelTimeMap
): number {
    return (
        travelTimeByDestinationAndSource
            .get(origin)
            ?.get(destination) ?? 0
    );
}