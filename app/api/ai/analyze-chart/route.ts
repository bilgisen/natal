// app/api/ai/analyze-chart/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { aiReports, natalCharts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { renderTemplate, buildDefaultSampleResponse, buildDefaultInsightsTemplate } from '@/lib/astrology/promptTemplates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChartData {
  birthData: {
    name?: string;
    asc: {
      name?: string;
      quality?: string;
      element?: string;
      sign?: string;
      sign_num?: number;
      position?: number;
      abs_pos?: number;
      emoji?: string;
      point_type?: string;
    };
    sun?: { sign?: string; position?: number };
    moon?: { sign?: string; position?: number };
    mercury?: { sign?: string; position?: number };
    venus?: { sign?: string; position?: number };
    mars?: { sign?: string; position?: number };
    jupiter?: { sign?: string; position?: number };
    saturn?: { sign?: string; position?: number };
    uranus?: { sign?: string; position?: number };
    neptune?: { sign?: string; position?: number };
    pluto?: { sign?: string; position?: number };
    [key: string]: unknown;
  };
  planets?: Record<string, [number]> | Array<{
    name: string;
    sign: string;
    position: number;
    house: number;
    retrograde: boolean;
    emoji: string;
  }>;
  houses?: Array<{
    houseNumber: number;
    sign: string;
    cuspPosition: number;
    emoji: string;
  }>;
  lunarPhase?: {
    degreesBetweenSunMoon: number;
    moonPhase: string;
    sunPhase: string;
    moonEmoji: string;
    moonPhaseName: string;
  } | null;
  cusps?: number[];
}

interface AnalyzeChartRequest {
  chartData?: ChartData;
  options?: Record<string, unknown>;
  profileId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let requestBody: AnalyzeChartRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { chartData, profileId } = requestBody;

    // Validate required fields
    if (!chartData) {
      console.error('Missing chartData in request');
      return NextResponse.json(
        { error: 'Chart data is required' },
        { status: 400 }
      );
    }

    if (!chartData.birthData) {
      console.error('Missing birthData in chartData');
      return NextResponse.json(
        { error: 'Birth data is required for analysis' },
        { status: 400 }
      );
    }

    // Add debug logging
    console.log('Received chart data for analysis:', {
      name: chartData.birthData.name,
      sunSign: chartData.birthData.sun?.sign,
      moonSign: chartData.birthData.moon?.sign,
      ascendant: chartData.birthData.asc?.sign
    });

    // Rest of your existing code...
    const birthData = chartData.birthData;
    const sunSign = birthData.sun?.sign ?? 'Unknown';
    const moonSign = birthData.moon?.sign ?? 'Unknown';
    const ascendant = birthData.asc?.sign ?? 'Unknown';

    // Get planets data if available
    const planets = chartData.planets || [];
    
    // Convert planets object to array if needed
    const planetsArray = Array.isArray(planets) ? planets : Object.entries(planets).map(([name, position]) => ({
      name,
      position: Array.isArray(position) ? position[0] : position,
      sign: 'Unknown',
      house: 1,
      retrograde: false,
      emoji: '⭐'
    }));

    // Extract houses data from birthData
    const houses = [];
    if (birthData) {
      for (let i = 1; i <= 12; i++) {
        const houseKey = i === 1 ? 'first_house' : 
                        i === 2 ? 'second_house' : 
                        i === 3 ? 'third_house' : 
                        i === 4 ? 'fourth_house' : 
                        i === 5 ? 'fifth_house' : 
                        i === 6 ? 'sixth_house' : 
                        i === 7 ? 'seventh_house' : 
                        i === 8 ? 'eighth_house' : 
                        i === 9 ? 'ninth_house' : 
                        i === 10 ? 'tenth_house' : 
                        i === 11 ? 'eleventh_house' : 'twelfth_house';
        
        const houseData = birthData[houseKey];
        if (houseData) {
          houses.push({
            houseNumber: i,
            sign: (houseData as { sign?: string }).sign || 'Unknown',
            cuspPosition: (houseData as { position?: number }).position || 0,
            emoji: '🏠'
          });
        }
      }
    }

    // Extract lunar phase data from birthData if available
    const lunarPhase = birthData?.lunar_phase ? {
      degreesBetweenSunMoon: (birthData.lunar_phase as { degrees_between_s_m?: number }).degrees_between_s_m || 0,
      moonPhase: (birthData.lunar_phase as { moon_phase?: string }).moon_phase || 'Unknown',
      sunPhase: (birthData.lunar_phase as { sun_phase?: string }).sun_phase || 'Unknown',
      moonEmoji: (birthData.lunar_phase as { moon_emoji?: string }).moon_emoji || '🌑',
      moonPhaseName: (birthData.lunar_phase as { moon_phase_name?: string }).moon_phase_name || 'Unknown'
    } : null;

    // Build prompt via code-based templates (no DB needed)
    const detailLevel = (requestBody.options as { detailLevel?: string })?.detailLevel ?? 'basic';
    const defaultTemplate = buildDefaultInsightsTemplate();

    const planetsList = planetsArray.map((p) => `- ${p.name}: ${p.sign} (House ${p.house})`).join('\n');
    const housesList = houses.length
      ? houses.map((h) => `House ${h.houseNumber}: ${h.sign}`).join('\n')
      : 'Not available';

    const variables = {
      birthData,
      sunSign,
      moonSign,
      ascendant,
      planetsList,
      housesList,
      lunarPhaseName: lunarPhase?.moonPhaseName || 'Not available',
      detailLevel,
      sampleResponse: buildDefaultSampleResponse(),
    };

    // Replace simple {{var}} placeholders and support #list pre-rendered strings
    const prompt = renderTemplate(defaultTemplate, variables)
      .replace('{{#planetsList}}', planetsList)
      .replace('{{#housesList}}', housesList);

    // Try cache: find latest natal chart for this profile and a stored report
    if (profileId) {
      const latestChart = await db
        .select()
        .from(natalCharts)
        .where(eq(natalCharts.profileId, profileId))
        .orderBy(desc(natalCharts.createdAt))
        .limit(1)
        .then(results => results[0]);

      if (latestChart) {
        const cachedReport = await db
          .select()
          .from(aiReports)
          .where(eq(aiReports.chartId, latestChart.id))
          .orderBy(desc(aiReports.createdAt))
          .limit(1)
          .then(results => results[0]);

        if (cachedReport?.content) {
          return NextResponse.json({ analysis: cachedReport.content, cached: true });
        }
      }
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Store the generated analysis for future requests
    if (profileId) {
      const latestChart = await db
        .select()
        .from(natalCharts)
        .where(eq(natalCharts.profileId, profileId))
        .orderBy(desc(natalCharts.createdAt))
        .limit(1)
        .then(results => results[0]);

      if (latestChart) {
        await db.insert(aiReports).values({
          chartId: latestChart.id,
          reportType: 'overview',
          content: result.text,
          metadata: {
            name: birthData.name,
            sunSign,
            moonSign,
            ascendant,
          },
        });
      }
    }

    return NextResponse.json({ analysis: result.text, cached: false });
  } catch (error) {
    console.error('AI Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to generate analysis',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
