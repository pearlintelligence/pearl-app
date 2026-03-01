/**
 * What's New — Changelog entries
 *
 * Add new entries at the TOP of the array (newest first).
 * Keep descriptions customer-facing — focus on what they can do now,
 * not how it was built. Write in Pearl's warm, empowering voice.
 *
 * Categories: "new" | "improved" | "fixed"
 */

export type ChangelogCategory = "new" | "improved" | "fixed";

export interface ChangelogEntry {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Category badge */
  category: ChangelogCategory;
  /** Short, punchy headline */
  title: string;
  /** 1–2 sentence customer-facing description */
  description: string;
}

export const changelog: ChangelogEntry[] = [
  // ── March 2026 ──────────────────────────────────────────────────────
  {
    date: "2026-03-01",
    category: "improved",
    title: "Smarter onboarding — find your birthplace instantly",
    description:
      "We redesigned the birth-place step with a lightning-fast typeahead search. Start typing your city or country and Pearl will find it for you — no more scrolling through endless dropdowns.",
  },
  {
    date: "2026-03-01",
    category: "improved",
    title: "Stronger security & stability under the hood",
    description:
      "We've hardened your account with better rate-limiting, secure session handling, and proactive error monitoring so Pearl stays reliable as our community grows.",
  },

  // ── February 2026 ────────────────────────────────────────────────────
  {
    date: "2026-02-28",
    category: "new",
    title: "Your Morning Cosmic Brief is here ☀️",
    description:
      "Start every day with a personalized cosmic weather report. Your Morning Brief blends current planetary transits with your unique chart to surface exactly what you need to know today.",
  },
  {
    date: "2026-02-28",
    category: "new",
    title: "Talk to Pearl — voice is live 🎙️",
    description:
      "You can now speak your questions out loud and hear Pearl respond in her own voice. Just tap the mic in Ask Pearl — no typing required.",
  },
  {
    date: "2026-02-28",
    category: "new",
    title: "Your full Blueprint, unlocked",
    description:
      "Dive deep into your cosmic design across all four wisdom traditions. Your Blueprint page reveals every placement, gate, and number in one beautifully unified view.",
  },
  {
    date: "2026-02-28",
    category: "new",
    title: "Discover your Life Purpose",
    description:
      "A brand-new page dedicated to your incarnation cross, life-path number, and soul's deeper calling — synthesized from astrology, Human Design, Kabbalah, and numerology.",
  },
  {
    date: "2026-02-28",
    category: "new",
    title: "Track what's happening in the cosmos right now",
    description:
      "The Transits page shows you real-time planetary movements and how they're interacting with your natal chart. Think of it as a living weather map for your energy.",
  },
  {
    date: "2026-02-28",
    category: "new",
    title: "Understand your current Life Phase",
    description:
      "Your Progressions page reveals the slow, powerful shifts happening in your chart over months and years — helping you see where you are in the bigger story of your life.",
  },
  {
    date: "2026-02-28",
    category: "improved",
    title: "More accurate birth chart calculations",
    description:
      "We replaced our initial formulas with a precision astronomical engine for moon sign, rising sign, and Human Design gates — your readings are now significantly more accurate.",
  },
];
