import type { EmpireData, OddsResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function calculateOdds(empireData: EmpireData): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/odds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empireData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || error.error || 'Failed to calculate odds');
    }

    const data: OddsResponse = await response.json();
    return data.odds;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

