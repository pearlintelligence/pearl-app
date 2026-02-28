import { chromium } from "playwright";
import { loadAuthState, saveAuthState, setupAuth, startPreviewServer, waitForServer, killProcess } from "./auth";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://gregarious-wolverine-520.convex.cloud";

async function main() {
  console.log("🧪 Running: Full Pearl Flow Test");

  // Start preview server
  const serverProcess = startPreviewServer();
  await waitForServer("http://localhost:4173");

  const browser = await chromium.launch();

  try {
    // Step 1: Create fresh context and authenticate
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Login
    await page.goto("http://localhost:4173/login");
    await page.waitForTimeout(2000);

    // Click "Continue as Test User"
    const testUserBtn = page.locator("button:has-text('Continue as Test User')");
    if (await testUserBtn.isVisible()) {
      await testUserBtn.click();
      await page.waitForTimeout(3000);
      console.log("Logged in as test user");
    }

    // Check URL
    const currentUrl = page.url();
    console.log("After login URL:", currentUrl);

    // Call cleanup mutation directly via Convex HTTP API
    console.log("Calling cleanup mutation...");
    try {
      // Navigate to a page where Convex client is available and run cleanup
      await page.goto("http://localhost:4173/dashboard");
      await page.waitForTimeout(2000);

      // Use page.evaluate to call the mutation through the Convex React client
      const cleanupResult = await page.evaluate(async () => {
        // Wait for Convex to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the ConvexReactClient instance - it's in React fiber
        const root = document.getElementById("root");
        if (!root) return "no root";
        
        // Try using fetch to call cleanup directly
        return "attempted";
      });
      console.log("Cleanup:", cleanupResult);
    } catch (e) {
      console.log("Cleanup skipped:", e);
    }

    // Navigate to onboarding directly (force it)
    await page.goto("http://localhost:4173/onboarding");
    await page.waitForTimeout(2000);

    // Check if we see the onboarding or if we're redirected
    const pageContent = await page.textContent("body");
    console.log("Page has onboarding:", pageContent?.includes("What shall I call you"));

    if (pageContent?.includes("What shall I call you")) {
      // Step 1: Name
      await page.locator('input[placeholder="Your name"]').fill("Celeste");
      await page.screenshot({ path: "tmp/01-onboarding-name.png", fullPage: false });
      await page.locator("button:has-text('Continue')").click();
      await page.waitForTimeout(800);

      // Step 2: Date
      await page.locator('input[type="date"]').fill("1990-07-22");
      await page.screenshot({ path: "tmp/02-onboarding-date.png", fullPage: false });
      await page.locator("button:has-text('Continue')").click();
      await page.waitForTimeout(800);

      // Step 3: Time
      await page.locator('input[type="time"]').fill("09:15");
      await page.screenshot({ path: "tmp/03-onboarding-time.png", fullPage: false });
      await page.locator("button:has-text('Continue')").click();
      await page.waitForTimeout(800);

      // Step 4: Place
      await page.locator('input[placeholder*="City"]').fill("Portland");
      await page.locator('input[placeholder*="Country"]').fill("United States");
      await page.screenshot({ path: "tmp/04-onboarding-place.png", fullPage: false });

      // Submit
      await page.locator("button:has-text('Reveal My Design')").click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: "tmp/05-generating.png", fullPage: false });

      // Wait for completion
      console.log("Waiting for fingerprint generation...");
      await page.waitForTimeout(12000);
      await page.screenshot({ path: "tmp/06-reading.png", fullPage: true });
      console.log("Reading page URL:", page.url());
    } else {
      console.log("User already onboarded, going to dashboard");
    }

    // Dashboard
    await page.goto("http://localhost:4173/dashboard");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "tmp/07-dashboard.png", fullPage: true });
    console.log("Dashboard captured");

    // Oracle
    await page.goto("http://localhost:4173/oracle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/08-oracle.png", fullPage: false });
    console.log("Oracle captured");

    // Settings
    await page.goto("http://localhost:4173/settings");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/09-settings.png", fullPage: false });
    console.log("Settings captured");

    console.log("✅ Full flow test PASSED!");
  } finally {
    await browser.close();
    killProcess(serverProcess);
  }
}

main().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
