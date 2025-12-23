import { BountyHunter } from "../types/bountyHunter.types";

// This makes lookup O(1).
export function indexBountyHunters(bountyHunters: BountyHunter[]) {
    const map = new Map<string, Set<number>>();
  
    for (const bh of bountyHunters) {
      if (!map.has(bh.planet)) {
        map.set(bh.planet, new Set());
      }
      map.get(bh.planet)!.add(bh.day);
    }
  
    return map;
}
  