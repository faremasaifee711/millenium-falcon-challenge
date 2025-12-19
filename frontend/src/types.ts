export interface BountyHunter {
  planet: string;
  day: number;
}

export interface EmpireData {
  countdown: number;
  bounty_hunters: BountyHunter[];
}

export interface OddsResponse {
  odds: number; // percentage (0-100)
}

export interface ApiError {
  error: string;
  message?: string;
}

