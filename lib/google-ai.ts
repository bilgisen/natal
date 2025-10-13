import { google } from '@ai-sdk/google';
import { nanoid } from 'nanoid';

// Create a Google AI instance with the API key
const googleAI = google('gemini-2.5-flash');

// Configuration for the chat model
export const googleAIConfig = {
  model: googleAI,
  initialMessages: [
    {
      id: nanoid(),
      role: 'system' as const,
      content: 'You are a helpful AI assistant. Answer concisely and helpfully.'
    }
  ],
  // These options will be passed to the API call
  options: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 2048,
  }
};
