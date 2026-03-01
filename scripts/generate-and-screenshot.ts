import { runTest } from "./auth";

runTest("Generate Data & Screenshots", async (helper) => {
  const { page } = helper;
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Go to Blueprint page — if "Generate" button shows, click it
  await helper.goto("/blueprint");
  await page.waitForTimeout(2000);

  const genBtn = page.locator("text=Generate Natal Chart");
  if (await genBtn.isVisible()) {
    console.log("Clicking Generate Natal Chart...");
    await genBtn.click();
    // Wait for generation to complete (it calls the ephemeris action)
    await page.waitForTimeout(15000);
    console.log("Generation complete, waiting for data to load...");
    await page.waitForTimeout(3000);
  }

  // Reload to see the generated data
  await helper.goto("/blueprint");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/screenshot-blueprint.png", fullPage: true });
  console.log("✓ Blueprint screenshot");

  // 2. Life Purpose page
  await helper.goto("/purpose");
  await page.waitForTimeout(3000);
  const genPurposeBtn = page.locator("text=Generate Life Purpose");
  if (await genPurposeBtn.isVisible()) {
    console.log("Life Purpose still needs generation — it should have been generated with Blueprint");
    // It should already exist since generateCosmicFingerprint creates both
    await page.waitForTimeout(3000);
  }
  await page.screenshot({ path: "tmp/screenshot-purpose.png", fullPage: true });
  console.log("✓ Life Purpose screenshot");

  // 3. Dashboard
  await helper.goto("/dashboard");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-dashboard.png", fullPage: false });
  console.log("✓ Dashboard screenshot");

  // 4. Transits
  await helper.goto("/transits");
  await page.waitForTimeout(6000); // Longer wait for action to complete
  await page.screenshot({ path: "tmp/screenshot-transits.png", fullPage: true });
  console.log("✓ Transits screenshot");

  // 5. Progressions
  await helper.goto("/progressions");
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "tmp/screenshot-progressions.png", fullPage: true });
  console.log("✓ Progressions screenshot");

  // 6. Oracle
  await helper.goto("/oracle");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-oracle.png", fullPage: false });
  console.log("✓ Oracle screenshot");

  console.log("\n✅ All screenshots taken!");
});
