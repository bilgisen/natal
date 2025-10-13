// lib/astrologer/index.ts
import { z } from 'zod';
import { natalChartFormSchema } from '@/schemas/profile.schema';
import { fetchBirthData } from './api/fetchBirthData';
import { getCountryCode } from './utils/countryCode';
import { toBirthData } from './mapping/toBirthData';
import { toNormalizedData } from './mapping/toNormalized';
import { saveNormalizedChart } from './persistence/saveNormalizedChart';

export async function createNormalizedNatalChart(
  formData: z.infer<typeof natalChartFormSchema>,
  userId: string,
  birthPlaceId: string | null, // Make birthPlaceId optional
  profileId: string
) {
  const [hours, minutes] = formData.subjectBirthTime?.split(':').map(Number) || [0, 0];
  const birthDate = new Date(formData.subjectBirthDate);
  const countryCode = getCountryCode(formData.subjectBirthPlaceData?.country || '');

  // Only include birth place data if we have valid coordinates
  const hasValidCoordinates = 
    formData.subjectBirthPlaceData?.lat !== undefined && 
    formData.subjectBirthPlaceData?.lng !== undefined;

  const requestData = {
    subject: {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: hours,
      minute: minutes,
      longitude: hasValidCoordinates ? Number(formData.subjectBirthPlaceData?.lng) : 0,
      latitude: hasValidCoordinates ? Number(formData.subjectBirthPlaceData?.lat) : 0,
      city: formData.subjectBirthPlaceData?.city || '',
      nation: countryCode,
      timezone: formData.subjectBirthPlaceData?.tz || 'UTC',
      name: formData.subjectName,
      zodiac_type: 'Tropic' as const,
      sidereal_mode: null,
      perspective_type: 'Apparent Geocentric',
      houses_system_identifier: 'P',
    },
    theme: 'classic',
    language: 'EN',
    wheel_only: false,
  };

  try {
    const rawResponse = await fetchBirthData(requestData);
    const birthData = toBirthData(rawResponse);
    
    // Only pass birthPlaceId if it's a valid UUID
    const validBirthPlaceId = birthPlaceId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(birthPlaceId)
      ? birthPlaceId
      : null;
      
    const normalized = await toNormalizedData(birthData, profileId, userId, validBirthPlaceId);
    const chartId = await saveNormalizedChart(normalized);

    return { chartId, birthData, rawResponse };
  } catch (error) {
    console.error('Error in createNormalizedNatalChart:', error);
    throw error;
  }
}
