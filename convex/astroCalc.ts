/**
 * Accurate astronomical calculations for natal chart signs.
 *
 * Uses the `astronomy-engine` library (VSOP87 / ELP/MPP02) for precise
 * planetary positions. No external API keys needed — all calculations
 * run locally with NASA-grade precision.
 */
import {
  MakeTime,
  SiderealTime,
  SunPosition,
  EclipticGeoMoon,
} from "astronomy-engine";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/**
 * Convert ecliptic longitude (0–360°) to zodiac sign name.
 */
function lonToSign(lonDeg: number): string {
  const idx = Math.floor(((lonDeg % 360) + 360) % 360 / 30);
  return SIGNS[idx];
}

// ────────────────────────────────────────────────────────────────
// Sun Sign — accurate ecliptic longitude
// ────────────────────────────────────────────────────────────────

/**
 * Build a UTC Date object from components.
 */
function utcDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
}

/**
 * Calculate the Sun's zodiac sign for a given UTC date/time.
 * More accurate than date-range lookup tables because it uses
 * the Sun's actual ecliptic longitude.
 */
export function getAccurateSunSign(
  year: number, month: number, day: number,
  hour: number = 12, minute: number = 0,
): string {
  const t = MakeTime(utcDate(year, month, day, hour, minute));
  const sunPos = SunPosition(t);  // geocentric ecliptic coordinates
  return lonToSign(sunPos.elon);
}

// ────────────────────────────────────────────────────────────────
// Moon Sign — accurate ecliptic longitude
// ────────────────────────────────────────────────────────────────

/**
 * Calculate the Moon's zodiac sign for a given UTC date/time.
 * The Moon moves ~13° per day and changes sign every ~2.3 days,
 * so even a few hours of timezone error rarely changes the result.
 */
export function getAccurateMoonSign(
  year: number, month: number, day: number,
  hour: number = 12, minute: number = 0,
): string {
  const t = MakeTime(utcDate(year, month, day, hour, minute));
  const moonPos = EclipticGeoMoon(t);  // geocentric ecliptic coordinates
  return lonToSign(moonPos.lon);
}

// ────────────────────────────────────────────────────────────────
// Rising Sign (Ascendant) — based on local sidereal time
// ────────────────────────────────────────────────────────────────

/**
 * Mean obliquity of the ecliptic for J2000.0 (~23.4393°).
 * Changes < 0.01° per decade — more than sufficient for sign-level accuracy.
 */
const OBLIQUITY_DEG = 23.4393;

/**
 * Calculate the Ascendant (Rising Sign) for a given UTC date/time
 * and geographic coordinates.
 *
 * Uses the standard formula:
 *   ASC = atan2(-cos(RAMC), sin(ε)·tan(φ) + cos(ε)·sin(RAMC))
 *
 * Where:
 *   RAMC = local sidereal time in degrees (Right Ascension of Medium Coeli)
 *   ε    = obliquity of the ecliptic
 *   φ    = geographic latitude
 */
export function getAscendant(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
): string {
  const t = MakeTime(utcDate(year, month, day, hour, minute));

  // Greenwich Apparent Sidereal Time in hours [0, 24)
  const gast = SiderealTime(t);

  // Local Sidereal Time = GAST + longitude / 15
  const lst = ((gast + lng / 15) % 24 + 24) % 24;

  // Convert to degrees and then radians
  const ramcRad = (lst * 15) * Math.PI / 180;
  const oblRad  = OBLIQUITY_DEG * Math.PI / 180;
  const latRad  = lat * Math.PI / 180;

  // Ascendant formula (atan2 with flipped signs for correct quadrant)
  let ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad)),
  );

  // atan2 returns [-π, π] — convert to [0, 360)
  let ascDeg = ascRad * 180 / Math.PI;
  if (ascDeg < 0) ascDeg += 360;

  return lonToSign(ascDeg);
}

// ────────────────────────────────────────────────────────────────
// Geocoding helper — city/country → lat/lng via Nominatim (OSM)
// ────────────────────────────────────────────────────────────────

/**
 * Geocode a city + country string to latitude/longitude using the
 * free OpenStreetMap Nominatim API. Returns null if lookup fails.
 */
export async function geocodeCity(
  city: string,
  country: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "InnerPearl/1.0 (contact@innerpearl.ai)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────
// Timezone estimation from longitude
// ────────────────────────────────────────────────────────────────

/**
 * Estimate UTC offset in hours from longitude (solar time approximation).
 * Accurate to ±1 hour for most locations. Good enough for moon sign
 * (which changes every ~2.3 days) and a reasonable approximation for
 * rising sign (which changes every ~2 hours).
 *
 * Future improvement: use a timezone database for exact offset.
 */
export function estimateUtcOffset(lng: number): number {
  return Math.round(lng / 15);
}
