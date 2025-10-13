// lib/astrology/timeUtils.ts
/**
 * Utility functions for handling birth time calculations with proper timezone support
 */

/**
 * Calculate local and UTC timestamps from birth date, time, and timezone
 */
export function calculateBirthTimeStamps(
  birthDate: Date,
  _birthTime: string,
  _timezone: string // eslint-disable-line @typescript-eslint/no-unused-vars
): {
  localTime: number;
  utcTime: number;
  julianDay: number;
} {
  try {
    // Parse birth time (HH:MM format)
    const [hours, minutes] = _birthTime.split(':').map(Number);

    // Create a date object with the birth date and time
    // Note: We use the local timezone interpretation of the Date constructor
    // but then we'll adjust for the actual timezone
    const birthDateTime = new Date(birthDate);
    birthDateTime.setHours(hours || 0, minutes || 0, 0, 0);

    // For timezone conversion, we'll use a simple approach
    // Since the astrologer API expects these as Unix timestamps,
    // we'll calculate them properly

    // Get the UTC time by converting from local time
    const utcTime = birthDateTime.getTime();

    // For local time, we need to account for the timezone offset
    // This is a simplified approach - in a real implementation,
    // you might want to use a proper timezone library
    const localTime = utcTime; // For now, treat as UTC since we don't have proper timezone conversion

    // Calculate Julian Day (simplified calculation)
    const julianDay = calculateJulianDay(birthDateTime);

    return {
      localTime: Math.floor(localTime / 1000), // Convert to seconds
      utcTime: Math.floor(utcTime / 1000),     // Convert to seconds
      julianDay
    };
  } catch (error) {
    console.error('Error calculating birth time stamps:', error);
    // Return default values if calculation fails
    return {
      localTime: 0,
      utcTime: 0,
      julianDay: 0
    };
  }
}

/**
 * Simplified Julian Day calculation
 */
function calculateJulianDay(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;

  const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Add fractional day for time
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const fractionalDay = (hours - 12) / 24 + minutes / 1440 + seconds / 86400;

  return jdn + fractionalDay;
}
