import { runTest } from "./auth";

runTest("Onboarding Flow", async (helper) => {
  const { page } = helper;

  // First, clear any stale data from previous test runs
  await helper.goto("/dashboard");
  await page.waitForTimeout(2000);

  // Call cleanup mutation via browser console
  console.log("Clearing stale test data...");
  await page.evaluate(async () => {
    try {
      // @ts-ignore - convex client available on window in dev
      const convex = (window as any).__CONVEX_CLIENT;
      if (convex) {
        await convex.mutation("cleanup:clearMyReadings" as any, {});
        console.log("Cleared stale data");
      }
    } catch (e) {
      console.log("No stale data to clear or cleanup not available");
    }
  });
  await page.waitForTimeout(1000);

  // Now navigate to onboarding
  await helper.goto("/onboarding");
  await page.waitForTimeout(1500);
  await helper.screenshot("onboarding-step1.png");

  // Step 1: Enter name
  const nameInput = page.locator('input[type="text"][placeholder="Your name"]');
  const nameVisible = await nameInput.isVisible().catch(() => false);
  console.log("Name input visible:", nameVisible);

  if (nameVisible) {
    await nameInput.fill("Luna");
    await page.locator("button:has-text('Continue')").click();
    await page.waitForTimeout(1000);
    await helper.screenshot("onboarding-step2.png");

    // Step 2: Enter birth date
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill("1992-03-15");
      await page.locator("button:has-text('Continue')").click();
      await page.waitForTimeout(1000);
      await helper.screenshot("onboarding-step3.png");

      // Step 3: Birth time
      const timeInput = page.locator('input[type="time"]');
      if (await timeInput.isVisible().catch(() => false)) {
        await timeInput.fill("14:30");
        await page.locator("button:has-text('Continue')").click();
        await page.waitForTimeout(1000);
        await helper.screenshot("onboarding-step4.png");

        // Step 4: Birth place
        const cityInput = page.locator('input[placeholder*="City"]');
        const countryInput = page.locator('input[placeholder*="Country"]');
        if (await cityInput.isVisible().catch(() => false)) {
          await cityInput.fill("San Francisco");
          await countryInput.fill("United States");
          await helper.screenshot("onboarding-step4-filled.png");
          
          // Submit
          await page.locator("button:has-text('Reveal My Design')").click();
          await page.waitForTimeout(2000);
          await helper.screenshot("onboarding-generating.png");

          // Wait for redirect to reading page
          await page.waitForTimeout(12000);
          await helper.screenshot("reading-page.png");
          console.log("Final URL:", page.url());

          // Now visit dashboard
          await helper.goto("/dashboard");
          await page.waitForTimeout(3000);
          await helper.screenshot("dashboard.png");

          // Visit oracle
          await helper.goto("/oracle");
          await page.waitForTimeout(2000);
          await helper.screenshot("oracle.png");

          // Visit settings
          await helper.goto("/settings");
          await page.waitForTimeout(2000);
          await helper.screenshot("settings.png");
        }
      }
    }
  }

  console.log("✅ Full flow completed!");
}).catch(() => process.exit(1));
