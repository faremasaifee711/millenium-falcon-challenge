import { getOddsColor, getOddsMessage } from "../utils/oddsHelpers";

type OddsResultProps = {
  odds: number;
};

export function OddsResult({ odds }: OddsResultProps) {
  return (
    <div>
      <div className="oddsValue" style={{ color: getOddsColor(odds) }}>
        {odds}%
      </div>
      <p className="oddsMessage">{getOddsMessage(odds)}</p>
    </div>
  );
}
