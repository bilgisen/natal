// lib/astrologer/api/fetchBirthData.ts
import type { BirthDataRequest, BirthDataResponse } from './types';

export async function fetchBirthData(requestData: BirthDataRequest): Promise<BirthDataResponse> {
  const apiKey = process.env.ASTROLOGER_API_KEY;
  const host = process.env.ASTROLOGER_API_HOST || 'astrologer.p.rapidapi.com';

  if (!apiKey || !host) {
    throw new Error('Astrologer API configuration is missing');
  }

  const response = await fetch(`https://${host}/api/v4/birth-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Astrologer API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
