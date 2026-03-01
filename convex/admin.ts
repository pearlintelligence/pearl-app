import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const ADMIN_DOMAIN = "innerpearl.ai";

/** Check if the current user is an admin (has @innerpearl.ai email) */
async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<{
  userId: ReturnType<typeof getAuthUserId> extends Promise<infer T>
    ? NonNullable<T>
    : never;
  email: string;
}> {
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
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user?.email) return false;

    const domain = user.email.split("@")[1]?.toLowerCase();
    return domain === ADMIN_DOMAIN;
  },
});

/**
 * Get dashboard stats.
 *
 * Collects users, profiles, readings, conversations, featureFlags, and
 * cosmicProfiles. Messages are intentionally NOT collected because they are
 * the largest table and grow unbounded — loading them all would hit Convex
 * query limits at scale.
 *
 * TODO: Migrate to Convex aggregate components for O(1) counts once available.
 * See https://docs.convex.dev/components for pre-built aggregation helpers.
 */
export const getDashboardStats = query({
  args: {},
  handler: async ctx => {
    await requireAdmin(ctx);

    // These tables are bounded by user count and manageable for an early-stage app.
    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    const featureFlags = await ctx.db.query("featureFlags").collect();
    const cosmicProfiles = await ctx.db.query("cosmicProfiles").collect();

    // Readings and conversations grow with users but are bounded per-user.
    const readings = await ctx.db.query("readings").collect();
    const conversations = await ctx.db.query("conversations").collect();

    // NOTE: Messages are NOT collected. They are the largest table (many per
    // conversation) and would cause timeouts at scale. Use conversations as
    // the engagement proxy instead.

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const completedOnboarding = profiles.filter(
      p => p.onboardingComplete,
    ).length;
    const recentUsers = users.filter(
      u => u._creationTime > sevenDaysAgo,
    ).length;
    const recentReadings = readings.filter(
      r => r.createdAt > sevenDaysAgo,
    ).length;
    const recentConversations = conversations.filter(
      c => c.createdAt > sevenDaysAgo,
    ).length;

    // Active conversations = conversations with recent message activity.
    // This replaces `totalMessages` as a lighter engagement metric.
    const activeConversationsThisWeek = conversations.filter(
      c => c.lastMessageAt > sevenDaysAgo,
    ).length;

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
      activeConversationsThisWeek,
      activeFlags: featureFlags.filter(f => f.enabled).length,
      totalFlags: featureFlags.length,
      last7Days: {
        newUsers: recentUsers,
        readings: recentReadings,
        conversations: recentConversations,
      },
      last24h: {
        newUsers: users.filter(u => u._creationTime > oneDayAgo).length,
        readings: readings.filter(r => r.createdAt > oneDayAgo).length,
        conversations: conversations.filter(c => c.createdAt > oneDayAgo)
          .length,
      },
      last30Days: {
        newUsers: users.filter(u => u._creationTime > thirtyDaysAgo).length,
        readings: readings.filter(r => r.createdAt > thirtyDaysAgo).length,
      },
    };
  },
});

/**
 * List users with their profiles — paginated.
 *
 * Uses Convex built-in cursor pagination so only one page of users is loaded
 * at a time. Each user is enriched via indexed per-user lookups instead of
 * loading all profiles/readings/conversations into memory.
 *
 * TODO: Add server-side search via a search index when Convex supports it,
 * or use the aggregate component for total counts.
 */
export const listUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);

    // Paginate users instead of loading every row into memory.
    const usersPage = await ctx.db
      .query("users")
      .order("desc")
      .paginate(paginationOpts);

    // Enrich each user in this page with profile data using indexed lookups.
    const enrichedUsers = await Promise.all(
      usersPage.page.map(async user => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", q => q.eq("userId", user._id))
          .first();
        const cosmic = await ctx.db
          .query("cosmicProfiles")
          .withIndex("by_userId", q => q.eq("userId", user._id))
          .first();
        // Per-user counts via index — avoids loading all readings/conversations.
        const userReadings = await ctx.db
          .query("readings")
          .withIndex("by_userId", q => q.eq("userId", user._id))
          .collect();
        const userConversations = await ctx.db
          .query("conversations")
          .withIndex("by_userId", q => q.eq("userId", user._id))
          .collect();
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
      }),
    );

    return {
      ...usersPage,
      page: enrichedUsers,
    };
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
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (profile) await ctx.db.delete(profile._id);

    // Delete cosmic profile
    const cosmic = await ctx.db
      .query("cosmicProfiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
    if (cosmic) await ctx.db.delete(cosmic._id);

    // Delete readings
    const readings = await ctx.db
      .query("readings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    for (const r of readings) await ctx.db.delete(r._id);

    // Delete conversations and messages
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

    // Delete auth records
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const a of authAccounts) await ctx.db.delete(a._id);

    const authSessions = await ctx.db
      .query("authSessions")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const s of authSessions) await ctx.db.delete(s._id);

    await ctx.db.delete(userId);
    return { success: true };
  },
});

/**
 * Get analytics data for charts (last 30 days).
 *
 * Collects users, readings, and conversations to build daily aggregates.
 * Messages are NOT collected — they aren't needed for these charts.
 *
 * TODO: Pre-compute daily aggregates via a scheduled cron job and store in
 * an `analyticsDaily` table. This would make this query O(30) instead of
 * O(users + readings + conversations).
 */
export const getAnalytics = query({
  args: {},
  handler: async ctx => {
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
