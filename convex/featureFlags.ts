import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ADMIN_DOMAIN = "innerpearl.ai";

async function requireAdmin(ctx: any): Promise<any> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user?.email) throw new Error("No email found");

  const domain = user.email.split("@")[1]?.toLowerCase();
  if (domain !== ADMIN_DOMAIN) throw new Error("Admin access required");

  return userId;
}

/** List all feature flags */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const flags = await ctx.db.query("featureFlags").collect();
    return flags.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Create a new feature flag */
export const create = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);

    // Check for duplicate key
    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) throw new Error(`Flag with key "${args.key}" already exists`);

    return await ctx.db.insert("featureFlags", {
      ...args,
      createdBy: userId,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

/** Toggle a feature flag */
export const toggle = mutation({
  args: { id: v.id("featureFlags") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const flag = await ctx.db.get(id);
    if (!flag) throw new Error("Flag not found");

    await ctx.db.patch(id, {
      enabled: !flag.enabled,
      updatedAt: Date.now(),
    });
    return { success: true, enabled: !flag.enabled };
  },
});

/** Update a feature flag */
export const update = mutation({
  args: {
    id: v.id("featureFlags"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const flag = await ctx.db.get(id);
    if (!flag) throw new Error("Flag not found");

    const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.enabled !== undefined) cleanUpdates.enabled = updates.enabled;

    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

/** Delete a feature flag */
export const remove = mutation({
  args: { id: v.id("featureFlags") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

/** Public: check if a specific flag is enabled */
export const isEnabled = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return flag?.enabled ?? false;
  },
});
