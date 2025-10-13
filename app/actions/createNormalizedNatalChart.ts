'use server';

import { createNormalizedNatalChart as createNormalizedNatalChartImpl } from '@/lib/astrologer';
import { z } from 'zod';
import { natalChartFormSchema } from '@/schemas/profile.schema';

export async function createNormalizedNatalChart(
  formData: z.infer<typeof natalChartFormSchema>,
  userId: string,
  birthPlaceId: string | null, // Make birthPlaceId optional
  profileId: string
) {
  try {
    const result = await createNormalizedNatalChartImpl(
      formData,
      userId,
      birthPlaceId,
      profileId
    );
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating normalized natal chart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create natal chart' 
    };
  }
}
