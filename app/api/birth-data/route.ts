import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { natalChartFormSchema } from '@/schemas/profile.schema';
import { fetchBirthData } from '@/lib/astrologer/api/fetchBirthData';
import { getCountryCode } from '@/lib/astrologer/utils/countryCode';
import { toBirthData } from '@/lib/astrologer/mapping/toBirthData';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = natalChartFormSchema.parse(body);

    console.log('Fetching birth data for:', validatedData.subjectName);

    const [hours, minutes] = validatedData.subjectBirthTime?.split(':').map(Number) || [0, 0];
    const birthDate = new Date(validatedData.subjectBirthDate);
    const countryCode = getCountryCode(validatedData.subjectBirthPlaceData?.country || '');

    const requestData = {
      subject: {
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
        hour: hours,
        minute: minutes,
        longitude: validatedData.subjectBirthPlaceData?.lng || 0,
        latitude: validatedData.subjectBirthPlaceData?.lat || 0,
        city: validatedData.subjectBirthPlaceData?.city || '',
        nation: countryCode,
        timezone: validatedData.subjectBirthPlaceData?.tz || 'UTC',
        name: validatedData.subjectName,
        zodiac_type: 'Tropic' as const,
        sidereal_mode: null,
        perspective_type: 'Apparent Geocentric',
        houses_system_identifier: 'P',
      },
      theme: 'classic',
      language: 'EN',
      wheel_only: false,
    };

    const rawResponse = await fetchBirthData(requestData);
    const data = toBirthData(rawResponse);

    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching birth data:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
