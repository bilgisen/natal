// app/api/ai/daily-horoscope/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { getRedisService } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOROSCOPE_CACHE_KEY = 'dailyHoroscopeData';
const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface DailyHoroscopeRequest {
  currentTransits: {
    lunar_phase: {
      moon_phase_name: string;
      moon_emoji: string;
    };
    sun: { sign: string; position: number };
    moon: { sign: string; position: number };
    mercury: { sign: string; position: number };
    venus: { sign: string; position: number };
    mars: { sign: string; position: number };
    jupiter: { sign: string; position: number };
    saturn: { sign: string; position: number };
    uranus: { sign: string; position: number };
    neptune: { sign: string; position: number };
    pluto: { sign: string; position: number };
  };
  currentDate: string;
}

// GET endpoint - fetches or generates daily horoscope with caching
export async function GET() { 
  try {
    const cacheKey = `${HOROSCOPE_CACHE_KEY}:${getTodayDateString()}`;
    
    // Try to get from Redis cache first
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
          console.log('Returning cached daily horoscope');
          return NextResponse.json(JSON.parse(cachedData));
        }
      }
    } catch (redisError) {
      console.warn('Redis cache check failed, generating fresh horoscope:', redisError);
    }

    // Generate fresh horoscope if not in cache
    console.log('Generating fresh daily horoscope');
    
    // Fetch current transits (you may want to implement this properly)
    // For now, we'll use a simplified version
    const currentDate = getTodayDateString();
    
    // Create a simplified prompt for GET requests
    const prompt = buildSimplifiedDailyHoroscopePrompt(currentDate);
    
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    const responseData = {
      horoscope: result.text,
      date: currentDate,
      generatedAt: new Date().toISOString()
    };

    // Cache the result for 1 hour
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        await redisService.setex(cacheKey, 3600, JSON.stringify(responseData));
        console.log('Cached daily horoscope for 1 hour');
      }
    } catch (cacheError) {
      console.warn('Failed to cache horoscope:', cacheError);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Daily Horoscope GET error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Failed to fetch daily horoscope',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let requestBody: DailyHoroscopeRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { currentTransits, currentDate } = requestBody;

    // Validate required fields
    if (!currentTransits) {
      console.error('Missing currentTransits in request');
      return NextResponse.json(
        { error: 'Current transits data is required' },
        { status: 400 }
      );
    }

    console.log('Generating daily horoscope for:', currentDate);

    // Create prompt for daily horoscope based on current transits
    const prompt = buildDailyHoroscopePrompt(currentTransits, currentDate);

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      horoscope: result.text,
      date: currentDate,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily Horoscope generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Failed to generate daily horoscope',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

function buildSimplifiedDailyHoroscopePrompt(date: string): string {
  return [
    'You are an expert astrologer specializing in daily horoscopes. Provide insightful daily predictions for each zodiac sign.',
    '',
    `Today's Date: ${date}`,
    '',
    'Please provide daily horoscope predictions for each of the 12 zodiac signs:',
    '',
    'Format each sign prediction as:',
    '🔮 **[Sign Name] ([Date Range])**',
    '[3-4 sentences of insightful daily guidance]',
    '',
    'Make the predictions:',
    '- Personalized to each sign\'s characteristics',
    '- Practical and actionable for daily life',
    '- Positive and empowering in tone',
    '- Keep each prediction concise but meaningful (3-4 sentences maximum)',
    '',
    'Cover all 12 signs in order: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces',
    '',
    'Focus on: relationships, career, health, opportunities, challenges, and emotional well-being for each sign.'
  ].join('\n');
}

interface CurrentTransits {
  lunar_phase: { moon_phase_name: string; moon_emoji: string };
  sun: { sign: string; position: number };
  moon: { sign: string; position: number };
  mercury: { sign: string; position: number };
  venus: { sign: string; position: number };
  mars: { sign: string; position: number };
  jupiter: { sign: string; position: number };
  saturn: { sign: string; position: number };
  uranus: { sign: string; position: number };
  neptune: { sign: string; position: number };
  pluto: { sign: string; position: number };
}

function buildDailyHoroscopePrompt(transits: CurrentTransits, date: string): string {
  return [
    'You are an expert astrologer specializing in daily horoscopes. Based on the current planetary positions and lunar phase, provide insightful daily predictions for each zodiac sign.',
    '',
    `Today's Date: ${date}`,
    '',
    'Current Celestial Influences:',
    `- Lunar Phase: ${transits.lunar_phase.moon_phase_name} ${transits.lunar_phase.moon_emoji}`,
    `- Sun in ${transits.sun.sign} at ${transits.sun.position.toFixed(1)}°`,
    `- Moon in ${transits.moon.sign} at ${transits.moon.position.toFixed(1)}°`,
    `- Mercury in ${transits.mercury.sign} at ${transits.mercury.position.toFixed(1)}°`,
    `- Venus in ${transits.venus.sign} at ${transits.venus.position.toFixed(1)}°`,
    `- Mars in ${transits.mars.sign} at ${transits.mars.position.toFixed(1)}°`,
    `- Jupiter in ${transits.jupiter.sign} at ${transits.jupiter.position.toFixed(1)}°`,
    `- Saturn in ${transits.saturn.sign} at ${transits.saturn.position.toFixed(1)}°`,
    `- Uranus in ${transits.uranus.sign} at ${transits.uranus.position.toFixed(1)}°`,
    `- Neptune in ${transits.neptune.sign} at ${transits.neptune.position.toFixed(1)}°`,
    `- Pluto in ${transits.pluto.sign} at ${transits.pluto.position.toFixed(1)}°`,
    '',
    'Please provide daily horoscope predictions for each of the 12 zodiac signs:',
    '',
    'Format each sign prediction as:',
    '🔮 **[Sign Name] ([Date Range])**',
    '[3-4 sentences of insightful daily guidance based on current transits]',
    '',
    'Make the predictions:',
    '- Personalized to each sign\'s characteristics and current planetary influences',
    '- Practical and actionable for daily life',
    '- Positive and empowering in tone',
    '- Consider how the current lunar phase and planetary positions affect each sign differently',
    '- Keep each prediction concise but meaningful (3-4 sentences maximum)',
    '',
    'Cover all 12 signs in order: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces',
    '',
    'Focus on: relationships, career, health, opportunities, challenges, and emotional well-being for each sign.'
  ].join('\n');
}
