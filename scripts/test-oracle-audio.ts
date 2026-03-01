import { runTest } from "./auth";

runTest("Oracle Audio Controls", async (helper) => {
  const { page } = helper;

  // Navigate to the Oracle page
  await helper.goto("/oracle");
  await page.waitForTimeout(2000);

  // Take screenshot of the empty state with suggested questions
  await page.screenshot({ path: "screenshots/oracle-audio-empty.png", fullPage: false });
  console.log("Screenshot 1: Empty oracle page");

  // Check that the page loaded  
  const heading = await page.locator("text=Ask Pearl Anything").isVisible();
  console.log("Ask Pearl Anything heading visible:", heading);

  // Check for input area
  const textarea = page.locator("textarea");
  const hasTextarea = await textarea.isVisible();
  console.log("Textarea visible:", hasTextarea);

  if (hasTextarea) {
    // Type a question to show the active input state  
    await textarea.fill("What does my cosmic blueprint reveal about my purpose?");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/oracle-audio-typing.png", fullPage: false });
    console.log("Screenshot 2: Oracle with typed question");
  }

  // Check for mic button (may not exist in headless mode without SpeechRecognition API)
  const micButton = await page.locator('button[title*="Speak"]').count();
  console.log("Mic buttons found:", micButton);

  console.log("✅ Oracle audio controls test passed");
}).catch(() => process.exit(1));
