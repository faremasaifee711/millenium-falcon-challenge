import { FileUpload } from "../components/FileUpload";
import { OddsResult } from "../components/OddsResult";
import "./App.css";

type AppTemplateProps = {
  odds: number | null;
  error: string;
  onOddsCalculated: (odds: number) => void;
  onError: (message: string) => void;
};

export function AppTemplate({
  odds,
  error,
  onOddsCalculated,
  onError,
}: AppTemplateProps) {
  const showHint = !odds && !error;

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Millennium Falcon</h1>
        <p className="subtitle">Never tell me the odds!</p>

        <div className="card">
          <FileUpload onOddsCalculated={onOddsCalculated} onError={onError} />

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {odds !== null && <OddsResult odds={odds} />}

          {showHint && (
            <p className="hint">
              Upload an empire.json file to calculate the odds of reaching Endor
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
