import { useState } from 'react';
import { FileUpload } from './components/FileUpload';

function App() {
  const [odds, setOdds] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const handleOddsCalculated = (calculatedOdds: number) => {
    setOdds(calculatedOdds);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setOdds(null);
  };

  const getOddsColor = (oddsValue: number): string => {
    if (oddsValue === 0) return '#ef4444'; // red
    if (oddsValue === 100) return '#10b981'; // green
    return '#f59e0b'; // amber
  };

  const getOddsMessage = (oddsValue: number): string => {
    if (oddsValue === 0) return 'Mission Failed - Cannot reach Endor in time';
    if (oddsValue === 100) return 'Mission Success - Safe path available!';
    return 'Mission Possible - Bounty hunters pose a threat';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Millennium Falcon
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#9ca3af' }}>
          Never tell me the odds!
        </p>

        <div
          style={{
            backgroundColor: '#2d2d44',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          }}
        >
          <FileUpload onOddsCalculated={handleOddsCalculated} onError={handleError} />

          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#7f1d1d',
                color: '#fca5a5',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {odds !== null && (
            <div>
              <div
                style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: getOddsColor(odds),
                  marginBottom: '1rem',
                  textShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
                }}
              >
                {odds}%
              </div>
              <p
                style={{
                  fontSize: '1.125rem',
                  color: '#d1d5db',
                  marginTop: '1rem',
                }}
              >
                {getOddsMessage(odds)}
              </p>
            </div>
          )}

          {!odds && !error && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>
              Upload an empire.json file to calculate the odds of reaching Endor
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

