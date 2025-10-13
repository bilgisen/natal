// schemas/preferences.schema.ts
import { z } from 'zod';

export const prioritySchema = z.object({
  key: z.enum(['love', 'money', 'health', 'career', 'spirituality', 'family', 'friendship']),
  importance: z.number().int().min(1).max(5).default(3),
});

export const notificationSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'instant']),
  channel: z.enum(['email', 'sms', 'push', 'in_app']),
  enabled: z.boolean().default(true),
  nextSendAt: z.date().optional(),
});

export const userPreferencesSchema = z.object({
  priorities: z.array(prioritySchema).max(10),
  notifications: z.array(notificationSchema),
  language: z.enum(['en', 'fr', 'pt', 'it', 'cn', 'es', 'ru', 'tr', 'de', 'hi']),
  timezone: z.string().min(1),
  birthTimeKnown: z.boolean().default(true),
});

export type Priority = z.infer<typeof prioritySchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;