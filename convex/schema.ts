import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Extended user profile with birth data
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    birthDate: v.string(), // YYYY-MM-DD
    birthTime: v.optional(v.string()), // HH:MM or null if unknown
    birthTimeKnown: v.boolean(),
    birthCity: v.string(),
    birthCountry: v.string(),
    birthLat: v.optional(v.number()),
    birthLng: v.optional(v.number()),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Cosmic fingerprint — unified five-system profile
  cosmicProfiles: defineTable({
    userId: v.id("users"),
    // Astrology
    sunSign: v.string(),
    moonSign: v.string(),
    risingSign: v.string(),
    // Human Design
    hdType: v.string(),
    hdAuthority: v.string(),
    hdProfile: v.string(),
    // Gene Keys
    lifePurpose: v.string(),
    evolution: v.string(),
    radiance: v.string(),
    // Kabbalah
    lifePathTree: v.string(),
    soulUrge: v.string(),
    // Numerology
    lifePathNumber: v.number(),
    expressionNumber: v.number(),
    soulNumber: v.number(),
    // Summary
    summary: v.string(),
    generatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Readings (Why Am I Here, Daily Brief, etc.)
  readings: defineTable({
    userId: v.id("users"),
    type: v.string(), // "life_purpose" | "daily_brief" | "weekly" | "transit"
    title: v.string(),
    content: v.string(),
    date: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_userId_date", ["userId", "date"]),

  // Oracle conversations
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Conversation messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.string(), // "user" | "oracle"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),
});

export default schema;
