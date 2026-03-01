import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";

const RATE_LIMITS: Record<
  string,
  { maxTokens: number; refillRate: number; windowMs: number }
> = {
  "pearl:askOracle": {
    maxTokens: 20,
    refillRate: 20,
    windowMs: 60 * 60 * 1000,
  }, // 20/hour
  "pearl:generateCosmicFingerprint": {
    maxTokens: 3,
    refillRate: 3,
    windowMs: 24 * 60 * 60 * 1000,
  }, // 3/day
  "pearl:generateLifePurposeReading": {
    maxTokens: 5,
    refillRate: 5,
    windowMs: 24 * 60 * 60 * 1000,
  }, // 5/day
  "pearl:generateDailyBrief": {
    maxTokens: 3,
    refillRate: 3,
    windowMs: 24 * 60 * 60 * 1000,
  }, // 3/day
};

export async function checkRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  endpoint: string,
): Promise<void> {
  const config = RATE_LIMITS[endpoint];
  if (!config) return; // No limit configured

  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_userId_endpoint", q =>
      q.eq("userId", userId).eq("endpoint", endpoint),
    )
    .first();

  if (!existing) {
    // First use — create bucket with one token consumed
    await ctx.db.insert("rateLimits", {
      userId,
      endpoint,
      tokens: config.maxTokens - 1,
      lastRefill: now,
    });
    return;
  }

  // Refill tokens based on time elapsed
  const elapsed = now - existing.lastRefill;
  const refillAmount = Math.floor(
    (elapsed / config.windowMs) * config.refillRate,
  );
  const newTokens = Math.min(config.maxTokens, existing.tokens + refillAmount);

  if (newTokens < 1) {
    throw new Error(
      `Rate limit exceeded for ${endpoint}. Please try again later.`,
    );
  }

  await ctx.db.patch(existing._id, {
    tokens: newTokens - 1,
    lastRefill: refillAmount > 0 ? now : existing.lastRefill,
  });
}

export const consume = internalMutation({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
  },
  handler: async (ctx, { userId, endpoint }) => {
    await checkRateLimit(ctx, userId, endpoint);
  },
});
