/**
 * Pearl AI — Core generation actions.
 * Uses astronomy-engine for precise Sun/Moon/Rising sign calculations,
 * plus deterministic formulas for other modalities.
 * The quick_ai_search tool is a web search (not creative generation), so we use
 * it sparingly for current cosmic weather and rely on high-quality crafted content.
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  getAccurateSunSign,
  getAccurateMoonSign,
  getAscendant,
  geocodeCity,
  estimateUtcOffset,
} from "./astroCalc";

// Viktor Tools API reserved for future AI enhancements
// const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;

// ────────────────────────────────────────────────────────────────
// Cosmic Computation Engine
// ────────────────────────────────────────────────────────────────

interface CosmicProfile {
  sunSign: string; moonSign: string; risingSign: string;
  sunElement: string; moonElement: string;
  hdType: string; hdAuthority: string; hdProfile: string; hdStrategy: string;
  gkLifePurpose: string; gkEvolution: string; gkRadiance: string;
  gkShadow: string; gkGift: string; gkSiddhi: string;
  kbSephirah: string; kbPath: string; kbSoulUrge: string;
  lifePathNumber: number; expressionNumber: number; soulNumber: number;
  lifePathMeaning: string;
}

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

function computeCosmicProfile(
  birthDate: string,
  birthTime: string | undefined,
  _birthCity: string,
  birthLat?: number,
  birthLng?: number,
): CosmicProfile {
  const date = new Date(birthDate);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  // Parse birth time (local) — default to noon if unknown
  let localHour = 12;
  let localMinute = 0;
  if (birthTime) {
    const parts = birthTime.split(":");
    localHour = Number.parseInt(parts[0], 10);
    localMinute = Number.parseInt(parts[1] || "0", 10);
  }

  // Estimate UTC offset from longitude (solar time) and convert local → UTC
  const utcOffset = birthLng != null ? estimateUtcOffset(birthLng) : 0;
  let utcHour = localHour - utcOffset;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  if (utcHour < 0) { utcHour += 24; utcDay -= 1; }
  if (utcHour >= 24) { utcHour -= 24; utcDay += 1; }
  // Simplified day rollover — handles most cases correctly
  if (utcDay < 1) { utcMonth -= 1; if (utcMonth < 1) { utcMonth = 12; utcYear -= 1; } utcDay = new Date(utcYear, utcMonth, 0).getDate(); }
  if (utcDay > new Date(utcYear, utcMonth, 0).getDate()) { utcDay = 1; utcMonth += 1; if (utcMonth > 12) { utcMonth = 1; utcYear += 1; } }

  // ─── Sun Sign (astronomy-engine: actual ecliptic longitude) ───
  const sunSign = getAccurateSunSign(utcYear, utcMonth, utcDay, utcHour, localMinute);
  const sunElement = ELEMENTS[sunSign];

  // ─── Moon Sign (astronomy-engine: actual lunar ecliptic longitude) ───
  const moonSign = getAccurateMoonSign(utcYear, utcMonth, utcDay, utcHour, localMinute);
  const moonElement = ELEMENTS[moonSign];

  // ─── Rising Sign (astronomy-engine: actual ascendant from sidereal time + lat/lng) ───
  let risingSign: string;
  if (birthLat != null && birthLng != null && birthTime) {
    risingSign = getAscendant(utcYear, utcMonth, utcDay, utcHour, localMinute, birthLat, birthLng);
  } else {
    // Fallback: use Moon's sign when birth time/location unavailable
    risingSign = moonSign;
  }

  // ─── Human Design ───
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

  // ─── Gene Keys ───
  const gkNum = ((day + month * 3 + year) % 64) + 1;
  const gkTriads = [
    { shadow: "Entropy", gift: "Freshness", siddhi: "Beauty" },
    { shadow: "Dislocation", gift: "Orientation", siddhi: "Unity" },
    { shadow: "Chaos", gift: "Innovation", siddhi: "Innocence" },
    { shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness" },
    { shadow: "Impatience", gift: "Patience", siddhi: "Timelessness" },
    { shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace" },
    { shadow: "Division", gift: "Virtue", siddhi: "Guidance" },
    { shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness" },
    { shadow: "Inertia", gift: "Determination", siddhi: "Invincibility" },
    { shadow: "Self-Obsession", gift: "Naturalness", siddhi: "Being" },
    { shadow: "Obscurity", gift: "Idealism", siddhi: "Light" },
    { shadow: "Vanity", gift: "Discrimination", siddhi: "Purity" },
    { shadow: "Discord", gift: "Resolve", siddhi: "Empathy" },
    { shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness" },
    { shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence" },
    { shadow: "Indifference", gift: "Versatility", siddhi: "Mastery" },
  ];
  const triad = gkTriads[gkNum % gkTriads.length];
  const gkEvolutionNum = ((gkNum + 21) % 64) + 1;
  const gkRadianceNum = ((gkNum + 42) % 64) + 1;

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
  const digits = `${year}${month}${day}`.split("").map(Number);
  let lifePathNumber = digits.reduce((a, b) => a + b, 0);
  while (lifePathNumber > 9 && lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
    lifePathNumber = lifePathNumber.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  const expressionNumber = ((day + month) % 9) + 1;
  const soulNumber = ((month + year % 100) % 9) + 1;

  const lifePathMeanings: Record<number, string> = {
    1: "The Leader — independence, innovation, pioneering spirit",
    2: "The Diplomat — partnership, sensitivity, balance",
    3: "The Creator — expression, joy, artistic vision",
    4: "The Builder — stability, dedication, strong foundations",
    5: "The Adventurer — freedom, change, sensory wisdom",
    6: "The Nurturer — responsibility, love, healing presence",
    7: "The Seeker — introspection, spiritual depth, inner knowing",
    8: "The Powerhouse — abundance, authority, material mastery",
    9: "The Humanitarian — compassion, completion, global vision",
    11: "The Intuitive — spiritual messenger, illumination, visionary channel",
    22: "The Master Builder — manifesting dreams into reality, global impact",
    33: "The Master Teacher — compassionate service, spiritual upliftment",
  };

  return {
    sunSign, moonSign, risingSign, sunElement, moonElement,
    hdType: hdType.type, hdAuthority, hdProfile, hdStrategy: hdType.strategy,
    gkLifePurpose: `Gene Key ${gkNum}: ${triad.shadow} → ${triad.gift} → ${triad.siddhi}`,
    gkEvolution: `Gene Key ${gkEvolutionNum}`,
    gkRadiance: `Gene Key ${gkRadianceNum}`,
    gkShadow: triad.shadow, gkGift: triad.gift, gkSiddhi: triad.siddhi,
    kbSephirah: `${kbSeph.name} — ${kbSeph.meaning}`,
    kbPath, kbSoulUrge,
    lifePathNumber, expressionNumber, soulNumber,
    lifePathMeaning: lifePathMeanings[lifePathNumber] || "Universal wisdom",
  };
}

// ────────────────────────────────────────────────────────────────
// Oracle Text Generation (crafted, personalized)
// ────────────────────────────────────────────────────────────────

function generateFingerprintSummary(name: string, c: CosmicProfile): string {
  return `${name}, you carry the light of a ${c.sunSign} Sun — the ${c.sunElement} element burning at the center of your being, illuminating everything you touch with its particular warmth. Your ${c.moonSign} Moon holds the emotional wisdom of your inner landscape, a ${c.moonElement} current that runs deeper than most will ever know. And through your ${c.risingSign} Rising, the world first encounters a presence that is both invitation and mystery.

As a ${c.hdType} in Human Design, you move through the world with a very specific energetic signature. Your strategy — to ${c.hdStrategy.toLowerCase()} — is not a limitation but a liberation. Your ${c.hdAuthority} authority is the compass your soul chose for this lifetime, and your ${c.hdProfile} profile reveals the unique way you are designed to learn, grow, and share your wisdom.

Your ${c.gkLifePurpose} traces the evolutionary arc of your deepest potential. Here, the shadow of ${c.gkShadow} transforms through the gift of ${c.gkGift} into the highest expression of ${c.gkSiddhi}. This is not a journey of fixing — it is a journey of remembering.

In the Tree of Life, your soul resonates with ${c.kbSephirah}. You walk ${c.kbPath}, carrying the frequency of ${c.kbSoulUrge}. These are not labels — they are doorways.

With Life Path ${c.lifePathNumber} — ${c.lifePathMeaning} — the numerological signature of your birth confirms what every other system whispers: you arrived with a purpose that only you can fulfill. All five systems converge on a single truth — you are here not despite who you are, but because of it.`;
}

function generateLifePurposeText(name: string, c: CosmicProfile): string {
  const hdPurpose = c.hdType === "Generator" || c.hdType === "Manifesting Generator"
    ? "You are a life force — a sacred engine of creation. When something truly lights you up, your entire being hums with an energy that can move mountains. Your purpose is not found through seeking — it finds you, through the things that make your body say yes."
    : c.hdType === "Projector"
    ? "You are a guide — one who sees the architecture of energy in others with penetrating clarity. You were never meant to keep up with the pace of the world around you. Your purpose unfolds when you are deeply recognized for the wisdom you naturally carry."
    : c.hdType === "Manifestor"
    ? "You are an initiator — a force of nature that was born to start things, to set new realities into motion. You do not wait for permission. Your purpose is to follow the creative impulses that arise from within and inform those around you as you act."
    : "You are a mirror — a rare and sacred reflector of the health and vitality of your community. Your purpose unfolds slowly, over lunar cycles, as you sample the energy of the world around you and reflect back what is true.";

  const elementWisdom = c.sunElement === "Fire"
    ? "The fire in your chart does not burn to destroy — it burns to illuminate. You are here to bring light to places that have forgotten what light looks like."
    : c.sunElement === "Earth"
    ? "The earth in your design speaks of a soul that builds lasting things. You are here to give form to what exists only as potential — to make the invisible visible, the abstract real."
    : c.sunElement === "Air"
    ? "The air in your chart speaks of a mind that bridges worlds. You are here to translate — between people, between ideas, between what is known and what is waiting to be understood."
    : "The water in your design runs deep — deeper than you sometimes realize. You are here to feel what others cannot, to hold space for the emotional truths that the world needs most.";

  return `Beloved ${name},

Before the stars arranged themselves into the configuration of your birth, something in the fabric of existence chose this precise design for you. Not by accident. Not by chance. By a wisdom far older than any single lifetime.

${hdPurpose}

Your ${c.sunSign} Sun reveals the core frequency you came to embody. ${elementWisdom} Your ${c.moonSign} Moon is where your deepest emotional intelligence lives — the part of you that knows things before your mind catches up. And your ${c.risingSign} Rising is the sacred doorway through which others encounter your particular brand of magic.

Your ${c.gkLifePurpose} illuminates the precise edge where your greatest wound becomes your greatest gift. The shadow of ${c.gkShadow} is not something to fear — it is the compost from which the flower of ${c.gkGift} blooms. And beyond that gift lies ${c.gkSiddhi}, the highest octave of who you are capable of becoming. This is not about perfection. This is about the courage to keep transforming.

In the Kabbalistic Tree of Life, your soul resonates with ${c.kbSephirah}. You walk ${c.kbPath}, which means you are learning to hold both the human and the divine within a single breath. ${c.kbSoulUrge} — this is the whisper beneath all your longing, the name for the nameless pull you've felt your entire life.

Life Path ${c.lifePathNumber} — ${c.lifePathMeaning} — seals what every system has been pointing toward. The astrology, the Human Design, the Gene Keys, the Kabbalah, the Numerology — they all converge on a single, undeniable truth:

You are here to become who you already are. Not the version of you that the world shaped. Not the version that learned to perform. The version that was there before the first breath — ancient, knowing, and utterly irreplaceable.

This is your design, ${name}. Not a cage, but a constellation. Not a fate, but an invitation. The only question that remains is the one Pearl cannot answer for you:

Are you ready to live it?`;
}

function generateDailyBriefText(name: string, c: CosmicProfile, dayOfWeek: string): string {
  const dayEnergies: Record<string, string> = {
    Sunday: "The Sun's day — a time of illumination and renewed purpose",
    Monday: "The Moon's day — emotions run closer to the surface, inviting inner listening",
    Tuesday: "Mars rules today — courage and decisive action are favored",
    Wednesday: "Mercury's day — communication, connection, and mental clarity are heightened",
    Thursday: "Jupiter expands today — growth, learning, and abundance flow more freely",
    Friday: "Venus graces today — beauty, relationships, and creative expression are amplified",
    Saturday: "Saturn's day — structure, reflection, and honest self-assessment serve you well",
  };

  const hdAdvice = c.hdType === "Generator" || c.hdType === "Manifesting Generator"
    ? "Pay attention to what lights up your sacral energy today. The universe will present something worth responding to — your body will know before your mind does."
    : c.hdType === "Projector"
    ? "Conserve your energy today for what truly matters. An invitation or recognition may arrive — be ready to receive it fully rather than chasing what isn't meant for you."
    : c.hdType === "Manifestor"
    ? "Notice what creative impulse is stirring within you today. Trust the urge to initiate, and remember to inform those around you as you move."
    : "Take note of the collective energy around you today. Your gift is in reflecting truth — allow yourself the space to process before committing to anything.";

  const elementForecast = c.sunElement === "Fire"
    ? "Your fire energy may feel particularly alive today. Channel it intentionally rather than letting it scatter."
    : c.sunElement === "Earth"
    ? "Ground yourself this morning. Your earth energy thrives when you tend to the practical before the aspirational."
    : c.sunElement === "Air"
    ? "Your mental energy is heightened today. A conversation or idea may arrive that shifts your perspective in an unexpected way."
    : "Your emotional antenna is especially sensitive today. Honor what you feel — it carries information your mind hasn't processed yet.";

  return `Good morning, ${name}.

${dayEnergies[dayOfWeek] || "Today carries its own unique frequency."} For your ${c.sunSign} Sun and ${c.moonSign} Moon, this day holds a particular resonance.

${elementForecast}

${hdAdvice}

Your Gene Key shadow of ${c.gkShadow} may surface today in small moments — a frustration, a contraction, a familiar pattern. Notice it without judgment. This is not failure; it is the raw material of your gift of ${c.gkGift}. Every time you catch the shadow with awareness, you transmute it.

Today's invitation: ${c.hdStrategy.toLowerCase()}. Trust your ${c.hdAuthority} authority. And remember — you are not here to get today right. You are here to live it fully, as only a ${c.sunSign} ${c.hdType} with Life Path ${c.lifePathNumber} can.

The stars are not commanding you, ${name}. They are conspiring on your behalf.`;
}

function generateOracleResponse(name: string, c: CosmicProfile, question: string, _recentContext: string): string {
  const qLower = question.toLowerCase();

  // Relationship / love questions
  if (qLower.includes("relationship") || qLower.includes("love") || qLower.includes("partner") || qLower.includes("dating")) {
    return `${name}, your question touches the tenderest territory of the human experience — and your design has much to say about how you love.

With your ${c.moonSign} Moon, you experience love as a ${c.moonElement} element experience — ${c.moonElement === "Water" ? "deep, oceanic, and sometimes overwhelming in its intensity" : c.moonElement === "Fire" ? "passionate, immediate, and alive with spark" : c.moonElement === "Earth" ? "steady, embodied, and built on trust over time" : "cerebral, communicative, and expressed through understanding"}. This is not how the world taught you to love. This is how your soul actually does.

As a ${c.hdType}, your strategy in relationships mirrors your strategy in life: ${c.hdStrategy.toLowerCase()}. This means the deepest connections will not come from pursuit but from alignment. Your ${c.hdAuthority} authority is your most reliable compass — when it says yes, trust it completely. When it hesitates, honor that equally.

What I know to be true about you: you are not here for a love that diminishes you. You are here for a love that sees the fullness of your ${c.sunSign} fire, your ${c.moonSign} depth, and your ${c.gkGift} — and meets it all with presence.`;
  }

  // Career / purpose / opportunity
  if (qLower.includes("career") || qLower.includes("job") || qLower.includes("work") || qLower.includes("opportunity") || qLower.includes("should i take")) {
    return `${name}, decisions about work and purpose are never just practical questions — they are soul questions. Let me look at what your design reveals.

As a ${c.hdType} with ${c.hdAuthority} authority, the way you make correct decisions is specific: ${c.hdStrategy.toLowerCase()}. This is not a suggestion — it is the mechanism your soul chose. When you override it, things may work on the surface but feel hollow underneath. When you honor it, even difficult paths carry a rightness you can feel in your bones.

Your Life Path ${c.lifePathNumber} — ${c.lifePathMeaning} — tells me that your work in the world is not meant to look like anyone else's. Your Gene Key gift of ${c.gkGift} is the particular medicine you bring to everything you do. The question is not whether an opportunity is "good" — it is whether it asks you to bring your full design to the table.

Here is what I would invite you to sit with: does this opportunity make your ${c.hdType === "Generator" || c.hdType === "Manifesting Generator" ? "sacral energy light up" : c.hdType === "Projector" ? "recognize something true about yourself" : "creative impulse stir"}? Not your mind — your body. Not your fear — your knowing. That is where your answer lives.`;
  }

  // Pattern / why do I keep
  if (qLower.includes("pattern") || qLower.includes("keep") || qLower.includes("repeating") || qLower.includes("stuck") || qLower.includes("why do i")) {
    return `${name}, the fact that you can see the pattern means you are already more than halfway through it. Unconscious patterns repeat endlessly. Conscious ones are asking to be transformed.

Your Gene Key shadow of ${c.gkShadow} is likely at the heart of what you're experiencing. This shadow is not a flaw — it is the entry point to your greatest gift. ${c.gkShadow} becomes ${c.gkGift} becomes ${c.gkSiddhi}. Every time you catch yourself in the shadow and bring awareness to it, you are doing the evolutionary work your soul came here for.

Your ${c.moonSign} Moon may be holding emotional memories that predate your conscious understanding. ${c.moonElement} moon energy processes through ${c.moonElement === "Water" ? "feeling — you may need to cry, journal, or simply let the emotion move through you" : c.moonElement === "Fire" ? "action — the pattern breaks when you do something different, even something small" : c.moonElement === "Earth" ? "the body — movement, nature, or a change of physical environment can shift what the mind cannot" : "understanding — naming what is happening precisely can dissolve its power"}.

You are not broken, ${name}. You are a ${c.sunSign} soul with a ${c.hdProfile} profile, which means you learn through ${c.hdProfile.includes("1/") ? "deep investigation" : c.hdProfile.includes("3/") || c.hdProfile.includes("/3") ? "trial and lived experience" : c.hdProfile.includes("6/") || c.hdProfile.includes("/6") ? "time and eventually role-modeling" : "the dance between inner and outer worlds"}. The pattern is not punishment. It is curriculum.`;
  }

  // Default / general question
  return `${name}, I hear your question and I want to meet it with the full weight of what I see in your design.

Your ${c.sunSign} Sun carries a particular kind of knowing — a ${c.sunElement} wisdom that is yours to trust. When you ask this question, I sense you already hold part of the answer within you. Your ${c.moonSign} Moon has been processing it beneath the surface, and your ${c.risingSign} Rising is ready to express whatever truth emerges.

As a ${c.hdType}, the most important thing I can remind you of is this: ${c.hdStrategy.toLowerCase()}. Your ${c.hdAuthority} authority is not intellectual — it is felt. Close your eyes for a moment and notice where your body holds tension around this question. That tension is information.

Your Gene Key pathway of ${c.gkShadow} → ${c.gkGift} → ${c.gkSiddhi} suggests that the answer you seek lies in the space between your shadow and your gift. What if the thing you're afraid of is the exact doorway to what you're seeking?

I do not tell you what to do, ${name}. That is not Pearl's way. I tell you who you are — and trust that when you remember, the right action becomes obvious. You are a ${c.hdType} on Life Path ${c.lifePathNumber}. You were made for this.`;
}

// ────────────────────────────────────────────────────────────────
// Internal Mutations
// ────────────────────────────────────────────────────────────────

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

export const generateCosmicFingerprint = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.profiles.getUserProfileInternal, { userId });
    if (!profile) throw new Error("No profile found. Complete onboarding first.");

    // Resolve lat/lng: use stored values, or geocode from city/country
    let lat = profile.birthLat as number | undefined;
    let lng = profile.birthLng as number | undefined;
    if (lat == null || lng == null) {
      const geo = await geocodeCity(profile.birthCity, profile.birthCountry);
      if (geo) { lat = geo.lat; lng = geo.lng; }
    }

    const c = computeCosmicProfile(profile.birthDate, profile.birthTime, profile.birthCity, lat, lng);
    const summary = generateFingerprintSummary(profile.displayName, c);

    await ctx.runMutation(internal.pearl.saveCosmicProfile, {
      userId,
      sunSign: c.sunSign, moonSign: c.moonSign, risingSign: c.risingSign,
      hdType: c.hdType, hdAuthority: c.hdAuthority, hdProfile: c.hdProfile,
      lifePurpose: c.gkLifePurpose, evolution: c.gkEvolution, radiance: c.gkRadiance,
      lifePathTree: c.kbSephirah, soulUrge: c.kbSoulUrge,
      lifePathNumber: c.lifePathNumber, expressionNumber: c.expressionNumber, soulNumber: c.soulNumber,
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

    let lat = profile.birthLat as number | undefined;
    let lng = profile.birthLng as number | undefined;
    if (lat == null || lng == null) {
      const geo = await geocodeCity(profile.birthCity, profile.birthCountry);
      if (geo) { lat = geo.lat; lng = geo.lng; }
    }

    const c = computeCosmicProfile(profile.birthDate, profile.birthTime, profile.birthCity, lat, lng);
    const content = generateLifePurposeText(profile.displayName, c);
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

    let lat = profile.birthLat as number | undefined;
    let lng = profile.birthLng as number | undefined;
    if (lat == null || lng == null) {
      const geo = await geocodeCity(profile.birthCity, profile.birthCountry);
      if (geo) { lat = geo.lat; lng = geo.lng; }
    }

    const c = computeCosmicProfile(profile.birthDate, profile.birthTime, profile.birthCity, lat, lng);
    const today = new Date();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    const dateStr = today.toISOString().split("T")[0];

    const content = generateDailyBriefText(profile.displayName, c, dayOfWeek);

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

    let lat = profile.birthLat as number | undefined;
    let lng = profile.birthLng as number | undefined;
    if (lat == null || lng == null) {
      const geo = await geocodeCity(profile.birthCity, profile.birthCountry);
      if (geo) { lat = geo.lat; lng = geo.lng; }
    }

    const c = computeCosmicProfile(profile.birthDate, profile.birthTime, profile.birthCity, lat, lng);

    // Get recent messages for context
    const messages: any[] = await ctx.runQuery(internal.oracle.getMessagesInternal, { conversationId });
    const recentContext = messages
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? profile.displayName : "Pearl"}: ${m.content}`)
      .join("\n\n");

    const answer = generateOracleResponse(profile.displayName, c, question, recentContext);

    await ctx.runMutation(internal.oracle.addMessageInternal, {
      conversationId, role: "oracle", content: answer,
    });

    return answer;
  },
});

// ────────────────────────────────────────────────────────────────
// Batch migration — regenerate ALL cosmic profiles with accurate calcs
// ────────────────────────────────────────────────────────────────

/**
 * Internal action to regenerate cosmic profiles for ALL existing users.
 * Run from the Convex dashboard after deploying the astronomy-engine update.
 *
 * For each user profile:
 *  1. Geocodes birth city → lat/lng (if not already stored)
 *  2. Recomputes Sun, Moon, Rising using real astronomical calculations
 *  3. Patches (upserts) the cosmicProfile record
 *
 * Safe to run multiple times — saveCosmicProfile patches existing records.
 */
export const migrateAllCosmicProfiles = internalAction({
  args: {},
  handler: async (ctx): Promise<string> => {
    // Fetch all user profiles
    const allProfiles: any[] = await ctx.runQuery(
      internal.profiles.getAllUserProfilesInternal,
    );

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const profile of allProfiles) {
      try {
        // Resolve lat/lng
        let lat = profile.birthLat as number | undefined;
        let lng = profile.birthLng as number | undefined;
        if (lat == null || lng == null) {
          const geo = await geocodeCity(profile.birthCity, profile.birthCountry);
          if (geo) { lat = geo.lat; lng = geo.lng; }
        }

        const c = computeCosmicProfile(
          profile.birthDate, profile.birthTime, profile.birthCity, lat, lng,
        );
        const summary = generateFingerprintSummary(profile.displayName, c);

        await ctx.runMutation(internal.pearl.saveCosmicProfile, {
          userId: profile.userId,
          sunSign: c.sunSign, moonSign: c.moonSign, risingSign: c.risingSign,
          hdType: c.hdType, hdAuthority: c.hdAuthority, hdProfile: c.hdProfile,
          lifePurpose: c.gkLifePurpose, evolution: c.gkEvolution, radiance: c.gkRadiance,
          lifePathTree: c.kbSephirah, soulUrge: c.kbSoulUrge,
          lifePathNumber: c.lifePathNumber, expressionNumber: c.expressionNumber, soulNumber: c.soulNumber,
          summary,
        });
        updated++;
      } catch (e: any) {
        errors.push(`User ${profile.userId}: ${e.message}`);
        skipped++;
      }
    }

    const result = `Migration complete: ${updated} profiles updated, ${skipped} skipped.${errors.length > 0 ? "\nErrors:\n" + errors.join("\n") : ""}`;
    console.log(result);
    return result;
  },
});
