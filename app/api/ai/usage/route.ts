import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { aiUsage, subscription } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserQuota } from "@/lib/ai/update-user-quota";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Kullanıcının planına göre kota oluştur/güncelle
  await ensureUserQuota(userId);

  // Kullanıcı token kullanımı
  const [usage] = await db.select().from(aiUsage).where(eq(aiUsage.userId, userId));
  if (!usage) return Response.json({ error: "Usage not found" }, { status: 404 });

  // Aktif abonelik (en son aktif)
  const [activeSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  const planName =
    activeSub?.productId === process.env.NEXT_PUBLIC_PRO_SLUG
      ? "Pro 1M"
      : activeSub?.productId === process.env.NEXT_PUBLIC_ULTIMATE_SLUG
      ? "Ultimate 5M"
      : "Starter 100K";

  const periodEnd =
    usage.periodEnd || activeSub?.currentPeriodEnd || null;

  const usagePercent = Math.min(
    Math.round((usage.usedTokens / usage.monthlyQuota) * 100),
    100
  );

  return Response.json({
    planName,
    usedTokens: usage.usedTokens,
    monthlyQuota: usage.monthlyQuota,
    usagePercent,
    remainingTokens: Math.max(usage.monthlyQuota - usage.usedTokens, 0),
    periodEnd,
  });
}
