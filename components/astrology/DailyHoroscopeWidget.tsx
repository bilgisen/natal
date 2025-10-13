'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface DailyHoroscopeWidgetProps {
  className?: string;
}

// Note: HoroscopeData interface defined but not currently used

interface ZodiacSign {
  name: string;
  symbol: string;
  dateRange: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', dateRange: 'Mar 21 - Apr 19' },
  { name: 'Taurus', symbol: '♉', dateRange: 'Apr 20 - May 20' },
  { name: 'Gemini', symbol: '♊', dateRange: 'May 21 - Jun 20' },
  { name: 'Cancer', symbol: '♋', dateRange: 'Jun 21 - Jul 22' },
  { name: 'Leo', symbol: '♌', dateRange: 'Jul 23 - Aug 22' },
  { name: 'Virgo', symbol: '♍', dateRange: 'Aug 23 - Sep 22' },
  { name: 'Libra', symbol: '♎', dateRange: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', symbol: '♏', dateRange: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', symbol: '♐', dateRange: 'Nov 22 - Dec 21' },
  { name: 'Capricorn', symbol: '♑', dateRange: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', symbol: '♒', dateRange: 'Jan 20 - Feb 18' },
  { name: 'Pisces', symbol: '♓', dateRange: 'Feb 19 - Mar 20' },
];

interface ParsedHoroscope {
  generalAnalysis: string;
  horoscopeSections: Array<{
    sign: ZodiacSign;
    prediction: string;
  }>;
}

export function DailyHoroscopeWidget({ className }: DailyHoroscopeWidgetProps) {
  const [parsedData, setParsedData] = useState<ParsedHoroscope | null>(null);
  const [loading, setLoading] = useState(true);

  const parseHoroscopeText = (text: string): ParsedHoroscope => {
    const signSections = text.split(/🔮\s*\*\*([^\*]+)\([^\)]+\)\*\*/g).slice(1);
    const horoscopeSections = [];

    for (let i = 0; i < signSections.length; i += 2) {
      const signName = signSections[i]?.trim();
      const prediction = signSections[i + 1]?.trim();
      if (!signName || !prediction) continue;

      const sign = ZODIAC_SIGNS.find((s) =>
        signName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (sign) {
        horoscopeSections.push({
          sign,
          prediction: prediction.trim(),
        });
      }
    }

    horoscopeSections.sort(
      (a, b) =>
        ZODIAC_SIGNS.findIndex((s) => s.name === a.sign.name) -
        ZODIAC_SIGNS.findIndex((s) => s.name === b.sign.name)
    );

    return {
      generalAnalysis:
        "Here's your daily horoscope based on the current planetary positions:",
      horoscopeSections,
    };
  };

  const fetchHoroscope = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/daily-horoscope');
      if (!response.ok) throw new Error('Failed to fetch horoscope');
      const data = await response.json();
      setParsedData(parseHoroscopeText(data.horoscope));
    } catch (error) {
      console.error('Failed to fetch horoscope:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoroscope();
  }, [fetchHoroscope]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">
          Generating your daily horoscope...
        </p>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load horoscope.
      </div>
    );
  }

  return (
    <div
      className={`max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 ${className}`}
    >
      <div>
        <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" /> Daily Horoscope
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          • Analysed by Google Gemini according to Current Transits
        </p>
      </div>

      {parsedData.generalAnalysis && (
        <p className="text-sm max-w-2xl text-muted-foreground hidden">
          {parsedData.generalAnalysis}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {parsedData.horoscopeSections.map(({ sign, prediction }) => (
          <Card key={sign.name} className="h-full text-left">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sign.symbol}</span>
                <div>
                  <h4 className="font-medium text-sm">{sign.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {sign.dateRange}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed">{prediction}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
