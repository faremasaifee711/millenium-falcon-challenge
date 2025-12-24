export function getOddsColor(oddsValue: number): string {
  if (oddsValue === 0) return "#ef4444"; // red
  if (oddsValue === 100) return "#10b981"; // green
  return "#f59e0b"; // amber
}

export function getOddsMessage(oddsValue: number): string {
  if (oddsValue === 0) return "Mission Failed - Cannot reach Endor in time";
  if (oddsValue === 100) return "Mission Success - Safe path available!";
  return "Mission Possible - Bounty hunters pose a threat";
}
