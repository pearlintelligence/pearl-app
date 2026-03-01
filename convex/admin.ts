import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ADMIN_DOMAIN = "innerpearl.ai";

/** Check if the current user is an admin (has @innerpearl.ai email) */
async function requireAdmin(ctx: any): Promise<{ userId: any; email: string }> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user?.email) throw new Error("No email found");

  const domain = user.email.split("@")[1]?.toLowerCase();
  if (domain !== ADMIN_DOMAIN) throw new Error("Admin access required");

  return { userId, email: user.email };
}

/** Public query: is the current user an admin? */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user?.email) return false;

    const domain = user.email.split("@")[1]?.toLowerCase();
    return domain === ADMIN_DOMAIN;
  },
});

/** Get dashboard stats */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    const readings = await ctx.db.query("readings").collect();
    const conversations = await ctx.db.query("conversations").collect();
    const messages = await ctx.db.query("messages").collect();
    const featureFlags = await ctx.db.query("featureFlags").collect();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const completedOnboarding = profiles.filter((p) => p.onboardingComplete).length;
    const recentUsers = users.filter((u) => u._creationTime > sevenDaysAgo).length;
    const recentReadings = readings.filter((r) => r.createdAt > sevenDaysAgo).length;
    const recentConversations = conversations.filter(
      (c) => c.createdAt > sevenDaysAgo
    ).length;

    // Users with cosmic profiles generated
    const cosmicProfiles = await ctx.db.query("cosmicProfiles").collect();

    return {
      totalUsers: users.length,
      completedOnboarding,
      onboardingRate:
        users.length > 0
          ? Math.round((completedOnboarding / users.length) * 100)
          : 0,
      cosmicProfilesGenerated: cosmicProfiles.length,
      totalReadings: readings.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      activeFlags: featureFlags.filter((f) => f.enabled).length,
      totalFlags: featureFlags.length,
      last7Days: {
        newUsers: recentUsers,
        readings: recentReadings,
        conversations: recentConversations,
      },
      last24h: {
        newUsers: users.filter((u) => u._creationTime > oneDayAgo).length,
        readings: readings.filter((r) => r.createdAt > oneDayAgo).length,
        conversations: conversations.filter((c) => c.createdAt > oneDayAgo)
          .length,
      },
      last30Days: {
        newUsers: users.filter((u) => u._creationTime > thirtyDaysAgo).length,
        readings: readings.filter((r) => r.createdAt > thirtyDaysAgo).length,
      },
    };
  },
});

/** List all users with their profiles */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    const cosmicProfiles = await ctx.db.query("cosmicProfiles").collect();
    const readings = await ctx.db.query("readings").collect();
    const conversations = await ctx.db.query("conversations").collect();

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const cosmicMap = new Map(cosmicProfiles.map((c) => [c.userId, c]));

    return users
      .map((user) => {
        const profile = profileMap.get(user._id);
        const cosmic = cosmicMap.get(user._id);
        const userReadings = readings.filter((r) => r.userId === user._id);
        const userConversations = conversations.filter(
          (c) => c.userId === user._id
        );
        const isAdminUser =
          user.email?.split("@")[1]?.toLowerCase() === ADMIN_DOMAIN;

        return {
          _id: user._id,
          email: user.email || "No email",
          name: user.name || profile?.displayName || "Unknown",
          isAdmin: isAdminUser,
          createdAt: user._creationTime,
          onboardingComplete: profile?.onboardingComplete ?? false,
          hasCosmic: !!cosmic,
          sunSign: cosmic?.sunSign,
          totalReadings: userReadings.length,
          totalConversations: userConversations.length,
          birthCity: profile?.birthCity,
          birthCountry: profile?.birthCountry,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Delete a user and all their data (admin only) */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const { userId: adminId } = await requireAdmin(ctx);
    if (userId === adminId) throw new Error("Cannot delete yourself");

    // Delete profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (profile) await ctx.db.delete(profile._id);

    // Delete cosmic profile
    const cosmic = await ctx.db
      .query("cosmicProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (cosmic) await ctx.db.delete(cosmic._id);

    // Delete readings
    const readings = await ctx.db
      .query("readings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const r of readings) await ctx.db.delete(r._id);

    // Delete conversations and messages
    const convos = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const c of convos) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", c._id)
        )
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(c._id);
    }

    // Delete auth records
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const a of authAccounts) await ctx.db.delete(a._id);

    const authSessions = await ctx.db
      .query("authSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const s of authSessions) await ctx.db.delete(s._id);

    await ctx.db.delete(userId);
    return { success: true };
  },
});

/** Get analytics data for charts */
export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const readings = await ctx.db.query("readings").collect();
    const conversations = await ctx.db.query("conversations").collect();

    // Group by day for last 30 days
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const dailySignups: Record<string, number> = {};
    const dailyReadings: Record<string, number> = {};
    const dailyConversations: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      dailySignups[key] = 0;
      dailyReadings[key] = 0;
      dailyConversations[key] = 0;
    }

    for (const u of users) {
      if (u._creationTime > thirtyDaysAgo) {
        const key = new Date(u._creationTime).toISOString().split("T")[0];
        if (dailySignups[key] !== undefined) dailySignups[key]++;
      }
    }

    for (const r of readings) {
      if (r.createdAt > thirtyDaysAgo) {
        const key = new Date(r.createdAt).toISOString().split("T")[0];
        if (dailyReadings[key] !== undefined) dailyReadings[key]++;
      }
    }

    for (const c of conversations) {
      if (c.createdAt > thirtyDaysAgo) {
        const key = new Date(c.createdAt).toISOString().split("T")[0];
        if (dailyConversations[key] !== undefined) dailyConversations[key]++;
      }
    }

    // Reading type breakdown
    const readingTypes: Record<string, number> = {};
    for (const r of readings) {
      readingTypes[r.type] = (readingTypes[r.type] || 0) + 1;
    }

    return {
      dailySignups: Object.entries(dailySignups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      dailyReadings: Object.entries(dailyReadings)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      dailyConversations: Object.entries(dailyConversations)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      readingTypes: Object.entries(readingTypes).map(([type, count]) => ({
        type,
        count,
      })),
    };
  },
});
