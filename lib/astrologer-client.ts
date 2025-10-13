// lib/astrologer-client.ts
import { z } from 'zod';
import { natalChartFormSchema } from '@/schemas/profile.schema';
import { birthDataSchema, BirthData } from '@/schemas/astro.schema';

// Simple country name to ISO code mapping
const countryCodeMap: { [key: string]: string } = {
  'Türkiye': 'TR',
  'Turkey': 'TR',
  'United States': 'US',
  'USA': 'US',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Germany': 'DE',
  'Deutschland': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'España': 'ES',
  'Italy': 'IT',
  'Italia': 'IT',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Brasil': 'BR',
  'Russia': 'RU',
  'Россия': 'RU',
  'Netherlands': 'NL',
  'Nederland': 'NL',
  'Belgium': 'BE',
  'België': 'BE',
  'Switzerland': 'CH',
  'Suisse': 'CH',
  'Schweiz': 'CH',
  'Austria': 'AT',
  'Österreich': 'AT',
  'Sweden': 'SE',
  'Sverige': 'SE',
  'Norway': 'NO',
  'Norge': 'NO',
  'Denmark': 'DK',
  'Danmark': 'DK',
  'Finland': 'FI',
  'Suomi': 'FI',
  'Poland': 'PL',
  'Polska': 'PL',
  'Czech Republic': 'CZ',
  'Česko': 'CZ',
  'Czechia': 'CZ',
  'Hungary': 'HU',
  'Magyarország': 'HU',
  'Greece': 'GR',
  'Ελλάδα': 'GR',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Éire': 'IE',
  'New Zealand': 'NZ',
  'South Korea': 'KR',
  '한국': 'KR',
  'South Africa': 'ZA',
  'Mexico': 'MX',
  'México': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Uruguay': 'UY',
  'Ecuador': 'EC',
  'Bolivia': 'BO',
  'Paraguay': 'PY',
  'Guyana': 'GY',
  'Suriname': 'SR',
  'French Guiana': 'GF',
  'Israel': 'IL',
  'ישראל': 'IL',
  'Palestine': 'PS',
  'Egypt': 'EG',
  'مصر': 'EG',
  'Morocco': 'MA',
  'المغرب': 'MA',
  'Algeria': 'DZ',
  'الجزائر': 'DZ',
  'Tunisia': 'TN',
  'تونس': 'TN',
  'Libya': 'LY',
  'ليبيا': 'LY',
  'Sudan': 'SD',
  'السودان': 'SD',
  'Ethiopia': 'ET',
  'ኢትዮጵያ': 'ET',
  'Kenya': 'KE',
  'Uganda': 'UG',
  'Tanzania': 'TZ',
  'Rwanda': 'RW',
  'Burundi': 'BI',
  'Democratic Republic of the Congo': 'CD',
  'République démocratique du Congo': 'CD',
  'Republic of the Congo': 'CG',
  'République du Congo': 'CG',
  'Gabon': 'GA',
  'Cameroon': 'CM',
  'Cameroun': 'CM',
  'Central African Republic': 'CF',
  'République centrafricaine': 'CF',
  'Chad': 'TD',
  'تشار': 'TD',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'Ivory Coast': 'CI',
  'Côte d\'Ivoire': 'CI',
  'Mali': 'ML',
  'Burkina Faso': 'BF',
  'Senegal': 'SN',
  'Gambia': 'GM',
  'Guinea': 'GN',
  'Guinée': 'GN',
  'Sierra Leone': 'SL',
  'Liberia': 'LR',
  'Guinea-Bissau': 'GW',
  'Guiné-Bissau': 'GW',
  'Mauritania': 'MR',
  'موريتانيا': 'MR',
  'Western Sahara': 'EH',
  'الصحراء الغربية': 'EH',
  'Angola': 'AO',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Lesotho': 'LS',
  'Swaziland': 'SZ',
  'Eswatini': 'SZ',
  'Madagascar': 'MG',
  'Madagasikara': 'MG',
  'Mauritius': 'MU',
  'Moris': 'MU',
  'Seychelles': 'SC',
  'Sesel': 'SC',
  'Comoros': 'KM',
  'Komori': 'KM',
  'Maldives': 'MV',
  'ދިވެހިރާއްޖެ': 'MV',
  'Sri Lanka': 'LK',
  'ශ්‍රී ලංකාව': 'LK',
  'Bangladesh': 'BD',
  'বাংলাদেশ': 'BD',
  'Nepal': 'NP',
  'नेपाल': 'NP',
  'Bhutan': 'BT',
  'འབྲུག': 'BT',
  'Pakistan': 'PK',
  'پاکستان': 'PK',
  'Afghanistan': 'AF',
  'افغانستان': 'AF',
  'Iran': 'IR',
  'ایران': 'IR',
  'Iraq': 'IQ',
  'العراق': 'IQ',
  'Syria': 'SY',
  'سوريا': 'SY',
  'Jordan': 'JO',
  'الأردن': 'JO',
  'Lebanon': 'LB',
  'لبنان': 'LB',
  'Saudi Arabia': 'SA',
  'السعودية': 'SA',
  'Yemen': 'YE',
  'اليمن': 'YE',
  'Oman': 'OM',
  'عمان': 'OM',
  'United Arab Emirates': 'AE',
  'الإمارات العربية المتحدة': 'AE',
  'Qatar': 'QA',
  'قطر': 'QA',
  'Bahrain': 'BH',
  'البحرين': 'BH',
  'Kuwait': 'KW',
  'الكويت': 'KW',
  'Thailand': 'TH',
  'ประเทศไทย': 'TH',
  'Vietnam': 'VN',
  'Việt Nam': 'VN',
  'Cambodia': 'KH',
  'កម្ពុជា': 'KH',
  'Laos': 'LA',
  'ລາວ': 'LA',
  'Myanmar': 'MM',
  'မြန်မာနိုင်ငံ': 'MM',
  'Burma': 'MM',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Brunei': 'BN',
  'East Timor': 'TL',
  'Timor-Leste': 'TL',
  'Papua New Guinea': 'PG',
  'Solomon Islands': 'SB',
  'Vanuatu': 'VU',
  'Fiji': 'FJ',
  'Tonga': 'TO',
  'Samoa': 'WS',
  'Kiribati': 'KI',
  'Micronesia': 'FM',
  'Palau': 'PW',
  'Marshall Islands': 'MH',
  'Nauru': 'NR',
  'Tuvalu': 'TV',
  'Iceland': 'IS',
  'Ísland': 'IS',
  'Greenland': 'GL',
  'Kalaallit Nunaat': 'GL',
  'Faroe Islands': 'FO',
  'Føroyar': 'FO',
  'Åland Islands': 'AX',
  'Aland': 'AX',
  'Monaco': 'MC',
  'Liechtenstein': 'LI',
  'San Marino': 'SM',
  'Vatican City': 'VA',
  'Città del Vaticano': 'VA',
  'Andorra': 'AD',
  'Luxembourg': 'LU',
  'Lëtzebuerg': 'LU',
  'Malta': 'MT',
  'Belarus': 'BY',
  'Беларусь': 'BY',
  'Ukraine': 'UA',
  'Україна': 'UA',
  'Moldova': 'MD',
  'Romania': 'RO',
  'România': 'RO',
  'Bulgaria': 'BG',
  'България': 'BG',
  'Albania': 'AL',
  'Shqipëria': 'AL',
  'North Macedonia': 'MK',
  'Северна Македонија': 'MK',
  'Croatia': 'HR',
  'Hrvatska': 'HR',
  'Slovenia': 'SI',
  'Slovenija': 'SI',
  'Bosnia and Herzegovina': 'BA',
  'Bosna i Hercegovina': 'BA',
  'Serbia': 'RS',
  'Србија': 'RS',
  'Montenegro': 'ME',
  'Црна Гора': 'ME',
  'Kosovo': 'XK',
  'Kosova': 'XK',
  'Estonia': 'EE',
  'Eesti': 'EE',
  'Latvia': 'LV',
  'Latvija': 'LV',
  'Lithuania': 'LT',
  'Lietuva': 'LT',
  'North Korea': 'KP',
  '조선민주주의인민공화국': 'KP',
  'Mongolia': 'MN',
  'Монгол Улс': 'MN',
  'Kazakhstan': 'KZ',
  'Қазақстан': 'KZ',
  'Kyrgyzstan': 'KG',
  'Кыргызстан': 'KG',
  'Tajikistan': 'TJ',
  'Тоҷикистон': 'TJ',
  'Turkmenistan': 'TM',
  'Türkmenistan': 'TM',
  'Uzbekistan': 'UZ',
  'Oʻzbekiston': 'UZ',
  'Azerbaijan': 'AZ',
  'Azərbaycan': 'AZ',
  'Georgia': 'GE',
  'საქართველო': 'GE',
  'Armenia': 'AM',
  'Հայաստան': 'AM',
  'Cyprus': 'CY',
  'Κύπρος': 'CY',
  'Northern Cyprus': 'NC',
  'Kuzey Kıbrıs': 'NC'
};

function getCountryCode(countryName: string): string {
  // First try direct lookup
  if (countryCodeMap[countryName]) {
    return countryCodeMap[countryName];
  }

  // Try case-insensitive lookup
  const lowerCountry = countryName.toLowerCase();
  for (const [name, code] of Object.entries(countryCodeMap)) {
    if (name.toLowerCase() === lowerCountry) {
      return code;
    }
  }

  // If not found, try to extract 2-letter code from the name
  const words = countryName.split(' ');
  if (words.length >= 1) {
    const potentialCode = words[0].substring(0, 2).toUpperCase();
    if (potentialCode.length === 2 && /^[A-Z]{2}$/.test(potentialCode)) {
      return potentialCode;
    }
  }

  // Default fallback
  console.warn(`Unknown country: ${countryName}, using 'US' as fallback`);
  return 'US';
}

type BirthDataRequest = {
  subject: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    longitude: number;
    latitude: number;
    city: string;
    nation: string;
    timezone: string;
    name: string;
    zodiac_type: 'Tropic' | 'Sidereal';
    sidereal_mode: string | null;
    perspective_type: string;
    houses_system_identifier: string;
  };
  theme: string;
  language: string;
  wheel_only: boolean;
};

export interface BirthDataResponse {
  status: string;
  data: BirthData & {
    rawData?: Record<string, unknown>; // For debugging purposes
  };
};

export async function getBirthData(
  data: z.infer<typeof natalChartFormSchema>
): Promise<BirthDataResponse> {
  const apiKey = process.env.NEXT_PUBLIC_ASTROLOGER_API_KEY;
  const host = process.env.NEXT_PUBLIC_ASTROLOGER_API_HOST || process.env.ASTROLOGER_API_HOST;

  if (!apiKey || !host) {
    throw new Error('Astrologer API configuration is missing');
  }

  const [hours, minutes] = data.subjectBirthTime?.split(':').map(Number) || [0, 0];
  const birthDate = new Date(data.subjectBirthDate);

  // Convert country name to ISO code
  const countryCode = getCountryCode(data.subjectBirthPlaceData?.country || '');

  const requestData: BirthDataRequest = {
    subject: {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: hours,
      minute: minutes,
      longitude: data.subjectBirthPlaceData?.lng || 0,
      latitude: data.subjectBirthPlaceData?.lat || 0,
      city: data.subjectBirthPlaceData?.city || '',
      nation: countryCode, // Use the ISO code
      timezone: data.subjectBirthPlaceData?.tz || 'UTC',
      name: data.subjectName,
      zodiac_type: 'Tropic',
      sidereal_mode: null,
      perspective_type: 'Apparent Geocentric',
      houses_system_identifier: 'P' // Placidus
    },
    theme: 'classic',
    language: 'EN',
    wheel_only: false
  };

  console.log('Making birth-data API request to Astrologer API...');
  console.log('Country code used:', countryCode, 'for country:', data.subjectBirthPlaceData?.country);

  try {
    const response = await fetch('https://astrologer.p.rapidapi.com/api/v4/birth-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
      },
      body: JSON.stringify(requestData)
    });

    console.log('Birth-data API Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Birth-data API Error:', error);
      throw new Error(`Astrologer birth-data API error: ${response.status} ${error}`);
    }

    const responseData: { status?: string; data?: unknown } = await response.json();
    console.log('Birth-data API Response structure:', Object.keys(responseData));

    // The birth-data API returns data under different keys depending on the response
    let birthData: Record<string, unknown> = responseData;

    // Check if the data is nested under 'data' key
    if (responseData.data) {
      birthData = responseData.data as Record<string, unknown>;
    }

    console.log('Birth data keys:', Object.keys(birthData));

    // Ensure all required fields are present and properly formatted
    const formattedData = {
      name: (birthData as { name?: string }).name || '',
      year: (birthData as { year?: number }).year || new Date().getFullYear(),
      month: (birthData as { month?: number }).month || 1,
      day: (birthData as { day?: number }).day || 1,
      hour: (birthData as { hour?: number }).hour || 0,
      minute: (birthData as { minute?: number }).minute || 0,
      city: (birthData as { city?: string }).city || '',
      nation: (birthData as { nation?: string }).nation || '',
      lng: (birthData as { lng?: number }).lng || 0,
      lat: (birthData as { lat?: number }).lat || 0,
      tz_str: (birthData as { tz_str?: string }).tz_str || 'UTC',
      zodiac_type: (birthData as { zodiac_type?: string }).zodiac_type || 'Tropic',
      local_time: (birthData as { local_time?: number }).local_time || 0,
      utc_time: (birthData as { utc_time?: number }).utc_time || 0,
      julian_day: (birthData as { julian_day?: number }).julian_day || 0,
      // Map celestial bodies
      sun: (birthData as { sun?: unknown }).sun,
      moon: (birthData as { moon?: unknown }).moon,
      mercury: (birthData as { mercury?: unknown }).mercury,
      venus: (birthData as { venus?: unknown }).venus,
      mars: (birthData as { mars?: unknown }).mars,
      jupiter: (birthData as { jupiter?: unknown }).jupiter,
      saturn: (birthData as { saturn?: unknown }).saturn,
      uranus: (birthData as { uranus?: unknown }).uranus,
      neptune: (birthData as { neptune?: unknown }).neptune,
      pluto: (birthData as { pluto?: unknown }).pluto,
      chiron: (birthData as { chiron?: unknown }).chiron,
      // Map axial points (using both possible field names)
      asc: (birthData as { asc?: unknown }).asc || (birthData as { ascendant?: unknown }).ascendant,
      dsc: (birthData as { dsc?: unknown }).dsc || (birthData as { descendant?: unknown }).descendant,
      mc: (birthData as { mc?: unknown }).mc || (birthData as { medium_coeli?: unknown }).medium_coeli,
      ic: (birthData as { ic?: unknown }).ic || (birthData as { imum_coeli?: unknown }).imum_coeli,
      // Map houses
      first_house: (birthData as { first_house?: unknown }).first_house || (birthData as { houses?: unknown[] }).houses?.[0],
      second_house: (birthData as { second_house?: unknown }).second_house || (birthData as { houses?: unknown[] }).houses?.[1],
      third_house: (birthData as { third_house?: unknown }).third_house || (birthData as { houses?: unknown[] }).houses?.[2],
      fourth_house: (birthData as { fourth_house?: unknown }).fourth_house || (birthData as { houses?: unknown[] }).houses?.[3],
      fifth_house: (birthData as { fifth_house?: unknown }).fifth_house || (birthData as { houses?: unknown[] }).houses?.[4],
      sixth_house: (birthData as { sixth_house?: unknown }).sixth_house || (birthData as { houses?: unknown[] }).houses?.[5],
      seventh_house: (birthData as { seventh_house?: unknown }).seventh_house || (birthData as { houses?: unknown[] }).houses?.[6],
      eighth_house: (birthData as { eighth_house?: unknown }).eighth_house || (birthData as { houses?: unknown[] }).houses?.[7],
      ninth_house: (birthData as { ninth_house?: unknown }).ninth_house || (birthData as { houses?: unknown[] }).houses?.[8],
      tenth_house: (birthData as { tenth_house?: unknown }).tenth_house || (birthData as { houses?: unknown[] }).houses?.[9],
      eleventh_house: (birthData as { eleventh_house?: unknown }).eleventh_house || (birthData as { houses?: unknown[] }).houses?.[10],
      twelfth_house: (birthData as { twelfth_house?: unknown }).twelfth_house || (birthData as { houses?: unknown[] }).houses?.[11],
      // Map nodes
      mean_node: (birthData as { mean_node?: unknown }).mean_node,
      true_node: (birthData as { true_node?: unknown }).true_node,
      mean_south_node: (birthData as { mean_south_node?: unknown }).mean_south_node,
      true_south_node: (birthData as { true_south_node?: unknown }).true_south_node,
      // Lunar phase
      lunar_phase: (birthData as { lunar_phase?: unknown }).lunar_phase || {
        degrees_between_s_m: 0,
        moon_phase: 0,
        sun_phase: 0,
        moon_emoji: '🌑',
        moon_phase_name: 'New Moon',
        illumination: 0
      },
      // Additional data
      sidereal_mode: (birthData as { sidereal_mode?: unknown }).sidereal_mode || null,
      houses_system_identifier: (birthData as { houses_system_identifier?: unknown }).houses_system_identifier || 'P',
      perspective_type: (birthData as { perspective_type?: unknown }).perspective_type || 'Apparent Geocentric'
    };

    console.log('Formatted birth data keys:', Object.keys(formattedData));

    // Parse the birth data with our schema
    const parsedData = birthDataSchema.parse(formattedData);
    const status = responseData.status || 'success';
    
    console.log('Successfully parsed birth data');
    return { 
      status, 
      data: {
        ...parsedData,
        // Add raw data for debugging purposes
        rawData: responseData
      }
    };
  } catch (error) {
    console.error('Error in getBirthData:', error);
    throw error;
  }
}
