// lib/astrology/promptTemplates.ts

export type PromptVariables = Record<string, unknown>;

// Very simple mustache-like renderer: replaces {{ key }} with value
export function renderTemplate(template: string, vars: PromptVariables): string {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_substring: string, key: string): string => {
    const parts = key.split('.');
    let val: unknown = vars;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = (val as Record<string, unknown>)[p];
      } else {
        // Missing key -> empty string
        return '';
      }
    }
    if (val == null) return '';
    if (typeof val === 'string') return val;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  });
}

// Code-based default template for Astrology Insights (by detailLevel)
export function buildDefaultInsightsTemplate(_detailLevel: 'basic' | 'detailed' = 'basic'): string {
  // Currently same content for both; you can branch by detailLevel if needed later
  return [
    'You are an expert astrologer. Write a concise, insightful {{ detailLevel }} overview.',
    '',
    'Birth Information:',
    '- Name: {{ birthData.name }}',
    '- Sun: {{ sunSign }}',
    '- Moon: {{ moonSign }}',
    '- Ascendant: {{ ascendant }}',
    '',
    'Planetary Positions:',
    '{{#planetsList}}',
    '',
    'Houses:',
    '{{#housesList}}',
    '',
    'Lunar Phase: {{ lunarPhaseName }}',
    '',
    'Please follow the tone and structure of this sample:',
    '{{ sampleResponse }}'
  ].join('\n');
}

export function buildDefaultSampleResponse(): string {
  return [
    'Core Personality: Your chart highlights a direct, self-starter spirit with a strong emphasis on authenticity and momentum. You’re energized by new beginnings, clear goals, and the freedom to chart your own course. Emotional needs point to sincerity and intuitive action, while your outward presence projects confidence and initiative.',
    'Strengths: Natural leadership, courage under pressure, and the ability to simplify complexity into decisive motion. You inspire others through clarity and conviction. When aligned with a purpose, you can mobilize resources quickly and create meaningful traction.',
    'Growth Edges: Impatience or all-or-nothing pacing can lead to burnout or friction. The work is to integrate pacing with passion—pausing to listen, collaborate, and refine your approach. Practicing steadiness, delegation, and emotional attunement helps sustain your impact.',
    'Life Themes: Shaping identity through action; learning to balance independence with interdependence; transforming raw drive into constructive mastery. This period favors intentional goals, skill-building, and cultivating relationships that amplify your potential.',
    'Encouragement: Your initiative is a gift—aim it with care. Lead with warmth, honor your instincts, and remember that consistency turns sparks into a lasting flame. Small, steady steps will compound your progress and elevate your natural confidence.'
  ].join('\n\n');
}
