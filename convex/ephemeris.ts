/**
 * Astronomical Calculation Engine for Inner Pearl
 * 
 * Uses astronomy-engine (Don Cross) — pure JS implementation based on
 * VSOP87 (planets) and ELP2000 (Moon) theories aligned with NASA JPL DE431.
 * Provides Swiss Ephemeris-grade accuracy for natal chart calculations.
 * 
 * All positions are geocentric, tropical zodiac, apparent (of-date).
 * House system: Placidus (with Whole Sign fallback at extreme latitudes).
 */

import * as Astronomy from "astronomy-engine";

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

export const MODALITIES: Record<string, string> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
};

// Planet names: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
const OBLIQUITY_J2000 = 23.4393; // Mean obliquity at J2000, degrees

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface PlanetPosition {
  sign: string;
  degree: number;       // 0-360 ecliptic longitude
  degreeInSign: number; // 0-30 within sign
  house: number;        // 1-12
}

export interface NatalChart {
  // Luminaries
  sun: PlanetPosition;
  moon: PlanetPosition;
  // Personal planets
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  // Social planets
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  // Outer planets
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  // Angles
  ascendant: { sign: string; degree: number; degreeInSign: number };
  midheaven: { sign: string; degree: number; degreeInSign: number };
  // Lunar nodes
  northNode: PlanetPosition;
  southNode: PlanetPosition;
  // Houses (cusps[1] through cusps[12], each is ecliptic degree)
  houses: number[];
  houseSystem: "placidus" | "whole_sign";
  // Raw data for DB storage
  fullChartJson: string;
}

export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectAngle: number;
  orb: number;
  applying: boolean;
}

export interface TransitChart {
  currentPositions: Record<string, PlanetPosition>;
  aspects: TransitAspect[];
  date: string;
}

export interface ProgressedChart {
  progressedSun: { sign: string; degree: number };
  progressedMoon: { sign: string; degree: number };
  progressedAscendant?: { sign: string; degree: number };
  yearsProgressed: number;
}

// ────────────────────────────────────────────────────────────────
// Core Astronomical Functions
// ────────────────────────────────────────────────────────────────

/** Convert ecliptic longitude (0-360°) to zodiac sign */
export function signFromDegree(lon: number): string {
  const normalized = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
}

/** Get degree within sign (0-30) */
export function degreeInSign(lon: number): number {
  const normalized = ((lon % 360) + 360) % 360;
  return normalized % 30;
}

/** Get sign index (0-11) from ecliptic longitude */
function signIndex(lon: number): number {
  const normalized = ((lon % 360) + 360) % 360;
  return Math.floor(normalized / 30);
}

/**
 * Get geocentric apparent ecliptic longitude of any celestial body.
 * Uses Equator(ofdate=true, aberration=true) → manual ecliptic conversion.
 * This gives the tropical zodiac position as seen from Earth.
 */
function getApparentLongitude(
  body: string,
  time: Astronomy.AstroTime,
): number {
  // Sun and Moon have dedicated high-accuracy functions
  if (body === "Sun") {
    return Astronomy.SunPosition(time).elon;
  }
  if (body === "Moon") {
    return Astronomy.EclipticGeoMoon(time).lon;
  }

  // For planets: geocentric equatorial (of-date, with aberration) → ecliptic
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(
    body as Astronomy.Body,
    time,
    observer,
    true,  // ofdate: coordinates of the date (includes precession)
    true,  // aberration: include annual aberration
  );

  // Convert equatorial RA/Dec to ecliptic longitude
  // When on the ecliptic (β≈0): tan(α) = cos(ε) × tan(λ)
  // Inverted: λ = atan2(sin(α), cos(α) × cos(ε))
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const raRad = eq.ra * 15 * Math.PI / 180; // RA is in hours → degrees → radians
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
function getMeanNorthNode(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525; // Julian centuries from J2000.0
  let omega = 125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T * T
    + T * T * T / 467441
    - T * T * T * T / 60616000;
  return ((omega % 360) + 360) % 360;
}

// ────────────────────────────────────────────────────────────────
// House Systems
// ────────────────────────────────────────────────────────────────

/**
 * Calculate the MC (Medium Coeli / Midheaven) from RAMC and obliquity.
 */
function calculateMC(ramcDeg: number): number {
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const ramcRad = ramcDeg * Math.PI / 180;
  let mc = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(oblRad)) * 180 / Math.PI;
  if (mc < 0) mc += 360;
  return mc;
}

/**
 * Calculate the Ascendant from RAMC, geographic latitude, and obliquity.
 */
function calculateASC(ramcDeg: number, latDeg: number): number {
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const ramcRad = ramcDeg * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;

  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  if (asc < 0) asc += 360;
  return asc;
}

/**
 * Convert Right Ascension to ecliptic longitude (for a point on the ecliptic, β=0).
 */
function raToEclipticLon(raDeg: number): number {
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const raRad = (raDeg * Math.PI) / 180;
  let lon = Math.atan2(Math.sin(raRad), Math.cos(raRad) * Math.cos(oblRad)) * 180 / Math.PI;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Get the declination of a point on the ecliptic at a given longitude.
 */
function eclipticDeclination(lonDeg: number): number {
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  return Math.asin(Math.sin(oblRad) * Math.sin(lonDeg * Math.PI / 180));
}

/**
 * Calculate Placidus intermediate house cusp using iterative semi-arc method.
 * @param ramc - Right Ascension of MC in degrees
 * @param latDeg - Geographic latitude in degrees
 * @param fraction - 1/3 or 2/3 of the semi-arc
 * @param isUpperEast - true for cusps 11,12 (MC→ASC); false for cusps 2,3 (ASC→IC)
 */
function placidusIntermediate(
  ramc: number,
  latDeg: number,
  fraction: number,
  isUpperEast: boolean,
): number {
  const latRad = latDeg * Math.PI / 180;

  // Initial guess using equal house spacing
  let targetRA = isUpperEast
    ? ramc + fraction * 90
    : ramc + 180 + fraction * 90;

  for (let i = 0; i < 50; i++) {
    // Convert RA to ecliptic longitude
    const lon = raToEclipticLon(targetRA % 360);

    // Get declination of this ecliptic point
    const decl = eclipticDeclination(lon);

    // Diurnal semi-arc: cos(DSA) = -tan(φ) × tan(δ)
    const tanProduct = -Math.tan(latRad) * Math.tan(decl);
    if (Math.abs(tanProduct) >= 1) {
      // Circumpolar or never-rises — can't compute Placidus cusp
      return lon; // Return current estimate
    }
    const dsa = Math.acos(tanProduct) * 180 / Math.PI; // degrees

    // New target RA based on Placidus semi-arc division
    let newRA: number;
    if (isUpperEast) {
      newRA = ramc + fraction * dsa;
    } else {
      const nsa = 180 - dsa; // Nocturnal semi-arc
      newRA = ramc + 180 + fraction * nsa;
    }

    if (Math.abs(newRA - targetRA) < 0.001) break;
    targetRA = newRA;
  }

  return raToEclipticLon(targetRA % 360);
}

/**
 * Calculate Placidus house cusps.
 * Falls back to Whole Sign houses at latitudes > 60° where Placidus fails.
 */
function calculatePlacidusHouses(ramcDeg: number, latDeg: number): {
  cusps: number[];
  system: "placidus" | "whole_sign";
} {
  // At extreme latitudes (>60°), Placidus can fail (circumpolar issues)
  if (Math.abs(latDeg) > 60) {
    const asc = calculateASC(ramcDeg, latDeg);
    return {
      cusps: wholeSignHouses(asc),
      system: "whole_sign",
    };
  }

  const mc = calculateMC(ramcDeg);
  const asc = calculateASC(ramcDeg, latDeg);

  const cusps = new Array(13).fill(0);
  cusps[1] = asc;
  cusps[4] = (mc + 180) % 360;
  cusps[7] = (asc + 180) % 360;
  cusps[10] = mc;

  // Intermediate cusps (iterative Placidus)
  cusps[11] = placidusIntermediate(ramcDeg, latDeg, 1 / 3, true);
  cusps[12] = placidusIntermediate(ramcDeg, latDeg, 2 / 3, true);
  cusps[2] = placidusIntermediate(ramcDeg, latDeg, 1 / 3, false);
  cusps[3] = placidusIntermediate(ramcDeg, latDeg, 2 / 3, false);

  // Opposite houses
  cusps[5] = (cusps[11] + 180) % 360;
  cusps[6] = (cusps[12] + 180) % 360;
  cusps[8] = (cusps[2] + 180) % 360;
  cusps[9] = (cusps[3] + 180) % 360;

  return { cusps, system: "placidus" };
}

/**
 * Whole Sign house system: each house = one full sign, starting from ASC's sign.
 */
function wholeSignHouses(ascDeg: number): number[] {
  const ascSignIdx = signIndex(ascDeg);
  const cusps = new Array(13).fill(0);
  for (let i = 1; i <= 12; i++) {
    cusps[i] = ((ascSignIdx + i - 1) % 12) * 30;
  }
  return cusps;
}

/**
 * Determine which house a planet is in, given house cusps.
 */
function getHouse(planetDeg: number, cusps: number[]): number {
  const p = ((planetDeg % 360) + 360) % 360;
  for (let h = 1; h <= 12; h++) {
    const start = cusps[h];
    const end = cusps[h === 12 ? 1 : h + 1];
    if (start <= end) {
      if (p >= start && p < end) return h;
    } else {
      // Wraps around 360°
      if (p >= start || p < end) return h;
    }
  }
  return 1; // Fallback
}

// ────────────────────────────────────────────────────────────────
// Geocoding & Timezone
// ────────────────────────────────────────────────────────────────

/**
 * Geocode a city name to coordinates using OpenStreetMap Nominatim.
 */
export async function geocodeCity(
  city: string,
  country?: string,
): Promise<{ lat: number; lng: number } | null> {
  const query = country ? `${city}, ${country}` : city;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "InnerPearl/1.0 (contact@innerpearl.ai)" },
    });
    if (!response.ok) return null;
    const results: any[] = await response.json();
    if (!results.length) return null;
    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}

/**
 * Get IANA timezone from coordinates using TimeAPI.
 * Falls back to longitude-based estimation.
 */
export async function getTimezone(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lng}`;
    const response = await fetch(url);
    if (response.ok) {
      const data: any = await response.json();
      if (data.timeZone) return data.timeZone;
    }
  } catch {
    // Fall through to approximation
  }

  // Fallback: rough longitude-based estimate
  const offsetHours = Math.round(lng / 15);
  // Etc/GMT zones have inverted signs (IANA convention)
  return `Etc/GMT${offsetHours <= 0 ? "+" : "-"}${Math.abs(offsetHours)}`;
}

/**
 * Convert local birth date+time in a given timezone to UTC Date.
 * Uses Intl.DateTimeFormat for proper historical timezone handling.
 */
export function birthToUTC(
  dateStr: string,
  timeStr: string | undefined,
  timezone: string,
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = (timeStr || "12:00").split(":").map(Number);

  // Create a provisional date treated as UTC
  const provisional = new Date(Date.UTC(year, month - 1, day, hour, minute));

  try {
    // Find the timezone offset by comparing formatted representations
    const utcStr = provisional.toLocaleString("en-US", { timeZone: "UTC", hour12: false });
    const localStr = provisional.toLocaleString("en-US", { timeZone: timezone, hour12: false });
    const utcParsed = new Date(utcStr);
    const localParsed = new Date(localStr);
    const offsetMs = localParsed.getTime() - utcParsed.getTime();

    // Real UTC = local time - offset
    return new Date(provisional.getTime() - offsetMs);
  } catch {
    // If timezone lookup fails, treat as UTC
    return provisional;
  }
}

// ────────────────────────────────────────────────────────────────
// Natal Chart Calculation
// ────────────────────────────────────────────────────────────────

/**
 * Calculate a complete natal chart from birth data.
 * This is the core function — produces all planetary positions, angles, and houses.
 */
export async function calculateNatalChart(
  birthDate: string,
  birthTime: string | undefined,
  birthCity: string,
  birthCountry: string,
): Promise<NatalChart> {
  // 1. Geocode the birth location
  const coords = await geocodeCity(birthCity, birthCountry);
  const lat = coords?.lat ?? 0;
  const lng = coords?.lng ?? 0;

  // 2. Resolve timezone and convert to UTC
  const timezone = await getTimezone(lat, lng);
  const utcDate = birthToUTC(birthDate, birthTime, timezone);
  const time = Astronomy.MakeTime(utcDate);

  // 3. Calculate RAMC (Right Ascension of MC) from Local Sidereal Time
  const gast = Astronomy.SiderealTime(time);
  const lst = ((gast + lng / 15) % 24 + 24) % 24;
  const ramcDeg = lst * 15;

  // 4. Calculate house cusps
  const { cusps, system: houseSystem } = calculatePlacidusHouses(ramcDeg, lat);

  // Helper: create PlanetPosition from ecliptic longitude
  function makePosition(lon: number): PlanetPosition {
    const normalized = ((lon % 360) + 360) % 360;
    return {
      sign: signFromDegree(normalized),
      degree: normalized,
      degreeInSign: degreeInSign(normalized),
      house: getHouse(normalized, cusps),
    };
  }

  // 5. Calculate all planetary positions
  const sunLon = getApparentLongitude("Sun", time);
  const moonLon = getApparentLongitude("Moon", time);
  const mercuryLon = getApparentLongitude("Mercury", time);
  const venusLon = getApparentLongitude("Venus", time);
  const marsLon = getApparentLongitude("Mars", time);
  const jupiterLon = getApparentLongitude("Jupiter", time);
  const saturnLon = getApparentLongitude("Saturn", time);
  const uranusLon = getApparentLongitude("Uranus", time);
  const neptuneLon = getApparentLongitude("Neptune", time);
  const plutoLon = getApparentLongitude("Pluto", time);

  // 6. Angles
  const mc = calculateMC(ramcDeg);
  const asc = calculateASC(ramcDeg, lat);

  // 7. Lunar nodes
  const northNodeLon = getMeanNorthNode(time);
  const southNodeLon = (northNodeLon + 180) % 360;

  const chart: NatalChart = {
    sun: makePosition(sunLon),
    moon: makePosition(moonLon),
    mercury: makePosition(mercuryLon),
    venus: makePosition(venusLon),
    mars: makePosition(marsLon),
    jupiter: makePosition(jupiterLon),
    saturn: makePosition(saturnLon),
    uranus: makePosition(uranusLon),
    neptune: makePosition(neptuneLon),
    pluto: makePosition(plutoLon),
    ascendant: {
      sign: signFromDegree(asc),
      degree: asc,
      degreeInSign: degreeInSign(asc),
    },
    midheaven: {
      sign: signFromDegree(mc),
      degree: mc,
      degreeInSign: degreeInSign(mc),
    },
    northNode: makePosition(northNodeLon),
    southNode: makePosition(southNodeLon),
    houses: cusps,
    houseSystem,
    fullChartJson: "", // Will be set after construction
  };

  chart.fullChartJson = JSON.stringify(chart);
  return chart;
}

// ────────────────────────────────────────────────────────────────
// Transit Chart
// ────────────────────────────────────────────────────────────────

const ASPECTS: { name: string; angle: number; orb: number }[] = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 4 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
];

// Tighter orbs for transits (vs natal aspects)
const TRANSIT_ORBS: Record<string, number> = {
  conjunction: 3,
  sextile: 2,
  square: 3,
  trine: 3,
  opposition: 3,
};

/**
 * Calculate transit chart: current planetary positions + aspects to natal chart.
 */
export function calculateTransitChart(
  natalChart: NatalChart,
  currentDate: Date = new Date(),
): TransitChart {
  const time = Astronomy.MakeTime(currentDate);
  const currentPositions: Record<string, PlanetPosition> = {};

  // Calculate current positions of all planets
  const bodies = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  for (const body of bodies) {
    const lon = getApparentLongitude(body, time);
    currentPositions[body.toLowerCase()] = {
      sign: signFromDegree(lon),
      degree: lon,
      degreeInSign: degreeInSign(lon),
      house: getHouse(lon, natalChart.houses),
    };
  }

  // Calculate aspects between transit planets and natal planets
  const aspects: TransitAspect[] = [];
  const natalBodies: [string, PlanetPosition][] = [
    ["sun", natalChart.sun],
    ["moon", natalChart.moon],
    ["mercury", natalChart.mercury],
    ["venus", natalChart.venus],
    ["mars", natalChart.mars],
    ["jupiter", natalChart.jupiter],
    ["saturn", natalChart.saturn],
    ["uranus", natalChart.uranus],
    ["neptune", natalChart.neptune],
    ["pluto", natalChart.pluto],
  ];

  for (const transitBody of bodies) {
    const transitLon = currentPositions[transitBody.toLowerCase()].degree;

    for (const [natalName, natalPos] of natalBodies) {
      const diff = Math.abs(transitLon - natalPos.degree);
      const shortArc = Math.min(diff, 360 - diff);

      for (const aspect of ASPECTS) {
        const orb = TRANSIT_ORBS[aspect.name] ?? aspect.orb;
        const deviation = Math.abs(shortArc - aspect.angle);
        if (deviation <= orb) {
          aspects.push({
            transitPlanet: transitBody,
            natalPlanet: natalName,
            aspect: aspect.name,
            aspectAngle: aspect.angle,
            orb: Math.round(deviation * 10) / 10,
            applying: false, // Would need velocity calculation for this
          });
        }
      }
    }
  }

  // Sort by orb (tightest aspects first)
  aspects.sort((a, b) => a.orb - b.orb);

  return {
    currentPositions,
    aspects,
    date: currentDate.toISOString().split("T")[0],
  };
}

// ────────────────────────────────────────────────────────────────
// Progressed Chart (Secondary Progressions)
// ────────────────────────────────────────────────────────────────

/**
 * Calculate secondary progressions: 1 day after birth = 1 year of life.
 * For someone born on Jan 1 2000, their 25th year progressions use
 * planetary positions from Jan 26, 2000.
 */
export async function calculateProgressedChart(
  birthDate: string,
  birthTime: string | undefined,
  birthCity: string,
  birthCountry: string,
  targetDate: Date = new Date(),
): Promise<ProgressedChart> {
  // Calculate years elapsed since birth
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay);
  const yearsElapsed = (targetDate.getTime() - birthDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  // Geocode and get timezone (same as natal)
  const coords = await geocodeCity(birthCity, birthCountry);
  const lat = coords?.lat ?? 0;
  const lng = coords?.lng ?? 0;
  const timezone = await getTimezone(lat, lng);
  const utcBirth = birthToUTC(birthDate, birthTime, timezone);

  // Progressed date = birth + yearsElapsed DAYS
  const progressedMs = utcBirth.getTime() + yearsElapsed * 24 * 60 * 60 * 1000;
  const progressedDate = new Date(progressedMs);
  const time = Astronomy.MakeTime(progressedDate);

  // Calculate progressed positions
  const sunLon = getApparentLongitude("Sun", time);
  const moonLon = getApparentLongitude("Moon", time);

  // Progressed Ascendant (using RAMC progression)
  const gast = Astronomy.SiderealTime(time);
  const lst = ((gast + lng / 15) % 24 + 24) % 24;
  const ramcDeg = lst * 15;
  const progAsc = calculateASC(ramcDeg, lat);

  return {
    progressedSun: { sign: signFromDegree(sunLon), degree: sunLon },
    progressedMoon: { sign: signFromDegree(moonLon), degree: moonLon },
    progressedAscendant: { sign: signFromDegree(progAsc), degree: progAsc },
    yearsProgressed: Math.round(yearsElapsed * 10) / 10,
  };
}

// ────────────────────────────────────────────────────────────────
// Natal Aspect Calculation
// ────────────────────────────────────────────────────────────────

export interface NatalAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
}

/**
 * Find all major aspects between planets in a natal chart.
 */
export function calculateNatalAspects(chart: NatalChart): NatalAspect[] {
  const bodies: [string, number][] = [
    ["sun", chart.sun.degree],
    ["moon", chart.moon.degree],
    ["mercury", chart.mercury.degree],
    ["venus", chart.venus.degree],
    ["mars", chart.mars.degree],
    ["jupiter", chart.jupiter.degree],
    ["saturn", chart.saturn.degree],
    ["uranus", chart.uranus.degree],
    ["neptune", chart.neptune.degree],
    ["pluto", chart.pluto.degree],
    ["ascendant", chart.ascendant.degree],
    ["midheaven", chart.midheaven.degree],
    ["northNode", chart.northNode.degree],
  ];

  const natalAspects: NatalAspect[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const [name1, lon1] = bodies[i];
      const [name2, lon2] = bodies[j];
      const diff = Math.abs(lon1 - lon2);
      const shortArc = Math.min(diff, 360 - diff);

      for (const aspect of ASPECTS) {
        const deviation = Math.abs(shortArc - aspect.angle);
        if (deviation <= aspect.orb) {
          natalAspects.push({
            planet1: name1,
            planet2: name2,
            aspect: aspect.name,
            orb: Math.round(deviation * 10) / 10,
          });
          break; // Only one aspect per pair
        }
      }
    }
  }

  return natalAspects.sort((a, b) => a.orb - b.orb);
}

// ────────────────────────────────────────────────────────────────
// Numerology (unchanged — purely mathematical, no ephemeris needed)
// ────────────────────────────────────────────────────────────────

export function calculateLifePath(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  let n = digits.reduce((a, b) => a + b, 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return n;
}

export const LIFE_PATH_MEANINGS: Record<number, string> = {
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
