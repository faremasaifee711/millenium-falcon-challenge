import { useState } from 'react';
import { calculateOdds } from '../services/api';
import type { EmpireData } from '../types';

interface FileUploadProps {
  onOddsCalculated: (odds: number) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onOddsCalculated, onError }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      onError('Please upload a JSON file');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    onError(''); // Clear previous errors

    try {
      const text = await file.text();
      const empireData: EmpireData = JSON.parse(text);

      // Validate the structure
      if (typeof empireData.countdown !== 'number' || !Array.isArray(empireData.bounty_hunters)) {
        throw new Error('Invalid empire.json structure');
      }

      try {
        const odds = await calculateOdds(empireData);
        onOddsCalculated(odds);
      } catch (error) {
        console.log("Error on file upload " + empireData.countdown);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('Failed to process file');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <label
        htmlFor="empire-file"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4a5568',
          color: 'white',
          borderRadius: '0.5rem',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          transition: 'background-color 0.2s',
        }}
      >
        {isLoading ? 'Processing...' : fileName || 'Upload empire.json'}
      </label>
      <input
        id="empire-file"
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ display: 'none' }}
      />
    </div>
  );
}

