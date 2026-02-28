import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getLatestReading = query({
  args: { type: v.string() },
  handler: async (ctx, { type }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const readings = await ctx.db
      .query("readings")
      .withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", type))
      .order("desc")
      .take(1);
    return readings[0] ?? null;
  },
});

export const getReadingsByType = query({
  args: { type: v.string() },
  handler: async (ctx, { type }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("readings")
      .withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", type))
      .order("desc")
      .take(20);
  },
});

export const getTodaysBrief = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const today = new Date().toISOString().split("T")[0];
    const readings = await ctx.db
      .query("readings")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
    return readings.find((r) => r.type === "daily_brief") ?? null;
  },
});
