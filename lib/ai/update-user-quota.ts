// lib/ai/update-user-quota.ts
import { db } from "@/db/drizzle";
import { aiUsage } from "@/db/schema";
import { getSubscriptionDetails } from "@/lib/subscription";
import { getQuotaFromSubscription } from "@/lib/ai/get-quota-from-subscription";
import { eq } from "drizzle-orm";

export async function ensureUserQuota(userId: string) {
  const subscriptionDetails = await getSubscriptionDetails();
  const productId = subscriptionDetails.subscription?.productId;
  const quota = getQuotaFromSubscription(productId);

  const [existingUsage] = await db
    .select()
    .from(aiUsage)
    .where(eq(aiUsage.userId, userId));

  if (!existingUsage) {
    // Yeni kullanıcı
    await db.insert(aiUsage).values({
      userId,
      usedTokens: 0,
      monthlyQuota: quota,
    });
    return quota;
  }

  // Plan değişmişse güncelle
  if (existingUsage.monthlyQuota !== quota) {
    await db
      .update(aiUsage)
      .set({ monthlyQuota: quota })
      .where(eq(aiUsage.userId, userId));
  }

  return quota;
}
