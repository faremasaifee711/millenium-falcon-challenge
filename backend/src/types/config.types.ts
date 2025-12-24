export interface MillenniumFalconData {
    autonomy: number,
    departure: string,
    arrival: string,
    routes_db: string
}

export interface BountyHunter {
    planet: string;
    day: number;
}

export interface EmpireData {
    bounty_hunters: BountyHunter[];
    countdown: number;
}