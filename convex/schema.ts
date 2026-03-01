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

  // Cosmic fingerprint — unified four-system profile
  // (Astrology + Human Design + Kabbalah + Numerology)
  cosmicProfiles: defineTable({
    userId: v.id("users"),
    // Astrology (real Swiss Ephemeris calculations)
    sunSign: v.string(),
    moonSign: v.string(),
    risingSign: v.string(),
    // Human Design
    hdType: v.string(),
    hdAuthority: v.string(),
    hdProfile: v.string(),
    // Life Purpose (replaced Gene Keys — Pearl's own interpretation)
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

  // Full natal chart — real Swiss Ephemeris calculations
  natalCharts: defineTable({
    userId: v.id("users"),
    // Key fields for quick queries
    sunSign: v.string(),
    sunHouse: v.number(),
    moonSign: v.string(),
    moonHouse: v.number(),
    ascendantSign: v.string(),
    midheavenSign: v.string(),
    northNodeSign: v.string(),
    northNodeHouse: v.number(),
    saturnSign: v.string(),
    saturnHouse: v.number(),
    houseSystem: v.string(),
    // Full chart data (all planets, houses, degrees)
    fullChartJson: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Life Purpose Engine — core feature, generated from natal chart
  lifePurposeProfiles: defineTable({
    userId: v.id("users"),
    purposeDirection: v.string(),
    careerAlignment: v.string(),
    leadershipStyle: v.string(),
    fulfillmentDrivers: v.string(),
    longTermPath: v.string(),
    // Source natal data used
    northNodeSign: v.string(),
    northNodeHouse: v.number(),
    midheavenSign: v.string(),
    sunSign: v.string(),
    sunHouse: v.number(),
    saturnSign: v.string(),
    saturnHouse: v.number(),
    createdAt: v.number(),
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

  // Feature flags for admin control
  featureFlags: defineTable({
    key: v.string(), // unique flag identifier e.g. "oracle_v2"
    name: v.string(), // human-readable name
    description: v.string(),
    enabled: v.boolean(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_key", ["key"]),
});

export default schema;
