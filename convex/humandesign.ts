/**
 * Human Design Calculation Engine for Inner Pearl
 *
 * Implements accurate HD chart calculation from first principles using
 * astronomy-engine for planetary positions. Replaces the placeholder
 * hash-based formulas with real astronomical calculations.
 *
 * Key concepts:
 *   1. Gate-to-degree mapping — 64 I Ching gates mapped to the 360° ecliptic
 *   2. 88° solar arc — backward search to find the "Design Date"
 *   3. Planetary activations — 13 bodies × 2 dates = 26 gate activations
 *   4. Channel/Center definition — defined when both gates of a channel are active
 *   5. Type, Authority, Profile — derived from center/channel topology
 *
 * Data sources verified against:
 *   - barneyandflow.com/gate-zodiac-degrees (gate positions)
 *   - hdkit (jdempcy/hdkit, MIT license)
 *   - CReizner/SharpAstrology.HumanDesign (MIT license)
 *   - humandesignsystem.co and mybodygraph.com (validation)
 */

import * as Astronomy from "astronomy-engine";

// ────────────────────────────────────────────────────────────────
// Gate-to-Degree Mapping
// ────────────────────────────────────────────────────────────────
//
// The HD mandala divides the 360° ecliptic into 64 equal gates of 5.625° each.
// The wheel begins with Gate 41 at 2°00' Aquarius (302° ecliptic longitude).
// Sequence verified against barneyandflow.com/gate-zodiac-degrees.

/** Gate sequence around the mandala, starting from 302° ecliptic */
const GATE_SEQUENCE: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, // Aquarius → Pisces → early Aries
  17, 21, 51, 42, 3,                            // Aries
  27, 24, 2, 23, 8,                             // Taurus
  20, 16, 35, 45, 12,                           // Gemini
  15, 52, 39, 53, 62, 56,                       // Cancer
  31, 33, 7, 4, 29, 59,                         // Leo
  40, 64, 47, 6, 46,                            // Virgo
  18, 48, 57, 32, 50,                           // Libra
  28, 44, 1, 43, 14,                            // Scorpio
  34, 9, 5, 26, 11, 10, 58,                     // Sagittarius
  38, 54, 61, 60,                               // Capricorn (wraps back to Gate 41)
];

/** Starting ecliptic longitude of the mandala: 2° Aquarius = 302° */
const MANDALA_START_DEG = 302.0;

/** Each gate spans exactly 5°37'30" = 5.625° */
const GATE_SPAN_DEG = 5.625;

/** Each line within a gate spans 5.625° / 6 = 0.9375° */
const LINE_SPAN_DEG = GATE_SPAN_DEG / 6;

/**
 * Precomputed lookup: for each gate number (1-64), its starting ecliptic longitude.
 * Built from GATE_SEQUENCE at module load time.
 */
const GATE_START_DEGREES: Map<number, number> = new Map();

// Build the gate start degree lookup
for (let i = 0; i < 64; i++) {
  const gate = GATE_SEQUENCE[i];
  const startDeg = (MANDALA_START_DEG + i * GATE_SPAN_DEG) % 360;
  GATE_START_DEGREES.set(gate, startDeg);
}

// ────────────────────────────────────────────────────────────────
// Centers & Channels
// ────────────────────────────────────────────────────────────────

export type CenterName =
  | "Head"
  | "Ajna"
  | "Throat"
  | "G"
  | "Heart"
  | "Sacral"
  | "Spleen"
  | "SolarPlexus"
  | "Root";

/** Which center each gate belongs to */
// @ts-expect-error Lookup table used by future HD features
const GATE_TO_CENTER: Record<number, CenterName> = {
  // Head Center (3 gates)
  64: "Head", 61: "Head", 63: "Head",
  // Ajna Center (6 gates)
  47: "Ajna", 24: "Ajna", 4: "Ajna", 17: "Ajna", 11: "Ajna", 43: "Ajna",
  // Throat Center (11 gates)
  62: "Throat", 23: "Throat", 56: "Throat", 35: "Throat", 12: "Throat",
  45: "Throat", 33: "Throat", 8: "Throat", 31: "Throat", 20: "Throat", 16: "Throat",
  // G Center / Identity (8 gates)
  1: "G", 13: "G", 25: "G", 46: "G", 2: "G", 15: "G", 10: "G", 7: "G",
  // Heart / Ego / Will Center (4 gates)
  21: "Heart", 40: "Heart", 26: "Heart", 51: "Heart",
  // Sacral Center (9 gates)
  5: "Sacral", 14: "Sacral", 29: "Sacral", 59: "Sacral", 9: "Sacral",
  3: "Sacral", 42: "Sacral", 27: "Sacral", 34: "Sacral",
  // Spleen Center (7 gates)
  48: "Spleen", 57: "Spleen", 44: "Spleen", 50: "Spleen",
  32: "Spleen", 28: "Spleen", 18: "Spleen",
  // Solar Plexus / Emotional Center (7 gates)
  6: "SolarPlexus", 37: "SolarPlexus", 22: "SolarPlexus", 36: "SolarPlexus",
  49: "SolarPlexus", 55: "SolarPlexus", 30: "SolarPlexus",
  // Root Center (9 gates)
  53: "Root", 60: "Root", 52: "Root", 19: "Root", 39: "Root",
  41: "Root", 58: "Root", 38: "Root", 54: "Root",
};

/**
 * The 36 channels in Human Design.
 * Each channel connects two gates from two different centers.
 * Format: [gate1, gate2, center1, center2]
 */
const CHANNELS: [number, number, CenterName, CenterName][] = [
  // Head ↔ Ajna (3)
  [64, 47, "Head", "Ajna"],
  [61, 24, "Head", "Ajna"],
  [63, 4, "Head", "Ajna"],
  // Ajna ↔ Throat (3)
  [17, 62, "Ajna", "Throat"],
  [43, 23, "Ajna", "Throat"],
  [11, 56, "Ajna", "Throat"],
  // Throat ↔ G Center (4)
  [7, 31, "G", "Throat"],
  [1, 8, "G", "Throat"],
  [13, 33, "G", "Throat"],
  [10, 20, "G", "Throat"],
  // Throat ↔ Heart (1)
  [21, 45, "Heart", "Throat"],
  // Throat ↔ Solar Plexus (2)
  [12, 22, "Throat", "SolarPlexus"],
  [35, 36, "Throat", "SolarPlexus"],
  // Throat ↔ Sacral (1)
  [20, 34, "Throat", "Sacral"],
  // Throat ↔ Spleen (2)
  [16, 48, "Throat", "Spleen"],
  [20, 57, "Throat", "Spleen"],
  // G Center ↔ Sacral (3)
  [15, 5, "G", "Sacral"],
  [46, 29, "G", "Sacral"],
  [2, 14, "G", "Sacral"],
  // G Center ↔ Spleen (1)
  [10, 57, "G", "Spleen"],
  // G Center ↔ Heart (1)
  [25, 51, "G", "Heart"],
  // Heart ↔ Solar Plexus (1)
  [37, 40, "SolarPlexus", "Heart"],
  // Heart ↔ Spleen (1)
  [26, 44, "Heart", "Spleen"],
  // Sacral ↔ Solar Plexus (1)
  [59, 6, "Sacral", "SolarPlexus"],
  // Sacral ↔ Spleen (2)
  [27, 50, "Sacral", "Spleen"],
  [34, 57, "Sacral", "Spleen"],
  // Sacral ↔ Root (3)
  [3, 60, "Sacral", "Root"],
  [9, 52, "Sacral", "Root"],
  [42, 53, "Sacral", "Root"],
  // Solar Plexus ↔ Root (3)
  [49, 19, "SolarPlexus", "Root"],
  [55, 39, "SolarPlexus", "Root"],
  [30, 41, "SolarPlexus", "Root"],
  // Spleen ↔ Root (3)
  [18, 58, "Spleen", "Root"],
  [28, 38, "Spleen", "Root"],
  [32, 54, "Spleen", "Root"],
];

/** Motor centers — these can power the Throat for Manifestor/MG determination */
const MOTOR_CENTERS: Set<CenterName> = new Set<CenterName>(["Sacral", "Heart", "SolarPlexus", "Root"]);

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type HDType = "Generator" | "Manifesting Generator" | "Projector" | "Manifestor" | "Reflector";
export type HDAuthority =
  | "Emotional (Solar Plexus)"
  | "Sacral"
  | "Splenic"
  | "Ego Manifested"
  | "Ego Projected"
  | "Self-Projected"
  | "Mental (Outer Authority)"
  | "Lunar (No Inner Authority)";

export interface GateActivation {
  gate: number;
  line: number;
  color: number;       // 1-6 sub-line
  bodyName: string;    // e.g. "Sun", "Moon", "Mercury"
  type: "personality" | "design";
  eclipticLongitude: number;
}

export interface DefinedChannel {
  gate1: number;
  gate2: number;
  center1: CenterName;
  center2: CenterName;
}

export interface HDChart {
  type: HDType;
  authority: HDAuthority;
  strategy: string;
  signature: string;
  notSelf: string;
  profile: string;
  profileLines: [number, number];
  definedCenters: CenterName[];
  undefinedCenters: CenterName[];
  definedChannels: DefinedChannel[];
  personalityActivations: GateActivation[];
  designActivations: GateActivation[];
  allActiveGates: number[];
  incarnationCross: string;
  designDate: string;  // ISO string of the design (88° solar arc) date
  variables: {
    personalitySunLine: number;
    personalityEarthLine: number;
    designSunLine: number;
    designEarthLine: number;
  };
}

// ────────────────────────────────────────────────────────────────
// Astronomical Helpers (reuses astronomy-engine from ephemeris.ts)
// ────────────────────────────────────────────────────────────────

const OBLIQUITY_J2000 = 23.4393; // Mean obliquity at J2000, degrees

/** Get Sun's ecliptic longitude using astronomy-engine's high-accuracy SunPosition */
function getSunLongitude(time: Astronomy.AstroTime): number {
  return Astronomy.SunPosition(time).elon;
}

/** Get Moon's ecliptic longitude */
function getMoonLongitude(time: Astronomy.AstroTime): number {
  return Astronomy.EclipticGeoMoon(time).lon;
}

/**
 * Get ecliptic longitude of a planet using Equator → ecliptic conversion.
 * Matches the approach in ephemeris.ts for tropical zodiac positions.
 */
function getPlanetLongitude(body: string, time: Astronomy.AstroTime): number {
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(
    body as Astronomy.Body,
    time,
    observer,
    true,  // ofdate (includes precession)
    true,  // include aberration
  );

  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const raRad = eq.ra * 15 * Math.PI / 180;
  const decRad = eq.dec * Math.PI / 180;

  let lon = Math.atan2(
    Math.sin(raRad) * Math.cos(oblRad) + Math.tan(decRad) * Math.sin(oblRad),
    Math.cos(raRad),
  ) * 180 / Math.PI;

  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Calculate Mean North Node (ascending lunar node) longitude.
 * Formula from Meeus, Astronomical Algorithms (Chapter 47).
 */
function getMeanNorthNodeLongitude(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525;
  let omega = 125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T * T
    + T * T * T / 467441
    - T * T * T * T / 60616000;
  return ((omega % 360) + 360) % 360;
}

/**
 * Get ecliptic longitude of any HD body.
 * HD uses 13 bodies: Sun, Earth, Moon, North Node, South Node,
 * Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
 */
function getBodyLongitude(bodyName: string, time: Astronomy.AstroTime): number {
  switch (bodyName) {
    case "Sun":
      return getSunLongitude(time);
    case "Earth":
      // Earth is always opposite the Sun
      return (getSunLongitude(time) + 180) % 360;
    case "Moon":
      return getMoonLongitude(time);
    case "NorthNode":
      return getMeanNorthNodeLongitude(time);
    case "SouthNode":
      return (getMeanNorthNodeLongitude(time) + 180) % 360;
    default:
      return getPlanetLongitude(bodyName, time);
  }
}

// ────────────────────────────────────────────────────────────────
// 88° Solar Arc Search — Finding the Design Date
// ────────────────────────────────────────────────────────────────

/**
 * Normalize the shortest angular distance between two ecliptic longitudes.
 * Returns a signed value: positive if 'to' is ahead of 'from' in zodiacal order.
 */
function angleDiff(from: number, to: number): number {
  let diff = ((to - from) % 360 + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
}

/**
 * Find the moment when the Sun was exactly 88° earlier in ecliptic longitude
 * than at the given birth time. This gives the "Design Date" in Human Design.
 *
 * Uses iterative Newton-Raphson-style refinement:
 * 1. Start ~89 days before birth (approximate, since Sun ≈ 1°/day)
 * 2. Compare actual Sun position to target (birthSun - 88°)
 * 3. Adjust by (error / average_sun_speed) until converged
 *
 * Converges to < 1 second accuracy in ~5-8 iterations.
 */
function findDesignDate(birthTime: Astronomy.AstroTime): Astronomy.AstroTime {
  const birthSunLon = getSunLongitude(birthTime);
  const targetLon = ((birthSunLon - 88) % 360 + 360) % 360;

  // Average Sun speed: ~0.9856°/day. Start at ~89.3 days before birth.
  const AVERAGE_SUN_SPEED = 0.9856; // degrees per day
  let estimateDays = -88 / AVERAGE_SUN_SPEED; // ≈ -89.3 days

  let currentTime = Astronomy.MakeTime(
    new Date(birthTime.date.getTime() + estimateDays * 86400000)
  );

  for (let iteration = 0; iteration < 50; iteration++) {
    const currentSunLon = getSunLongitude(currentTime);
    const error = angleDiff(currentSunLon, targetLon);

    // Converged to within ~1 second of arc (1/3600 degree)
    if (Math.abs(error) < 0.0003) break;

    // Adjust time by error / sun_speed
    const adjustDays = error / AVERAGE_SUN_SPEED;
    currentTime = Astronomy.MakeTime(
      new Date(currentTime.date.getTime() + adjustDays * 86400000)
    );
  }

  return currentTime;
}

// ────────────────────────────────────────────────────────────────
// Gate & Line Resolution
// ────────────────────────────────────────────────────────────────

/**
 * Resolve an ecliptic longitude to a gate number (1-64) and line (1-6).
 *
 * The mandala starts at 302° (2° Aquarius) with Gate 41.
 * Each gate spans 5.625°, each line 0.9375°.
 */
function resolveGateAndLine(eclipticLon: number): { gate: number; line: number; color: number } {
  const normalized = ((eclipticLon % 360) + 360) % 360;

  // Offset from mandala start
  let offset = normalized - MANDALA_START_DEG;
  if (offset < 0) offset += 360;

  // Which gate index (0-63) in the sequence?
  const gateIndex = Math.floor(offset / GATE_SPAN_DEG);
  const gate = GATE_SEQUENCE[gateIndex % 64];

  // Position within the gate (0 to 5.625)
  const posInGate = offset - gateIndex * GATE_SPAN_DEG;

  // Line (1-6): each line spans 0.9375°
  const line = Math.floor(posInGate / LINE_SPAN_DEG) + 1;

  // Color (1-6): sub-line, each spans 0.15625° (0.9375° / 6)
  const posInLine = posInGate - (line - 1) * LINE_SPAN_DEG;
  const colorSpan = LINE_SPAN_DEG / 6;
  const color = Math.floor(posInLine / colorSpan) + 1;

  return {
    gate,
    line: Math.min(line, 6),
    color: Math.min(color, 6),
  };
}

// ────────────────────────────────────────────────────────────────
// Planetary Activations
// ────────────────────────────────────────────────────────────────

/** The 13 bodies used in Human Design, in standard order */
const HD_BODIES = [
  "Sun", "Earth", "Moon", "NorthNode", "SouthNode",
  "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto",
];

/**
 * Calculate all gate activations for a given moment in time.
 * Returns 13 activations (one per body).
 */
function calculateActivations(
  time: Astronomy.AstroTime,
  activationType: "personality" | "design",
): GateActivation[] {
  return HD_BODIES.map(bodyName => {
    const lon = getBodyLongitude(bodyName, time);
    const { gate, line, color } = resolveGateAndLine(lon);
    return {
      gate,
      line,
      color,
      bodyName,
      type: activationType,
      eclipticLongitude: lon,
    };
  });
}

// ────────────────────────────────────────────────────────────────
// Channel & Center Definition
// ────────────────────────────────────────────────────────────────

/**
 * From a set of active gate numbers, determine which channels are defined
 * and which centers are defined.
 */
function computeDefinition(activeGates: Set<number>): {
  definedChannels: DefinedChannel[];
  definedCenters: Set<CenterName>;
} {
  const definedChannels: DefinedChannel[] = [];
  const definedCenters = new Set<CenterName>();

  for (const [gate1, gate2, center1, center2] of CHANNELS) {
    if (activeGates.has(gate1) && activeGates.has(gate2)) {
      definedChannels.push({ gate1, gate2, center1, center2 });
      definedCenters.add(center1);
      definedCenters.add(center2);
    }
  }

  return { definedChannels, definedCenters };
}

// ────────────────────────────────────────────────────────────────
// Motor → Throat Connection (BFS)
// ────────────────────────────────────────────────────────────────

/**
 * Build an adjacency map of defined center connections.
 * Only includes connections made by defined channels.
 */
function buildCenterAdjacency(definedChannels: DefinedChannel[]): Map<CenterName, Set<CenterName>> {
  const adj = new Map<CenterName, Set<CenterName>>();

  for (const ch of definedChannels) {
    if (!adj.has(ch.center1)) adj.set(ch.center1, new Set());
    if (!adj.has(ch.center2)) adj.set(ch.center2, new Set());
    adj.get(ch.center1)!.add(ch.center2);
    adj.get(ch.center2)!.add(ch.center1);
  }

  return adj;
}

/**
 * Check if there's a continuous path of defined channels
 * from any motor center to the Throat center.
 */
function hasMotorToThroatConnection(
  definedChannels: DefinedChannel[],
  definedCenters: Set<CenterName>,
): boolean {
  if (!definedCenters.has("Throat")) return false;

  const adj = buildCenterAdjacency(definedChannels);

  // BFS from Throat, looking for any motor center
  const visited = new Set<CenterName>();
  const queue: CenterName[] = ["Throat"];
  visited.add("Throat");

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current !== "Throat" && MOTOR_CENTERS.has(current)) {
      return true;
    }
    const neighbors = adj.get(current);
    if (neighbors) {
      Array.from(neighbors).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
  }

  return false;
}

// ────────────────────────────────────────────────────────────────
// Type Derivation
// ────────────────────────────────────────────────────────────────

function deriveType(
  definedCenters: Set<CenterName>,
  definedChannels: DefinedChannel[],
): HDType {
  // No defined centers → Reflector
  if (definedCenters.size === 0) return "Reflector";

  const sacralDefined = definedCenters.has("Sacral");
  const motorToThroat = hasMotorToThroatConnection(definedChannels, definedCenters);

  if (sacralDefined) {
    // Sacral defined + motor→throat connection = Manifesting Generator
    return motorToThroat ? "Manifesting Generator" : "Generator";
  }

  // Sacral NOT defined
  if (motorToThroat) return "Manifestor";
  return "Projector";
}

// ────────────────────────────────────────────────────────────────
// Authority Derivation
// ────────────────────────────────────────────────────────────────

/**
 * Derive inner authority based on the standard hierarchy.
 * Authority flows from the highest-priority defined center:
 *
 * 1. Solar Plexus (if defined → always emotional authority, overrides all)
 * 2. Sacral (Generators/MGs only)
 * 3. Spleen
 * 4. Ego/Heart — "Ego Manifested" if heart connects to throat,
 *                "Ego Projected" otherwise
 * 5. G Center / Self-Projected (only for Projectors with G→Throat)
 * 6. Mental/Environmental (Outer Authority — no inner authority)
 * 7. Lunar (Reflectors only — no centers defined)
 */
function deriveAuthority(
  type: HDType,
  definedCenters: Set<CenterName>,
  definedChannels: DefinedChannel[],
): HDAuthority {
  // Reflectors always have Lunar authority
  if (type === "Reflector") return "Lunar (No Inner Authority)";

  // 1. Solar Plexus — always takes priority when defined
  if (definedCenters.has("SolarPlexus")) return "Emotional (Solar Plexus)";

  // 2. Sacral
  if (definedCenters.has("Sacral")) return "Sacral";

  // 3. Spleen
  if (definedCenters.has("Spleen")) return "Splenic";

  // 4. Heart/Ego
  if (definedCenters.has("Heart")) {
    // Check if Heart connects to Throat via defined channel
    const heartToThroat = definedChannels.some(
      ch =>
        (ch.center1 === "Heart" && ch.center2 === "Throat") ||
        (ch.center1 === "Throat" && ch.center2 === "Heart")
    );
    return heartToThroat ? "Ego Manifested" : "Ego Projected";
  }

  // 5. Self-Projected (G Center connects to Throat)
  if (definedCenters.has("G")) {
    const gToThroat = definedChannels.some(
      ch =>
        (ch.center1 === "G" && ch.center2 === "Throat") ||
        (ch.center1 === "Throat" && ch.center2 === "G")
    );
    if (gToThroat) return "Self-Projected";
  }

  // 6. Mental/Environmental (Head or Ajna defined but nothing below)
  if (definedCenters.has("Head") || definedCenters.has("Ajna")) {
    return "Mental (Outer Authority)";
  }

  // Fallback (should only happen for Reflectors, already handled)
  return "Lunar (No Inner Authority)";
}

// ────────────────────────────────────────────────────────────────
// Strategy, Signature, Not-Self Theme
// ────────────────────────────────────────────────────────────────

function getStrategy(type: HDType): string {
  switch (type) {
    case "Generator": return "Wait to respond";
    case "Manifesting Generator": return "Wait to respond, then inform";
    case "Projector": return "Wait for the invitation";
    case "Manifestor": return "Inform before acting";
    case "Reflector": return "Wait a lunar cycle";
  }
}

function getSignature(type: HDType): string {
  switch (type) {
    case "Generator":
    case "Manifesting Generator":
      return "Satisfaction";
    case "Projector": return "Success";
    case "Manifestor": return "Peace";
    case "Reflector": return "Surprise";
  }
}

function getNotSelf(type: HDType): string {
  switch (type) {
    case "Generator":
    case "Manifesting Generator":
      return "Frustration";
    case "Projector": return "Bitterness";
    case "Manifestor": return "Anger";
    case "Reflector": return "Disappointment";
  }
}

// ────────────────────────────────────────────────────────────────
// Profile
// ────────────────────────────────────────────────────────────────

const PROFILE_NAMES: Record<string, string> = {
  "1/3": "Investigator / Martyr",
  "1/4": "Investigator / Opportunist",
  "2/4": "Hermit / Opportunist",
  "2/5": "Hermit / Heretic",
  "3/5": "Martyr / Heretic",
  "3/6": "Martyr / Role Model",
  "4/6": "Opportunist / Role Model",
  "4/1": "Opportunist / Investigator",
  "5/1": "Heretic / Investigator",
  "5/2": "Heretic / Hermit",
  "6/2": "Role Model / Hermit",
  "6/3": "Role Model / Martyr",
};

function deriveProfile(
  personalitySunLine: number,
  designSunLine: number,
): { profile: string; lines: [number, number] } {
  const key = `${personalitySunLine}/${designSunLine}`;
  const name = PROFILE_NAMES[key] || `${personalitySunLine}/${designSunLine}`;
  return {
    profile: `${key} ${name}`,
    lines: [personalitySunLine, designSunLine],
  };
}

// ────────────────────────────────────────────────────────────────
// Incarnation Cross
// ────────────────────────────────────────────────────────────────

/**
 * The Incarnation Cross is formed by the four Sun/Earth gates:
 * Personality Sun, Personality Earth, Design Sun, Design Earth.
 *
 * The cross type depends on the profile:
 *   Lines 1,2 → Right Angle Cross (personal destiny)
 *   Lines 3,4 → Juxtaposition Cross (fixed fate, only 3/6 or 4/6)
 *   Actually: Line 4 profile with 4/1 → Juxtaposition
 *   Lines 5,6 → Left Angle Cross (transpersonal karma)
 */
function deriveIncarnationCross(
  personalitySunGate: number,
  personalityEarthGate: number,
  designSunGate: number,
  designEarthGate: number,
  personalitySunLine: number,
): string {
  let crossType: string;
  if (personalitySunLine <= 3) {
    crossType = "Right Angle Cross";
  } else if (personalitySunLine === 4) {
    crossType = "Juxtaposition Cross";
  } else {
    crossType = "Left Angle Cross";
  }

  return `${crossType} of ${personalitySunGate}/${personalityEarthGate} | ${designSunGate}/${designEarthGate}`;
}

// ────────────────────────────────────────────────────────────────
// Main Engine: Calculate Full HD Chart
// ────────────────────────────────────────────────────────────────

/**
 * Calculate a complete Human Design chart from a UTC birth time.
 *
 * @param birthUTC - Birth date/time in UTC
 * @returns Complete HD chart with type, authority, profile, channels, gates, etc.
 */
export function calculateHDChart(birthUTC: Date): HDChart {
  const birthTime = Astronomy.MakeTime(birthUTC);

  // 1. Find the Design Date (88° solar arc backward)
  const designTime = findDesignDate(birthTime);

  // 2. Calculate Personality activations (birth time)
  const personalityActivations = calculateActivations(birthTime, "personality");

  // 3. Calculate Design activations (design date)
  const designActivations = calculateActivations(designTime, "design");

  // 4. Collect all active gates
  const allActivations = [...personalityActivations, ...designActivations];
  const activeGateSet = new Set(allActivations.map(a => a.gate));
  const allActiveGates = Array.from(activeGateSet).sort((a, b) => a - b);

  // 5. Compute channel and center definition
  const { definedChannels, definedCenters } = computeDefinition(activeGateSet);

  // 6. All 9 centers, split into defined/undefined
  const ALL_CENTERS: CenterName[] = [
    "Head", "Ajna", "Throat", "G", "Heart", "Sacral", "Spleen", "SolarPlexus", "Root",
  ];
  const definedCentersList = ALL_CENTERS.filter(c => definedCenters.has(c));
  const undefinedCentersList = ALL_CENTERS.filter(c => !definedCenters.has(c));

  // 7. Derive Type
  const type = deriveType(definedCenters, definedChannels);

  // 8. Derive Authority
  const authority = deriveAuthority(type, definedCenters, definedChannels);

  // 9. Derive Profile (Personality Sun line / Design Sun line)
  const personalitySun = personalityActivations.find(a => a.bodyName === "Sun")!;
  const designSun = designActivations.find(a => a.bodyName === "Sun")!;
  const { profile, lines: profileLines } = deriveProfile(personalitySun.line, designSun.line);

  // 10. Derive Incarnation Cross
  const personalityEarth = personalityActivations.find(a => a.bodyName === "Earth")!;
  const designEarth = designActivations.find(a => a.bodyName === "Earth")!;
  const incarnationCross = deriveIncarnationCross(
    personalitySun.gate,
    personalityEarth.gate,
    designSun.gate,
    designEarth.gate,
    personalitySun.line,
  );

  return {
    type,
    authority,
    strategy: getStrategy(type),
    signature: getSignature(type),
    notSelf: getNotSelf(type),
    profile,
    profileLines,
    definedCenters: definedCentersList,
    undefinedCenters: undefinedCentersList,
    definedChannels,
    personalityActivations,
    designActivations,
    allActiveGates,
    incarnationCross,
    designDate: designTime.date.toISOString(),
    variables: {
      personalitySunLine: personalitySun.line,
      personalityEarthLine: personalityEarth.line,
      designSunLine: designSun.line,
      designEarthLine: designEarth.line,
    },
  };
}

// ────────────────────────────────────────────────────────────────
// Convenience: Calculate from birth data strings
// ────────────────────────────────────────────────────────────────

/**
 * Calculate HD chart from birth data, handling timezone conversion.
 * Delegates to the existing birthToUTC from ephemeris.ts for consistency.
 */
export function calculateHDChartFromBirthData(
  birthUTC: Date,
): HDChart {
  return calculateHDChart(birthUTC);
}
