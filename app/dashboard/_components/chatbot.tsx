"use client";
import { Input } from "@/components/ui/input";
import { Bot, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { googleAIConfig } from "@/lib/google-ai";
import Markdown from "react-markdown";

type ChatbotProps = {
  profileId?: string;
  displayName?: string | null;
  basicContextJson?: string | null;
  detailedContextJson?: string | null;
};

export default function Chatbot({ profileId, displayName, basicContextJson, detailedContextJson }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profileContext, setProfileContext] = useState<string | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(displayName ?? null);
  const [detailedContext, setDetailedContext] = useState<string | null>(null);
  const [hasPromotedToDetailed, setHasPromotedToDetailed] = useState(false);
  
  // Prefer props immediately for initial render
  const effectiveBasicContext = basicContextJson ?? profileContext;
  const effectiveDisplayName = (displayName ?? profileDisplayName) ?? 'there';
  // Build a key to reinitialize the chat when context becomes available
  const chatKey = profileId ? `chat-${profileId}-${!!effectiveBasicContext}` : 'chat-default';

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    ...googleAIConfig,
    api: '/api/chat/google',
    key: chatKey,
    initialMessages: [
      {
        id: `sys-${chatKey}`,
        role: 'system',
        content:
          `Howdy ${effectiveDisplayName}. I am your personal astrology assistant. You can ask me questions about your birth chart. ` +
          `You can chat with me in any language you like. Let's get started.\n\n` +
          `Instructions:\n` +
          `- Always read and use the provided Profile Context JSON when answering.\n` +
          `- If sunSign, moonSign, or ascendant are present, use them directly without asking for birth details.\n` +
          `- If key data is missing (e.g., no birthDate/place and no signs), ask for only the missing fields.\n` +
          `- Mirror the user's language in your responses (e.g., reply in Turkish if the user writes in Turkish).\n` +
          `- Be concise and helpful.\n` +
          (effectiveBasicContext ? `\nBasic Profile Context (JSON):\n${effectiveBasicContext}` : ''),
      },
    ],
    body: {
      options: googleAIConfig.options,
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prefer precomputed context if provided by parent
  useEffect(() => {
    if (basicContextJson) setProfileContext(basicContextJson);
    if (detailedContextJson) setDetailedContext(detailedContextJson);
    if (displayName != null) setProfileDisplayName(displayName);
  }, [basicContextJson, detailedContextJson, displayName]);

  // Load profile context when profileId is provided and no precomputed context exists
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (basicContextJson || detailedContextJson) {
        return;
      }
      if (!profileId) {
        setProfileContext(null);
        setProfileDisplayName(null);
        setDetailedContext(null);
        setHasPromotedToDetailed(false);
        return;
      }
      try {
        // Fetch birth data (baseline)
        const [birthRes, profileRes] = await Promise.all([
          fetch(`/api/profiles/${profileId}/birth-data`),
          fetch(`/api/profiles/${profileId}`),
        ]);

        if (!active) return;

        const birthData = birthRes.ok ? await birthRes.json() : null;
        const profileData = profileRes.ok ? await profileRes.json() : null;

        // Extract signs from profile astrological snapshot if present
        const chart = profileData?.astrologicalData?.chartData ?? null;
        const sunSign = chart?.sun?.sign ?? chart?.sun_sign ?? null;
        const moonSign = chart?.moon?.sign ?? chart?.moon_sign ?? null;
        const ascendant = chart?.asc?.sign ?? profileData?.astrologicalData?.ascendant ?? null;

        const basicCtx = {
          name: birthData?.subjectName ?? profileData?.displayName ?? null,
          birthDate: birthData?.subjectBirthDate ?? profileData?.birthDate ?? null,
          birthTime: birthData?.subjectBirthTime ?? null,
          birthPlace: birthData?.subjectBirthPlaceData ?? null,
          timezone: birthData?.subjectBirthPlaceData?.tz ?? profileData?.timezone ?? null,
          sunSign,
          moonSign,
          ascendant,
        };

        setProfileDisplayName(birthData?.subjectName ?? profileData?.displayName ?? null);
        setProfileContext(JSON.stringify(basicCtx, null, 2));

        // Detailed context prefers the richer profile data if available
        const detailed = profileData ?? birthData ?? {};
        setDetailedContext(JSON.stringify(detailed, null, 2));
      } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Best-effort: ignore context on failure
        setProfileContext(null);
        setDetailedContext(null);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [profileId, basicContextJson, detailedContextJson]);

  // Promote to detailed context based on user intent
  useEffect(() => {
    if (!profileId) return;
    if (hasPromotedToDetailed) return;
    if (!detailedContext) return;
    if (messages.length === 0) return;
    const last = [...messages].reverse().find(m => m.role === 'user');
    if (!last) return;
    const text = (last.content || '').toLowerCase();
    const triggers = [
      // English
      'chart','natal','house','houses','ascendant','sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','sign','aspect','transit','retrograde',
      // Turkish
      'burç','burcun','yükselen','ev','evler','harita','doğum','gezegen','gezegenler','güneş','ay','merkür','venüs','mars','jüpiter','satürn','uranüs','neptün','plüton','açı','transit','retro'
    ];
    const shouldPromote = triggers.some(k => text.includes(k));
    if (!shouldPromote) return;
    setHasPromotedToDetailed(true);
    // Append a system message that enables detailed context
    append({
      id: `sys-detailed-${chatKey}`,
      role: 'system',
      content:
        `Enabling detailed chart context for more precise answers.\n\n` +
        `Detailed Profile Context (JSON):\n${detailedContext}`,
    });
  }, [messages, profileId, detailedContext, hasPromotedToDetailed, append, chatKey]);

  return (
    <div className="absolute bottom-4 right-4 z-[99]">
      <div
        className="rounded-full bg-black/10 cursor-pointer border p-3"
        onClick={() => setOpen(!open)}
      >
        <Bot className="w-4 h-4 transition-transform hover:scale-125 hover:rotate-12 duration-300 ease-in-out" />
      </div>
      {open && (
        <div className="absolute bottom-12 right-4 w-80 z-[99] dark:bg-black bg-white">
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border h-96 shadow-lg p-4">
            <div className="flex items-center justify-between w-full border-b pb-2">
              <h3 className="text-lg font-semibold">
                AI Assistant{profileDisplayName ? ` · ${profileDisplayName}` : ''}
              </h3>
              <X
                className="w-4 h-4 hover:cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            
            <div className="flex-1 w-full overflow-y-auto space-y-4 py-2">
              {messages.filter(m => m.role !== 'system').length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  How can I help you today?
                </div>
              ) : (
                messages.filter(m => m.role !== 'system').map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 text-sm rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="prose-sm prose-p:my-0.5 prose-li:my-0.5">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="w-full pt-2 border-t">
              <div className="relative flex items-center">
                <Input
                  className="w-full pr-10"
                  placeholder="Type a message..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1 rounded-full hover:bg-muted"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
