// schemas/profile.schema.ts
import { z } from 'zod';

// Helper to validate time in HH:MM format
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const profileFormSchema = z.object({
  birthDate: z.date({
    required_error: 'Please select your birth date.',
  }),
  birthTime: z.string()
    .regex(timeRegex, 'Time must be in HH:MM format (24-hour)')
    .default('00:00'),
  birthPlace: z.string().min(2, {
    message: 'Birth place must be at least 2 characters.',
  }),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(150),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Please select a gender.',
  }).optional(),
  profileCategory: z.enum(['self', 'family', 'friends', 'colleagues', 'other'], {
    required_error: 'Please select profile category.',
  }).default('self'),
  birthPlaceData: z.object({
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    tz: z.string().min(1, 'Timezone is required').max(64, 'Timezone is too long'),
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Extended schema for creating profiles (self and related)
export const profileFormSchemaExtended = profileFormSchema.extend({
  subjectName: z.string().min(2, 'Name must be at least 2 characters').max(150).optional(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(150),
}).refine(data => {
  // Ensure either subjectName or displayName is provided
  if (!data.subjectName && !data.displayName) {
    return false;
  }
  return true;
}, {
  message: 'Either subject name or display name must be provided',
  path: ['displayName']
});

export type ProfileFormExtendedValues = z.infer<typeof profileFormSchemaExtended>;

// Schema for updating existing profiles (no relationshipType or subjectName)
export const profileUpdateSchema = profileFormSchema.extend({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(150),
});

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

// Schema for creating natal charts
export const natalChartFormSchema = z.object({
  subjectName: z.string().min(2, 'Name must be at least 2 characters').max(150),
  subjectBirthDate: z.date({
    required_error: 'Please select birth date.',
  }),
  subjectBirthTime: z.string()
    .regex(timeRegex, 'Time must be in HH:MM format (24-hour)')
    .default('00:00'),
  subjectBirthPlace: z.string().min(2, {
    message: 'Birth place must be at least 2 characters.',
  }),
  subjectBirthPlaceData: z.object({
    city: z.string(),
    country: z.string(),
    lat: z.number(),
    lng: z.number(),
    tz: z.string(),
  }).optional(),
  systemId: z.number().min(1, 'Astrology system is required'),
  zodiacType: z.enum(['Tropical', 'Sidereal']).default('Tropical'),
  housesSystem: z.string().default('Placidus'),
  perspectiveType: z.string().default('Apparent Geocentric'),
});

export type NatalChartFormValues = z.infer<typeof natalChartFormSchema>;

// Helper function to combine date and time into a single Date object
export function combineDateAndTime(date: Date, time?: string): Date {
  if (!time) return date;
  
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// Helper function to split a Date into date and time components
export function splitDateTime(dateTime: Date): { date: Date; time: string } {
  const date = new Date(dateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return {
    date,
    time: `${hours}:${minutes}`,
  };
}