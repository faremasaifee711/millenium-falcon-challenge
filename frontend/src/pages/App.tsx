import { useState } from "react";
import { AppTemplate } from "./AppTemplate";

function App() {
  const [odds, setOdds] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const handleOddsCalculated = (calculatedOdds: number) => {
    setOdds(calculatedOdds);
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setOdds(null);
  };

  return (
    <AppTemplate
      odds={odds}
      error={error}
      onOddsCalculated={handleOddsCalculated}
      onError={handleError}
    />
  );
}

export default App;

