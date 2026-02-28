/**
 * Cleanup utilities for testing. Removes stale data.
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation } from "./_generated/server";

// Authenticated cleanup for the current user
export const clearMyReadings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await clearUserData(ctx, userId);
  },
});

// Internal cleanup — callable from CLI: `bunx convex run cleanup:clearAllTestData`
export const clearAllTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    for (const table of ["readings", "cosmicProfiles", "userProfiles", "conversations", "messages"] as const) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        count++;
      }
    }
    return { deleted: count };
  },
});

async function clearUserData(ctx: any, userId: any) {
  let count = 0;
  const readings = await ctx.db.query("readings").withIndex("by_userId", (q: any) => q.eq("userId", userId)).collect();
  for (const r of readings) { await ctx.db.delete(r._id); count++; }

  const profiles = await ctx.db.query("cosmicProfiles").withIndex("by_userId", (q: any) => q.eq("userId", userId)).collect();
  for (const p of profiles) { await ctx.db.delete(p._id); count++; }

  const userProfiles = await ctx.db.query("userProfiles").withIndex("by_userId", (q: any) => q.eq("userId", userId)).collect();
  for (const up of userProfiles) { await ctx.db.delete(up._id); count++; }

  const conversations = await ctx.db.query("conversations").withIndex("by_userId", (q: any) => q.eq("userId", userId)).collect();
  for (const c of conversations) {
    const messages = await ctx.db.query("messages").withIndex("by_conversationId", (q: any) => q.eq("conversationId", c._id)).collect();
    for (const m of messages) { await ctx.db.delete(m._id); count++; }
    await ctx.db.delete(c._id); count++;
  }
  return { deleted: count };
}
