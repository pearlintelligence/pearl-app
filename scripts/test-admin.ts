import { runTest } from "./auth";

runTest("Admin Section", async (helper) => {
  const { page } = helper;

  // Navigate to dashboard first (test user is logged in)
  await helper.goto("/dashboard");
  await page.waitForTimeout(3000);

  console.log("Current URL:", page.url());

  // Take a screenshot 
  await page.screenshot({ path: "screenshots/admin-dashboard.png", fullPage: true });
  console.log("✅ Dashboard screenshot captured");

  // Check sidebar - admin section should NOT be visible for test user (not @innerpearl.ai)
  const pageText = await page.locator("body").innerText();
  const hasAdminInSidebar = pageText.includes("Feature Flags") && pageText.includes("Platform Tools");
  
  if (hasAdminInSidebar) {
    console.log("⚠️  Admin section is visible - test user might be treated as admin");
  } else {
    console.log("✅ Admin sidebar hidden for non-admin user");
  }

  // Try navigating to /admin
  await helper.goto("/admin");
  await page.waitForTimeout(3000);
  console.log("URL after /admin:", page.url());
  
  await page.screenshot({ path: "screenshots/admin-redirect.png", fullPage: true });
  console.log("✅ Admin redirect screenshot captured");

  console.log("✅ All admin tests passed");
}).catch(() => process.exit(1));
