import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

export const getMessagesInternal = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();
  },
});

export const addMessageInternal = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, role, content }) => {
    await ctx.db.patch(conversationId, { lastMessageAt: Date.now() });
    return await ctx.db.insert("messages", {
      conversationId,
      role,
      content,
      createdAt: Date.now(),
    });
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify conversation belongs to user
    const conv = await ctx.db.get(conversationId);
    if (!conv || conv.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();
  },
});

export const createConversation = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("conversations", {
      userId,
      title,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, role, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify conversation belongs to user
    const conv = await ctx.db.get(conversationId);
    if (!conv || conv.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(conversationId, { lastMessageAt: Date.now() });

    return await ctx.db.insert("messages", {
      conversationId,
      role,
      content,
      createdAt: Date.now(),
    });
  },
});
