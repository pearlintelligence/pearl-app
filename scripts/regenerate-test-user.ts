import { runTest } from "./auth";

runTest("Regenerate Test User Data", async (helper) => {
  const { page } = helper;

  // Navigate to dashboard where the "Generate Today's Brief" button triggers generation
  await helper.goto("/dashboard");
  await page.waitForTimeout(2000);

  // Check if cosmic profile data exists
  const hasProfile = await page.locator("text=Astrology").isVisible();
  console.log("Has cosmic profile:", hasProfile);

  // We need to trigger regeneration. The simplest way is to go through onboarding again.
  // But the user is already onboarded. Let's check if there's a regenerate option.
  
  // Alternative: Navigate directly to the generate endpoint by going to onboarding
  // First, let's check if we can trigger cosmic fingerprint generation
  // The dashboard's "Generate Today's Brief" button calls generateDailyBrief which
  // also calculates the natal chart. But we need generateCosmicFingerprint.
  
  // Let's try triggering generation by modifying the URL
  // Actually, the best approach is to call the onboarding flow again
  
  // Navigate to settings and check profile data
  await helper.goto("/settings");
  await page.waitForTimeout(2000);
  console.log("On settings page");
  
  // Take debug screenshot
  await page.screenshot({ path: "tmp/debug-settings.png" });
  
  // The easiest approach: delete the user's profile, then go through onboarding again
  // But we can't easily do that from the UI. Let's just check what data we have.
  
  // Navigate to the onboarding page directly
  await helper.goto("/onboarding");
  await page.waitForTimeout(2000);
  
  const onboardingUrl = page.url();
  console.log("After navigating to /onboarding, URL:", onboardingUrl);
  
  // If redirected to dashboard, user is already onboarded
  if (onboardingUrl.includes("dashboard")) {
    console.log("User already onboarded — we need to trigger regeneration via the dashboard");
    
    // Click "Generate Today's Brief" to trigger the brief generation which calculates natal chart
    const generateBtn = page.locator("text=Generate Today's Brief");
    if (await generateBtn.isVisible()) {
      console.log("Clicking Generate Today's Brief...");
      await generateBtn.click();
      await page.waitForTimeout(10000); // Wait for generation
      console.log("Brief generation triggered");
    }
  } else {
    console.log("On onboarding page - filling out form");
    // Fill onboarding if needed
  }
  
  await page.screenshot({ path: "tmp/debug-after-generate.png" });
  console.log("Done!");
});
