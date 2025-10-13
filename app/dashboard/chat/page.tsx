'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat/google', // API endpoint
    initialMessages: [
      {
        id: '1',
        content: 'Merhaba! Size nasıl yardımcı olabilirim?',
        role: 'assistant',
      },
    ],
  });

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-100 ml-8'
                : 'bg-gray-100 dark:bg-gray-100 mr-8'
            }`}
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
          placeholder="Mesajınızı yazın..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </form>

      {error && (
        <div className="p-4 text-red-600 bg-red-100 rounded-lg mt-4">
          Hata: {error.message}
        </div>
      )}
    </div>
  );
}
