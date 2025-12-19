// We assume travel time is cumulative and arrival at each node happens at an integer day.
export function simulatePathWithBountyRules(
    path: string[],
    autonomy: number,
    countdown: number,
    bountyIndex: Map<string, Set<number>>
): number {
    let day = 0;
    let fuel = autonomy;
    let encounters = 0;
    let planet = path[0];

    const hasBounty = (p: string, d: number) =>
    bountyIndex.get(p)?.has(d) ?? false;

    for (let i = 1; i < path.length; i++) {
        // Refuel if needed
        if (fuel === 0) {
            day += 1;
            fuel = autonomy;

            if (day > countdown) return 0;
            if (hasBounty(planet, day)) encounters++;
        }

        // Travel (1 day)
        day += 1;
        fuel -= 1;
        planet = path[i];

        if (day > countdown) return 0;
        if (hasBounty(planet, day)) encounters++;
    }

    // Success probability = (0.9)^k
    return Math.pow(0.9, encounters);
}