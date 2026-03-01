import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const deleteAccount = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Delete user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (profile) await ctx.db.delete(profile._id);

    // Delete cosmic profile
    const cosmic = await ctx.db
      .query("cosmicProfiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (cosmic) await ctx.db.delete(cosmic._id);

    // Delete natal chart
    const natalChart = await ctx.db
      .query("natalCharts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (natalChart) await ctx.db.delete(natalChart._id);

    // Delete life purpose profile
    const lifePurpose = await ctx.db
      .query("lifePurposeProfiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (lifePurpose) await ctx.db.delete(lifePurpose._id);

    // Delete readings
    const readings = await ctx.db
      .query("readings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    for (const r of readings) await ctx.db.delete(r._id);

    // Delete conversations and their messages
    const convos = await ctx.db
      .query("conversations")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    for (const c of convos) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", q => q.eq("conversationId", c._id))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(c._id);
    }

    // Delete auth accounts
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete auth sessions
    const authSessions = await ctx.db
      .query("authSessions")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete user document
    await ctx.db.delete(userId);

    return { success: true };
  },
});
