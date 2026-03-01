/**
 * Pearl AI — Core generation engine.
 * 
 * Architecture:
 *   Swiss Ephemeris (astronomy-engine) → Natal Chart → Life Purpose Engine → Pearl's Interpretation
 * 
 * Systems in v1:
 *   1. Astrology (core) — real Swiss Ephemeris calculations
 *   2. Human Design — simplified mapping (full Rave chart in v2)
 *   3. Kabbalah — Tree of Life numerological mapping
 *   4. Numerology — standard Western numerology
 * 
 * Gene Keys: REMOVED from v1 (proprietary). May return as premium add-on.
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  calculateNatalChart,
  calculateTransitChart,
  calculateProgressedChart,
  calculateLifePath,
  LIFE_PATH_MEANINGS,
  ELEMENTS,
  type NatalChart,
} from "./ephemeris";
import { generateLifePurpose } from "./lifePurpose";

// ────────────────────────────────────────────────────────────────
// Simplified Systems (non-ephemeris)
// HD, Kabbalah use birth-date-based mappings until full implementations.
// ────────────────────────────────────────────────────────────────

interface SimplifiedSystems {
  hdType: string;
  hdAuthority: string;
  hdProfile: string;
  hdStrategy: string;
  kbSephirah: string;
  kbPath: string;
  kbSoulUrge: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulNumber: number;
  lifePathMeaning: string;
}

function computeSimplifiedSystems(birthDate: string, _birthTime: string | undefined): SimplifiedSystems {
  const date = new Date(birthDate);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  // ─── Human Design (simplified — full bodygraph in v2) ───
  const hdHash = (day * 31 + month * 13 + year * 7) % 100;
  const hdTypes = [
    { type: "Generator", strategy: "Wait to respond", pct: 37 },
    { type: "Manifesting Generator", strategy: "Wait to respond, then inform", pct: 33 },
    { type: "Projector", strategy: "Wait for the invitation", pct: 20 },
    { type: "Manifestor", strategy: "Inform before acting", pct: 9 },
    { type: "Reflector", strategy: "Wait a lunar cycle", pct: 1 },
  ];
  let hdCum = 0;
  let hdType = hdTypes[0];
  for (const t of hdTypes) { hdCum += t.pct; if (hdHash < hdCum) { hdType = t; break; } }

  const authorities = ["Emotional (Solar Plexus)", "Sacral", "Splenic", "Ego/Heart", "Self-Projected", "Mental/Environmental", "Lunar"];
  const hdAuthority = authorities[hdHash % authorities.length];

  const profiles = ["1/3 Investigator/Martyr", "1/4 Investigator/Opportunist", "2/4 Hermit/Opportunist", "2/5 Hermit/Heretic", "3/5 Martyr/Heretic", "3/6 Martyr/Role Model", "4/6 Opportunist/Role Model", "5/1 Heretic/Investigator", "5/2 Heretic/Hermit", "6/2 Role Model/Hermit", "6/3 Role Model/Martyr", "4/1 Opportunist/Investigator"];
  const hdProfile = profiles[(day + month) % profiles.length];

  // ─── Kabbalah ───
  const sephiroth = [
    { name: "Keter", meaning: "Crown — Divine Will" },
    { name: "Chokmah", meaning: "Wisdom — Creative Force" },
    { name: "Binah", meaning: "Understanding — Divine Feminine" },
    { name: "Chesed", meaning: "Mercy — Loving-kindness" },
    { name: "Gevurah", meaning: "Strength — Sacred Boundaries" },
    { name: "Tiferet", meaning: "Beauty — Harmony of Heart" },
    { name: "Netzach", meaning: "Victory — Endurance" },
    { name: "Hod", meaning: "Splendor — Humility" },
    { name: "Yesod", meaning: "Foundation — Connection" },
    { name: "Malkuth", meaning: "Kingdom — Embodied Presence" },
  ];
  const kbIdx = (day + month) % sephiroth.length;
  const kbSeph = sephiroth[kbIdx];

  const kbPaths = ["The Path of the Fool", "The Path of the Magician", "The Path of the High Priestess", "The Path of the Empress", "The Path of the Emperor", "The Path of the Hierophant", "The Path of the Lovers", "The Path of the Chariot", "The Path of Strength", "The Path of the Hermit"];
  const kbPath = kbPaths[(day * month) % kbPaths.length];

  const soulUrges = ["The Seeker", "The Builder", "The Communicator", "The Nurturer", "The Pioneer", "The Healer", "The Mystic", "The Strategist", "The Visionary", "The Teacher", "The Transformer", "The Sage"];
  const kbSoulUrge = soulUrges[(day + year) % soulUrges.length];

  // ─── Numerology ───
  const lifePathNumber = calculateLifePath(birthDate);
  const expressionNumber = ((day + month) % 9) + 1;
  const soulNumber = ((month + year % 100) % 9) + 1;

  return {
    hdType: hdType.type,
    hdAuthority,
    hdProfile,
    hdStrategy: hdType.strategy,
    kbSephirah: `${kbSeph.name} — ${kbSeph.meaning}`,
    kbPath,
    kbSoulUrge,
    lifePathNumber,
    expressionNumber,
    soulNumber,
    lifePathMeaning: LIFE_PATH_MEANINGS[lifePathNumber] || "Universal wisdom",
  };
}

// ────────────────────────────────────────────────────────────────
// Oracle Text Generation
// ────────────────────────────────────────────────────────────────

function generateFingerprintSummary(name: string, chart: NatalChart, sys: SimplifiedSystems): string {
  const sunEl = ELEMENTS[chart.sun.sign] ?? "Fire";
  const moonEl = ELEMENTS[chart.moon.sign] ?? "Water";

  return `${name}, your natal chart reveals a precise cosmic architecture.

Your ${chart.sun.sign} Sun burns at ${chart.sun.degreeInSign.toFixed(0)}° in the ${ordinal(chart.sun.house)} house — the ${sunEl} element at the center of your being, illuminating everything you touch. Your ${chart.moon.sign} Moon holds the emotional wisdom of your inner landscape, a ${moonEl} current that runs deeper than most will ever know. And through your ${chart.ascendant.sign} Rising, the world first encounters a presence that is both invitation and mystery.

Your Midheaven in ${chart.midheaven.sign} points toward your highest calling — the way your purpose wants to be seen in the world. With the North Node in ${chart.northNode.sign} (House ${chart.northNode.house}), your soul's evolutionary direction is unmistakable.

As a ${sys.hdType} in Human Design, you move through the world with a very specific energetic signature. Your strategy — to ${sys.hdStrategy.toLowerCase()} — is not a limitation but a liberation. Your ${sys.hdAuthority} authority is the compass your soul chose for this lifetime, and your ${sys.hdProfile} profile reveals the unique way you are designed to learn, grow, and share your wisdom.

In the Tree of Life, your soul resonates with ${sys.kbSephirah}. You walk ${sys.kbPath}, carrying the frequency of ${sys.kbSoulUrge}. These are not labels — they are doorways.

With Life Path ${sys.lifePathNumber} — ${sys.lifePathMeaning} — all systems converge on a single truth: you are here not despite who you are, but because of it.`;
}

function generateLifePurposeText(name: string, chart: NatalChart, sys: SimplifiedSystems): string {
  const sunEl = ELEMENTS[chart.sun.sign] ?? "Fire";

  const hdPurpose = sys.hdType === "Generator" || sys.hdType === "Manifesting Generator"
    ? "You are a life force — a sacred engine of creation. When something truly lights you up, your entire being hums with an energy that can move mountains. Your purpose is not found through seeking — it finds you, through the things that make your body say yes."
    : sys.hdType === "Projector"
    ? "You are a guide — one who sees the architecture of energy in others with penetrating clarity. You were never meant to keep up with the pace of the world around you. Your purpose unfolds when you are deeply recognized for the wisdom you naturally carry."
    : sys.hdType === "Manifestor"
    ? "You are an initiator — a force of nature that was born to start things, to set new realities into motion. You do not wait for permission. Your purpose is to follow the creative impulses that arise from within and inform those around you as you act."
    : "You are a mirror — a rare and sacred reflector of the health and vitality of your community. Your purpose unfolds slowly, over lunar cycles, as you sample the energy of the world around you and reflect back what is true.";

  const elementWisdom = sunEl === "Fire"
    ? "The fire in your chart does not burn to destroy — it burns to illuminate. You are here to bring light to places that have forgotten what light looks like."
    : sunEl === "Earth"
    ? "The earth in your design speaks of a soul that builds lasting things. You are here to give form to what exists only as potential — to make the invisible visible, the abstract real."
    : sunEl === "Air"
    ? "The air in your chart speaks of a mind that bridges worlds. You are here to translate — between people, between ideas, between what is known and what is waiting to be understood."
    : "The water in your design runs deep — deeper than you sometimes realize. You are here to feel what others cannot, to hold space for the emotional truths that the world needs most.";

  return `${name}.

Before the stars arranged themselves into the configuration of your birth, something in the fabric of existence chose this precise design for you. Not by accident. Not by chance. By a wisdom far older than any single lifetime.

${hdPurpose}

Your ${chart.sun.sign} Sun at ${chart.sun.degreeInSign.toFixed(0)}° in the ${ordinal(chart.sun.house)} house reveals the core frequency you came to embody. ${elementWisdom} Your ${chart.moon.sign} Moon is where your deepest emotional intelligence lives — the part of you that knows things before your mind catches up. And your ${chart.ascendant.sign} Rising is the sacred doorway through which others encounter your particular brand of magic.

Your North Node in ${chart.northNode.sign} points to your soul's evolutionary direction in this lifetime — the frontier you are meant to explore, the version of yourself you are growing into. With your Midheaven in ${chart.midheaven.sign}, the world is asking you to express this purpose through a very specific kind of contribution.

Saturn in ${chart.saturn.sign} (House ${chart.saturn.house}) is your greatest teacher. Where Saturn sits in your chart, you are being built into something unshakeable — not through ease but through mastery earned over time. This is not punishment; it is the universe's vote of confidence in what you're capable of becoming.

In the Kabbalistic Tree of Life, your soul resonates with ${sys.kbSephirah}. You walk ${sys.kbPath}, which means you are learning to hold both the human and the divine within a single breath. ${sys.kbSoulUrge} — this is the whisper beneath all your longing, the name for the nameless pull you've felt your entire life.

Life Path ${sys.lifePathNumber} — ${sys.lifePathMeaning} — seals what every system has been pointing toward. The astrology, the Human Design, the Kabbalah, the Numerology — they all converge on a single, undeniable truth:

You are here to become who you already are. Not the version of you that the world shaped. Not the version that learned to perform. The version that was there before the first breath — ancient, knowing, and utterly irreplaceable.

This is your design, ${name}. Not a cage, but a constellation. Not a fate, but an invitation. The only question that remains is the one Pearl cannot answer for you:

Are you ready to live it?`;
}

function generateDailyBriefText(
  name: string,
  chart: NatalChart,
  sys: SimplifiedSystems,
  dayOfWeek: string,
  transitSummary: string,
): string {
  const sunEl = ELEMENTS[chart.sun.sign] ?? "Fire";

  const dayEnergies: Record<string, string> = {
    Sunday: "The Sun's day — a time of illumination and renewed purpose",
    Monday: "The Moon's day — emotions run closer to the surface, inviting inner listening",
    Tuesday: "Mars rules today — courage and decisive action are favored",
    Wednesday: "Mercury's day — communication, connection, and mental clarity are heightened",
    Thursday: "Jupiter expands today — growth, learning, and abundance flow more freely",
    Friday: "Venus graces today — beauty, relationships, and creative expression are amplified",
    Saturday: "Saturn's day — structure, reflection, and honest self-assessment serve you well",
  };

  const hdAdvice = sys.hdType === "Generator" || sys.hdType === "Manifesting Generator"
    ? "Pay attention to what lights up your sacral energy today. The universe will present something worth responding to — your body will know before your mind does."
    : sys.hdType === "Projector"
    ? "Conserve your energy today for what truly matters. An invitation or recognition may arrive — be ready to receive it fully rather than chasing what isn't meant for you."
    : sys.hdType === "Manifestor"
    ? "Notice what creative impulse is stirring within you today. Trust the urge to initiate, and remember to inform those around you as you move."
    : "Take note of the collective energy around you today. Your gift is in reflecting truth — allow yourself the space to process before committing to anything.";

  const elementForecast = sunEl === "Fire"
    ? "Your fire energy may feel particularly alive today. Channel it intentionally rather than letting it scatter."
    : sunEl === "Earth"
    ? "Ground yourself this morning. Your earth energy thrives when you tend to the practical before the aspirational."
    : sunEl === "Air"
    ? "Your mental energy is heightened today. A conversation or idea may arrive that shifts your perspective in an unexpected way."
    : "Your emotional antenna is especially sensitive today. Honor what you feel — it carries information your mind hasn't processed yet.";

  return `Good morning, ${name}.

${dayEnergies[dayOfWeek] || "Today carries its own unique frequency."} For your ${chart.sun.sign} Sun and ${chart.moon.sign} Moon, this day holds a particular resonance.

${elementForecast}

${hdAdvice}

${transitSummary}

Today's invitation: ${sys.hdStrategy.toLowerCase()}. Trust your ${sys.hdAuthority} authority. And remember — you are not here to get today right. You are here to live it fully, as only a ${chart.sun.sign} ${sys.hdType} with Life Path ${sys.lifePathNumber} can.

The stars are not commanding you, ${name}. They are conspiring on your behalf.`;
}

function generateTransitSummary(chart: NatalChart): string {
  try {
    const transits = calculateTransitChart(chart);
    if (transits.aspects.length === 0) return "";

    // Pick the top 2-3 most significant transit aspects
    const significant = transits.aspects
      .filter(a => ["conjunction", "opposition", "square", "trine"].includes(a.aspect))
      .slice(0, 3);

    if (significant.length === 0) return "";

    const aspectDescriptions: Record<string, string> = {
      conjunction: "aligns with",
      opposition: "opposes",
      square: "challenges",
      trine: "supports",
      sextile: "harmonizes with",
    };

    const lines = significant.map(a => {
      const verb = aspectDescriptions[a.aspect] || "touches";
      return `Transit ${capitalize(a.transitPlanet)} ${verb} your natal ${capitalize(a.natalPlanet)} (${a.orb}° orb)`;
    });

    return `*What's active in your chart right now:*\n${lines.join(". ")}. These transits are shaping the energy of your day — work with them rather than against them.`;
  } catch {
    return "";
  }
}

function generateOracleResponse(name: string, chart: NatalChart, sys: SimplifiedSystems, question: string, _recentContext: string): string {
  const qLower = question.toLowerCase();
  const moonEl = ELEMENTS[chart.moon.sign] ?? "Water";

  // Relationship / love questions
  if (qLower.includes("relationship") || qLower.includes("love") || qLower.includes("partner") || qLower.includes("dating")) {
    return `${name}, your question touches the tenderest territory of the human experience — and your chart has much to say about how you love.

With your ${chart.moon.sign} Moon in the ${ordinal(chart.moon.house)} house, you experience love as a ${moonEl} element experience — ${moonEl === "Water" ? "deep, oceanic, and sometimes overwhelming in its intensity" : moonEl === "Fire" ? "passionate, immediate, and alive with spark" : moonEl === "Earth" ? "steady, embodied, and built on trust over time" : "cerebral, communicative, and expressed through understanding"}.

Your Venus in ${chart.venus.sign} (House ${chart.venus.house}) reveals your love language — what you're attracted to, what you offer, and what makes your heart sing. Mars in ${chart.mars.sign} speaks to your desire nature and how you pursue what you want.

As a ${sys.hdType}, your strategy in relationships mirrors your strategy in life: ${sys.hdStrategy.toLowerCase()}. This means the deepest connections will not come from pursuit but from alignment. Your ${sys.hdAuthority} authority is your most reliable compass — when it says yes, trust it completely.

What I know to be true about you: you are not here for a love that diminishes you. You are here for a love that sees the fullness of your ${chart.sun.sign} fire, your ${chart.moon.sign} depth — and meets it all with presence.`;
  }

  // Career / purpose / opportunity
  if (qLower.includes("career") || qLower.includes("job") || qLower.includes("work") || qLower.includes("opportunity") || qLower.includes("should i take")) {
    return `${name}, decisions about work and purpose are never just practical questions — they are soul questions. Let me look at what your chart reveals.

Your Midheaven in ${chart.midheaven.sign} points toward the kind of work that aligns with your highest expression. This isn't about a specific job title — it's about the energy you're meant to bring to whatever you do.

Saturn in ${chart.saturn.sign} (House ${chart.saturn.house}) is your career teacher — showing where disciplined effort builds lasting achievement. Jupiter in ${chart.jupiter.sign} (House ${chart.jupiter.house}) shows where expansion and opportunity flow most naturally.

As a ${sys.hdType} with ${sys.hdAuthority} authority, the way you make correct decisions is specific: ${sys.hdStrategy.toLowerCase()}. This is not a suggestion — it is the mechanism your soul chose.

Your Life Path ${sys.lifePathNumber} — ${sys.lifePathMeaning} — tells me that your work in the world is not meant to look like anyone else's. The question is not whether an opportunity is "good" — it is whether it asks you to bring your full design to the table.

Does this opportunity make your ${sys.hdType === "Generator" || sys.hdType === "Manifesting Generator" ? "sacral energy light up" : sys.hdType === "Projector" ? "recognize something true about yourself" : "creative impulse stir"}? Not your mind — your body. Not your fear — your knowing.`;
  }

  // Pattern / why do I keep
  if (qLower.includes("pattern") || qLower.includes("keep") || qLower.includes("repeating") || qLower.includes("stuck") || qLower.includes("why do i")) {
    return `${name}, the fact that you can see the pattern means you are already more than halfway through it. Unconscious patterns repeat endlessly. Conscious ones are asking to be transformed.

Your South Node in ${chart.southNode.sign} reveals the patterns you're being asked to release — old identities, old strategies, old definitions of safety that once served you but now hold you back. Your North Node in ${chart.northNode.sign} shows the direction of growth.

Your ${chart.moon.sign} Moon may be holding emotional memories that predate your conscious understanding. ${moonEl} moon energy processes through ${moonEl === "Water" ? "feeling — you may need to cry, journal, or simply let the emotion move through you" : moonEl === "Fire" ? "action — the pattern breaks when you do something different, even something small" : moonEl === "Earth" ? "the body — movement, nature, or a change of physical environment can shift what the mind cannot" : "understanding — naming what is happening precisely can dissolve its power"}.

Pluto in ${chart.pluto.sign} (House ${chart.pluto.house}) shows the deepest layer of transformation available to you. This is where your greatest wound and greatest power live in the same place.

You are not broken, ${name}. You are a ${chart.sun.sign} soul with a ${sys.hdProfile} profile, which means you learn through ${sys.hdProfile.includes("1/") ? "deep investigation" : sys.hdProfile.includes("3/") || sys.hdProfile.includes("/3") ? "trial and lived experience" : sys.hdProfile.includes("6/") || sys.hdProfile.includes("/6") ? "time and eventually role-modeling" : "the dance between inner and outer worlds"}. The pattern is not punishment. It is curriculum.`;
  }

  // Default / general question
  return `${name}, I hear your question and I want to meet it with the full weight of what I see in your chart.

Your ${chart.sun.sign} Sun at ${chart.sun.degreeInSign.toFixed(0)}° carries a particular kind of knowing — a wisdom that is yours to trust. Your ${chart.moon.sign} Moon has been processing this question beneath the surface, and your ${chart.ascendant.sign} Rising is ready to express whatever truth emerges.

Mercury in ${chart.mercury.sign} (House ${chart.mercury.house}) shapes how you think about this — the mental framework through which you process your question. Notice if your mind is spinning: that's Mercury doing its work.

As a ${sys.hdType}, the most important thing I can remind you of is this: ${sys.hdStrategy.toLowerCase()}. Your ${sys.hdAuthority} authority is not intellectual — it is felt. Close your eyes for a moment and notice where your body holds tension around this question. That tension is information.

I do not tell you what to do, ${name}. That is not Pearl's way. I tell you who you are — and trust that when you remember, the right action becomes obvious. You are a ${sys.hdType} on Life Path ${sys.lifePathNumber}. You were made for this.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ────────────────────────────────────────────────────────────────
// Internal Mutations (DB writes)
// ────────────────────────────────────────────────────────────────

export const saveNatalChart = internalMutation({
  args: {
    userId: v.id("users"),
    sunSign: v.string(), sunHouse: v.number(),
    moonSign: v.string(), moonHouse: v.number(),
    ascendantSign: v.string(), midheavenSign: v.string(),
    northNodeSign: v.string(), northNodeHouse: v.number(),
    saturnSign: v.string(), saturnHouse: v.number(),
    houseSystem: v.string(),
    fullChartJson: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("natalCharts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    const data = { ...args, createdAt: Date.now() };
    if (existing) { await ctx.db.patch(existing._id, data); return existing._id; }
    return await ctx.db.insert("natalCharts", data);
  },
});

export const saveLifePurpose = internalMutation({
  args: {
    userId: v.id("users"),
    purposeDirection: v.string(),
    careerAlignment: v.string(),
    leadershipStyle: v.string(),
    fulfillmentDrivers: v.string(),
    longTermPath: v.string(),
    northNodeSign: v.string(), northNodeHouse: v.number(),
    midheavenSign: v.string(),
    sunSign: v.string(), sunHouse: v.number(),
    saturnSign: v.string(), saturnHouse: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("lifePurposeProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    const data = { ...args, createdAt: Date.now() };
    if (existing) { await ctx.db.patch(existing._id, data); return existing._id; }
    return await ctx.db.insert("lifePurposeProfiles", data);
  },
});

// Keep legacy cosmicProfiles for backward compat with existing frontend
export const saveCosmicProfile = internalMutation({
  args: {
    userId: v.id("users"),
    sunSign: v.string(), moonSign: v.string(), risingSign: v.string(),
    hdType: v.string(), hdAuthority: v.string(), hdProfile: v.string(),
    lifePurpose: v.string(), evolution: v.string(), radiance: v.string(),
    lifePathTree: v.string(), soulUrge: v.string(),
    lifePathNumber: v.number(), expressionNumber: v.number(), soulNumber: v.number(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cosmicProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    const data = { ...args, generatedAt: Date.now() };
    if (existing) { await ctx.db.patch(existing._id, data); return existing._id; }
    return await ctx.db.insert("cosmicProfiles", data);
  },
});

export const saveReading = internalMutation({
  args: {
    userId: v.id("users"), type: v.string(), title: v.string(),
    content: v.string(), date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("readings", { ...args, createdAt: Date.now() });
  },
});

// ────────────────────────────────────────────────────────────────
// Actions (called from frontend)
// ────────────────────────────────────────────────────────────────

/**
 * Generate the complete cosmic fingerprint:
 * 1. Calculate real natal chart (Swiss Ephemeris)
 * 2. Save natal chart to DB
 * 3. Generate Life Purpose profile
 * 4. Save Life Purpose to DB
 * 5. Generate summary text
 * 6. Save legacy cosmic profile (backward compat)
 */
export const generateCosmicFingerprint = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found. Complete onboarding first.");

    // 1. Real natal chart from Swiss Ephemeris
    const chart = await calculateNatalChart(
      profile.birthDate,
      profile.birthTime,
      profile.birthCity,
      profile.birthCountry,
    );

    // 2. Save natal chart
    await ctx.runMutation(internal.pearl.saveNatalChart, {
      userId,
      sunSign: chart.sun.sign, sunHouse: chart.sun.house,
      moonSign: chart.moon.sign, moonHouse: chart.moon.house,
      ascendantSign: chart.ascendant.sign, midheavenSign: chart.midheaven.sign,
      northNodeSign: chart.northNode.sign, northNodeHouse: chart.northNode.house,
      saturnSign: chart.saturn.sign, saturnHouse: chart.saturn.house,
      houseSystem: chart.houseSystem,
      fullChartJson: chart.fullChartJson,
    });

    // 3. Generate Life Purpose from real natal chart positions
    const purpose = generateLifePurpose(
      chart.northNode.sign,
      chart.northNode.house,
      chart.midheaven.sign,
      chart.sun.sign,
      chart.sun.house,
      chart.saturn.sign,
      chart.saturn.house,
    );

    // 4. Save Life Purpose
    await ctx.runMutation(internal.pearl.saveLifePurpose, {
      userId,
      ...purpose,
      northNodeSign: chart.northNode.sign, northNodeHouse: chart.northNode.house,
      midheavenSign: chart.midheaven.sign,
      sunSign: chart.sun.sign, sunHouse: chart.sun.house,
      saturnSign: chart.saturn.sign, saturnHouse: chart.saturn.house,
    });

    // 5. Simplified systems (HD, Kabbalah, Numerology)
    const sys = computeSimplifiedSystems(profile.birthDate, profile.birthTime);
    const summary = generateFingerprintSummary(profile.displayName, chart, sys);

    // 6. Save legacy cosmic profile for existing frontend
    await ctx.runMutation(internal.pearl.saveCosmicProfile, {
      userId,
      sunSign: chart.sun.sign, moonSign: chart.moon.sign, risingSign: chart.ascendant.sign,
      hdType: sys.hdType, hdAuthority: sys.hdAuthority, hdProfile: sys.hdProfile,
      lifePurpose: purpose.purposeDirection.slice(0, 200),
      evolution: purpose.longTermPath.slice(0, 200),
      radiance: purpose.careerAlignment.slice(0, 200),
      lifePathTree: sys.kbSephirah, soulUrge: sys.kbSoulUrge,
      lifePathNumber: sys.lifePathNumber, expressionNumber: sys.expressionNumber, soulNumber: sys.soulNumber,
      summary,
    });

    return summary;
  },
});

export const generateLifePurposeReading = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found");

    const chart = await calculateNatalChart(
      profile.birthDate, profile.birthTime, profile.birthCity, profile.birthCountry,
    );
    const sys = computeSimplifiedSystems(profile.birthDate, profile.birthTime);
    const content = generateLifePurposeText(profile.displayName, chart, sys);
    const today = new Date().toISOString().split("T")[0];

    await ctx.runMutation(internal.pearl.saveReading, {
      userId, type: "life_purpose", title: "Why Am I Here?", content, date: today,
    });

    return content;
  },
});

export const generateDailyBrief = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found");

    const chart = await calculateNatalChart(
      profile.birthDate, profile.birthTime, profile.birthCity, profile.birthCountry,
    );
    const sys = computeSimplifiedSystems(profile.birthDate, profile.birthTime);
    const today = new Date();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    const dateStr = today.toISOString().split("T")[0];

    // Real transit aspects
    const transitSummary = generateTransitSummary(chart);
    const content = generateDailyBriefText(profile.displayName, chart, sys, dayOfWeek, transitSummary);

    await ctx.runMutation(internal.pearl.saveReading, {
      userId, type: "daily_brief", title: `Cosmic Brief — ${dayOfWeek}`, content, date: dateStr,
    });

    return content;
  },
});

export const askOracle = action({
  args: {
    conversationId: v.id("conversations"),
    question: v.string(),
  },
  handler: async (ctx, { conversationId, question }): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found");

    const chart = await calculateNatalChart(
      profile.birthDate, profile.birthTime, profile.birthCity, profile.birthCountry,
    );
    const sys = computeSimplifiedSystems(profile.birthDate, profile.birthTime);

    // Get recent messages for context
    const messages: any[] = await ctx.runQuery(internal.oracle.getMessagesInternal, { conversationId });
    const recentContext = messages
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? profile.displayName : "Pearl"}: ${m.content}`)
      .join("\n\n");

    const answer = generateOracleResponse(profile.displayName, chart, sys, question, recentContext);

    await ctx.runMutation(internal.oracle.addMessageInternal, {
      conversationId, role: "oracle", content: answer,
    });

    return answer;
  },
});

// ────────────────────────────────────────────────────────────────
// Transit & Progression Actions
// ────────────────────────────────────────────────────────────────

export const getTransits = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found");

    const chart = await calculateNatalChart(
      profile.birthDate, profile.birthTime, profile.birthCity, profile.birthCountry,
    );
    const transitChart = calculateTransitChart(chart);

    return {
      positions: transitChart.currentPositions,
      aspects: transitChart.aspects,
      date: transitChart.date,
    };
  },
});

export const getProgressions = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found");

    const progressed = await calculateProgressedChart(
      profile.birthDate, profile.birthTime, profile.birthCity, profile.birthCountry,
    );

    return {
      progressedSun: {
        sign: progressed.progressedSun.sign,
        degree: progressed.progressedSun.degree,
        degreeInSign: progressed.progressedSun.degree % 30,
      },
      progressedMoon: {
        sign: progressed.progressedMoon.sign,
        degree: progressed.progressedMoon.degree,
        degreeInSign: progressed.progressedMoon.degree % 30,
      },
      progressedAscendant: progressed.progressedAscendant ? {
        sign: progressed.progressedAscendant.sign,
        degree: progressed.progressedAscendant.degree,
        degreeInSign: progressed.progressedAscendant.degree % 30,
      } : undefined,
      yearsProgressed: progressed.yearsProgressed,
    };
  },
});
