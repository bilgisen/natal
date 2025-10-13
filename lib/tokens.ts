interface ChatMessage {
  content: string;
  role?: string;
}

export function estimateTokens(messages: ChatMessage[]): number {
    const text = messages.map(m => m.content).join(' ');
    const charCount = text.length;
    // Ortalama 1 token ≈ 4 karakter
    return Math.ceil(charCount / 4);
  }
  