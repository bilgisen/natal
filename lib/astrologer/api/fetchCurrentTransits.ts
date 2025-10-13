// lib/astrologer/api/fetchCurrentTransits.ts
import type { CurrentTransitsResponse } from './types';

export async function fetchCurrentTransits(): Promise<CurrentTransitsResponse> {
  const apiKey = process.env.ASTROLOGER_API_KEY;
  const host = process.env.ASTROLOGER_API_HOST || 'astrologer.p.rapidapi.com';

  if (!apiKey || !host) {
    throw new Error('Astrologer API configuration is missing');
  }

  const response = await fetch(`https://${host}/api/v4/now`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Astrologer API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
