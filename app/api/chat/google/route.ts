// app/api/chat/google/route.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ensureUserQuota } from "@/lib/ai/update-user-quota";
import { db } from "@/db/drizzle";
import { aiUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const messages = payload?.messages;
    const contextJson: string | undefined = payload?.contextJson;

    // 1. Oturumdan kullanıcı kimliğini al
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim" }), { status: 401 });
    }

    // 2. Kullanıcının planına göre kota oluştur/güncelle
    await ensureUserQuota(userId);

    // 3. Kullanıcının mevcut kullanımını getir
    const [usage] = await db.select().from(aiUsage).where(eq(aiUsage.userId, userId));
    if (!usage || usage.usedTokens >= usage.monthlyQuota) {
      return new Response(JSON.stringify({ error: "Token limitine ulaşıldı. Planınızı yükseltin." }), { status: 403 });
    }

    // 4. AI isteğini gönder
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    const systemInjected = contextJson
      ? [
          {
            role: "system" as const,
            content:
              "Use the following Profile Context JSON to answer.\n\n" +
              `Profile Context (JSON):\n${contextJson}`,
          },
        ]
      : [];

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      messages: [...systemInjected, ...messages],
      temperature: 0.7,
      maxTokens: 2048,
      // Yanıt tamamlandığında token kullanımını güncelle
      onFinish: async (finishData) => {
        try {
          const totalTokens = finishData.usage.totalTokens || 0;
          
          await db
            .update(aiUsage)
            .set({ 
              usedTokens: Math.min(usage.usedTokens + totalTokens, usage.monthlyQuota) 
            })
            .where(eq(aiUsage.userId, userId));
        } catch (error) {
          console.error('Token usage update error:', error);
          // Hata durumunda en azından token sayısını bir artırmaya çalış
          try {
            await db
              .update(aiUsage)
              .set({ 
                usedTokens: Math.min(usage.usedTokens + 1, usage.monthlyQuota) 
              })
              .where(eq(aiUsage.userId, userId));
          } catch (updateError) {
            console.error('Fallback token update also failed:', updateError);
          }
        }
      }
    });

    // 5. Stream yanıtını hemen döndür
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Sunucu hatası." }), { status: 500 });
  }
}