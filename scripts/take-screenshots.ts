import { runTest } from "./auth";

runTest("Take Screenshots", async (helper) => {
  const { page } = helper;

  // Set viewport for good screenshots
  await page.setViewportSize({ width: 1280, height: 900 });

  // Dashboard
  await helper.goto("/dashboard");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-dashboard.png", fullPage: false });
  console.log("✓ Dashboard screenshot");

  // Blueprint page
  await helper.goto("/blueprint");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-blueprint.png", fullPage: true });
  console.log("✓ Blueprint screenshot");

  // Life Purpose page
  await helper.goto("/purpose");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-purpose.png", fullPage: true });
  console.log("✓ Life Purpose screenshot");

  // Transits page
  await helper.goto("/transits");
  await page.waitForTimeout(5000); // Wait for action to complete
  await page.screenshot({ path: "tmp/screenshot-transits.png", fullPage: true });
  console.log("✓ Transits screenshot");

  // Progressions page
  await helper.goto("/progressions");
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "tmp/screenshot-progressions.png", fullPage: true });
  console.log("✓ Progressions screenshot");

  // Oracle page
  await helper.goto("/oracle");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshot-oracle.png", fullPage: false });
  console.log("✓ Oracle screenshot");

  console.log("\n✅ All screenshots taken!");
});
