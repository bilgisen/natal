// lib/db/ai-usage.ts
import { db } from "@/db/drizzle"; // Drizzle instance
import { aiUsage } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getUsageByUserId(userId: string) {
  const [usage] = await db.select().from(aiUsage).where(eq(aiUsage.userId, userId)).limit(1);
  return usage;
}

export async function incrementUsage(userId: string, tokens: number) {
  await db
    .update(aiUsage)
    .set({
      usedTokens: sql`${aiUsage.usedTokens} + ${tokens}`,
      updatedAt: new Date(),
    })
    .where(eq(aiUsage.userId, userId));
}
