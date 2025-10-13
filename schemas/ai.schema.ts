// schemas/ai.schema.ts
import { z } from 'zod';

export const aiPromptSchema = z.object({
  key: z.string().min(1).max(100),
  systemId: z.number().int().positive().nullable(),
  title: z.string().max(200).optional(),
  template: z.string().min(1),
  variables: z.array(z.string()).optional(),
  version: z.number().int().min(1).default(1),
});

export const aiReportSchema = z.object({
  chartId: z.string().uuid(),
  systemId: z.number().int().positive().nullable(),
  reportType: z.enum(['natal', 'daily', 'monthly', 'public_sign', 'transit']),
  content: z.string().min(1),
  metadata: z.object({
    model: z.string(),
    tokens: z.number().int(),
    runtime: z.number(),
    temperature: z.number().min(0).max(1),
  }).optional(),
  promptId: z.string().uuid().optional(),
  isPublic: z.boolean().default(false),
  targetSign: z.string().max(50).optional(),
});

export const aiGenerationRequestSchema = z.object({
  chartId: z.string().uuid(),
  reportType: z.enum(['natal', 'daily', 'monthly', 'transit']),
  systemId: z.number().int().positive().optional(),
  customPrompt: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'insightful', 'poetic']).optional(),
});

export type AIPrompt = z.infer<typeof aiPromptSchema>;
export type AIReport = z.infer<typeof aiReportSchema>;
export type AIGenerationRequest = z.infer<typeof aiGenerationRequestSchema>;