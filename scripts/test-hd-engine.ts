/**
 * Test & Validation Script for the Human Design Calculation Engine
 *
 * Cross-validated against:
 *   - humandesignsystem.com (official Jovian Archive charts)
 *   - humandesignforsuccess.com
 *   - humandesignsystem.co
 *   - thatprojectorlife.com
 *
 * Usage: bun run --bun scripts/test-hd-engine.ts
 */

import { calculateHDChart, type HDChart } from "../convex/humandesign";

// ────────────────────────────────────────────────────────────────
// Test Cases — Verified against known HD chart sources
// ────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  source: string;
  birthUTC: Date;
  expected: {
    type: string;
    authority: string;
    profileLines: [number, number];
    personalitySunGate?: number;
    designSunGate?: number;
    someGates?: number[]; // Gate numbers that should appear
  };
}

const TEST_CASES: TestCase[] = [
  // ── Donald Trump ──
  // Born June 14, 1946, 10:54 AM EDT (UTC-4) = 14:54 UTC
  // Source: humandesignsystem.co — "1/3 Manifesting Generator, Emotional"
  // Cross: Right Angle Cross of Eden (12/11 | 36/6)
  {
    name: "Donald Trump",
    source: "humandesignsystem.co",
    birthUTC: new Date(Date.UTC(1946, 5, 14, 14, 54, 0)),
    expected: {
      type: "Manifesting Generator",
      authority: "Emotional (Solar Plexus)",
      profileLines: [1, 3],
      personalitySunGate: 12,
      designSunGate: 36,
      someGates: [6, 11, 12, 17, 18, 21, 26, 29, 32, 33, 35, 36, 45, 52, 53, 57, 59, 62],
    },
  },

  // ── Angelina Jolie ──
  // Born June 4, 1975, 9:09 AM PDT (UTC-7) = 16:09 UTC
  // Source: humandesignsystem.com (Jovian Archive PDF) — MG
  // Personality Sun 35.3, Design Sun 63.5
  // Channels: 21-45, 35-36, 20-34, 18-58
  {
    name: "Angelina Jolie",
    source: "humandesignsystem.com (Jovian Archive)",
    birthUTC: new Date(Date.UTC(1975, 5, 4, 16, 9, 0)),
    expected: {
      type: "Manifesting Generator",
      authority: "Emotional (Solar Plexus)",
      profileLines: [3, 5],
      personalitySunGate: 35,
      designSunGate: 63,
    },
  },

  // ── Barack Obama ──
  // Born August 4, 1961, 7:24 PM AHST (UTC-10) = 05:24 UTC on Aug 5
  // Source: humandesignsystem.com PDF + thatprojectorlife.com — Projector
  // Design date: May 5, 1961 07:08:54 GMT (ref) — my calc: 07:08:35
  {
    name: "Barack Obama",
    source: "humandesignsystem.com + thatprojectorlife.com",
    birthUTC: new Date(Date.UTC(1961, 7, 5, 5, 24, 0)),
    expected: {
      type: "Projector",
      authority: "Emotional (Solar Plexus)",
      profileLines: [6, 2],
      personalitySunGate: 33,
      designSunGate: 2,
    },
  },

  // ── Oprah Winfrey ──
  // Born January 29, 1954, 4:30 AM CST (UTC-6) = 10:30 UTC
  // Source: humandesignforsuccess.com — Generator
  // Channels include: 29-46, 34-57, 19-49
  {
    name: "Oprah Winfrey",
    source: "humandesignforsuccess.com",
    birthUTC: new Date(Date.UTC(1954, 0, 29, 10, 30, 0)),
    expected: {
      type: "Generator",
      authority: "Emotional (Solar Plexus)",
      profileLines: [2, 4],
      personalitySunGate: 19,
      someGates: [19, 29, 34, 46, 49, 57],
    },
  },

  // ── Princess Diana ──
  // Born July 1, 1961, 7:45 PM WET/S (UTC+1) = 18:45 UTC
  // Source: humandesignsystem.com PDF + YouTube — 1/3 Emotional Projector
  // Design date: April 1, 1961 15:23:58 GMT (ref)
  {
    name: "Princess Diana",
    source: "humandesignsystem.com + YouTube",
    birthUTC: new Date(Date.UTC(1961, 6, 1, 18, 45, 0)),
    expected: {
      type: "Projector",
      authority: "Emotional (Solar Plexus)",
      profileLines: [1, 3],
      personalitySunGate: 39,
    },
  },

  // ── Ra Uru Hu (HD Founder) ──
  // Born April 9, 1948, Montreal, Canada
  // Birth time uncertain. Using 12:30 PM local (EDT UTC-4) = 16:30 UTC as estimate
  // Source: flowwithhumandesign.com — Manifestor, 5/1, Splenic
  // Note: engine may differ on authority/profile due to birth time uncertainty
  {
    name: "Ra Uru Hu (birth time approximate)",
    source: "flowwithhumandesign.com",
    birthUTC: new Date(Date.UTC(1948, 3, 9, 16, 30, 0)),
    expected: {
      type: "Manifestor",
      authority: "Splenic", // may differ due to birth time uncertainty
      profileLines: [5, 1], // may differ due to birth time uncertainty
      personalitySunGate: 51,
    },
  },
];

// ────────────────────────────────────────────────────────────────
// Test Runner
// ────────────────────────────────────────────────────────────────

function printChart(chart: HDChart): void {
  console.log(`  Type:        ${chart.type}`);
  console.log(`  Authority:   ${chart.authority}`);
  console.log(`  Profile:     ${chart.profile}`);
  console.log(`  Strategy:    ${chart.strategy}`);
  console.log(`  Cross:       ${chart.incarnationCross}`);
  console.log(`  Design Date: ${chart.designDate}`);
  console.log(`  Defined:     ${chart.definedCenters.join(", ") || "(none)"}`);
  console.log(`  Undefined:   ${chart.undefinedCenters.join(", ") || "(none)"}`);
  console.log(`  Channels:    ${chart.definedChannels.map(c => `${c.gate1}-${c.gate2}`).join(", ") || "(none)"}`);
  console.log(`  Gates:       ${chart.allActiveGates.join(", ")}`);
  console.log(`  Personality:`);
  for (const a of chart.personalityActivations) {
    console.log(`    ${a.bodyName.padEnd(11)} → G${a.gate}.${a.line} (${a.eclipticLongitude.toFixed(3)}°)`);
  }
  console.log(`  Design:`);
  for (const a of chart.designActivations) {
    console.log(`    ${a.bodyName.padEnd(11)} → G${a.gate}.${a.line} (${a.eclipticLongitude.toFixed(3)}°)`);
  }
}

function runTests(): void {
  let passed = 0;
  let partialPass = 0;
  let failed = 0;
  const issues: string[] = [];

  console.log("═══════════════════════════════════════════════════");
  console.log("  Human Design Engine — Validation Suite");
  console.log("═══════════════════════════════════════════════════\n");

  for (const tc of TEST_CASES) {
    console.log(`▶ ${tc.name}`);
    console.log(`  Source: ${tc.source}`);
    console.log(`  Birth:  ${tc.birthUTC.toISOString()}`);

    try {
      const chart = calculateHDChart(tc.birthUTC);
      printChart(chart);

      const checks: { label: string; actual: string; expected: string; pass: boolean }[] = [];

      // Type check
      checks.push({
        label: "Type",
        actual: chart.type,
        expected: tc.expected.type,
        pass: chart.type === tc.expected.type,
      });

      // Authority check
      checks.push({
        label: "Authority",
        actual: chart.authority,
        expected: tc.expected.authority,
        pass: chart.authority.startsWith(tc.expected.authority.split(" ")[0]),
      });

      // Profile check
      checks.push({
        label: "Profile",
        actual: `${chart.profileLines[0]}/${chart.profileLines[1]}`,
        expected: `${tc.expected.profileLines[0]}/${tc.expected.profileLines[1]}`,
        pass:
          chart.profileLines[0] === tc.expected.profileLines[0] &&
          chart.profileLines[1] === tc.expected.profileLines[1],
      });

      // Personality Sun gate check
      if (tc.expected.personalitySunGate !== undefined) {
        const pSun = chart.personalityActivations.find(a => a.bodyName === "Sun");
        checks.push({
          label: "Personality Sun Gate",
          actual: String(pSun?.gate ?? "?"),
          expected: String(tc.expected.personalitySunGate),
          pass: pSun?.gate === tc.expected.personalitySunGate,
        });
      }

      // Design Sun gate check
      if (tc.expected.designSunGate !== undefined) {
        const dSun = chart.designActivations.find(a => a.bodyName === "Sun");
        checks.push({
          label: "Design Sun Gate",
          actual: String(dSun?.gate ?? "?"),
          expected: String(tc.expected.designSunGate),
          pass: dSun?.gate === tc.expected.designSunGate,
        });
      }

      // Gate presence check
      if (tc.expected.someGates) {
        const missing = tc.expected.someGates.filter(g => !chart.allActiveGates.includes(g));
        checks.push({
          label: "Required Gates",
          actual: `${tc.expected.someGates.length - missing.length}/${tc.expected.someGates.length} found`,
          expected: `${tc.expected.someGates.length}/${tc.expected.someGates.length}`,
          pass: missing.length === 0,
        });
        if (missing.length > 0) {
          console.log(`  ⚠️  Missing gates: ${missing.join(", ")}`);
        }
      }

      let totalChecks = checks.length;
      let passCount = 0;
      for (const check of checks) {
        const icon = check.pass ? "✅" : "❌";
        console.log(`  ${icon} ${check.label}: ${check.actual} ${check.pass ? "=" : "≠"} ${check.expected}`);
        if (check.pass) passCount++;
        else issues.push(`${tc.name}: ${check.label} — got ${check.actual}, expected ${check.expected}`);
      }

      if (passCount === totalChecks) passed++;
      else if (passCount >= totalChecks - 1) partialPass++;
      else failed++;
    } catch (e) {
      console.log(`  ❌ ERROR: ${e}`);
      issues.push(`${tc.name}: EXCEPTION — ${e}`);
      failed++;
    }

    console.log();
  }

  // Summary
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} full pass, ${partialPass} partial, ${failed} fail (${TEST_CASES.length} total)`);
  if (issues.length > 0) {
    console.log(`\n  Issues (${issues.length}):`);
    for (const f of issues) console.log(`    ⚠️  ${f}`);
  }
  console.log("═══════════════════════════════════════════════════");
}

runTests();
