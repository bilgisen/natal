// lib/ai/get-quota-from-subscription.ts
export function getQuotaFromSubscription(productId?: string): number {
    if (!productId) return 50_000; // default (free plan)
  
    const starterSlug = process.env.NEXT_PUBLIC_STARTER_SLUG;
    const proSlug = process.env.NEXT_PUBLIC_PRO_SLUG;
    const ultimateSlug = process.env.NEXT_PUBLIC_ULTIMATE_SLUG;
  
    if (productId === starterSlug) return 100_000;
    if (productId === proSlug) return 1_000_000;
    if (productId === ultimateSlug) return 5_000_000;
  
    return 50_000; // fallback
  }
  