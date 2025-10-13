'use client';

import { useChat } from 'ai/react';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export type ProfileChatProps = {
  profileId: string;
  displayName?: string | null;
  basicContextJson?: string | null;
  detailedContextJson?: string | null;
};

export default function ProfileChat({ profileId, displayName, basicContextJson, detailedContextJson }: ProfileChatProps) {
  const effectiveName = displayName ?? 'there';
  const chatKey = `profile-chat-${profileId}-${!!basicContextJson}`;

  const systemMessage = useMemo(() => {
    const header = `Howdy ${effectiveName}.  Ask me anything about your birth chart.`;
    const instructions = [
      '- Always read and use the provided Profile Context JSON when answering.',
      '- If sunSign, moonSign, or ascendant are present, use them directly without asking for birth details.',
      '- If key data is missing (e.g., no birthDate/place and no signs), ask for only the missing fields.',
      "- Mirror the user's language in your responses (e.g., reply in Turkish if the user writes in Turkish).",
      '- Be concise and helpful.',
    ].join('\n');
    const context = basicContextJson ? `\nBasic Profile Context (JSON):\n${basicContextJson}` : '';
    return `${header}\n\nInstructions:\n${instructions}${context}`;
  }, [effectiveName, basicContextJson]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat/google',
    key: chatKey,
    initialMessages: [
      {
        id: `sys-${chatKey}`,
        role: 'system',
        content: systemMessage,
      },
      {
        id: `asst-welcome-${chatKey}`,
        role: 'assistant',
        content: `Howdy ${effectiveName}.  Ask me anything about your birth chart.`,
      },
    ],
    body: {
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
      },
      contextJson: detailedContextJson ?? basicContextJson ?? undefined,
    },
  });

  // Note: We rely on server-side context injection via body.contextJson.
  // If you want to dynamically switch to detailed context mid-session,
  // update this component to toggle which contextJson you pass in body.

  return (
    <div className="mt-10 border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Chat with your Astrology Assistant{displayName ? ` · ${displayName}` : ''}</h3>
        <p className="text-sm text-muted-foreground">Ask questions about your chart. The assistant uses your profile context.</p>
      </div>

      <div className="p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg max-h-[60vh]">
          {messages.filter(m => m.role !== 'system').map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'}`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending…' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
