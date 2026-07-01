import { test, expect } from '@playwright/test';

test('Full student journey: Registration -> Onboarding -> Catalog -> Enroll -> Pass Assessment -> Verify Credential', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `journey-${uniqueId}@dezai.edu`;
  const name = `Journey User ${uniqueId}`;
  const password = 'password123';

  // 1. Registration
  await page.goto('/signup');
  await page.fill('input[placeholder="John Doe"]', name);
  await page.fill('input[placeholder="name@university.edu"]', email);
  await page.fill('input[placeholder="••••••••"]', password);
  await page.click('button[type="submit"]');

  // 2. Onboarding
  await page.waitForURL('**/onboarding');
  await page.click('button:has-text("Student / Learner")');
  await page.click('button:has-text("Complete Onboarding")');
  await page.waitForURL('**/dashboard');

  // 3. Browse Catalog
  await page.goto('/catalog');
  await expect(page.locator('h1')).toContainText('Course Catalog');
  await page.click('a:has-text("Generative AI for Leaders")');
  await page.waitForURL(/\/programs\/.+/);

  // 4. Enroll
  await page.click('button:has-text("Enroll Now")');
  await page.waitForTimeout(1000);

  // 5. Expand Getting Started and take Assessment if not already open
  const assessmentLink = page.locator('a:has-text("Assessment")').first();
  if (!(await assessmentLink.isVisible())) {
    await page.click('button:has-text("Foundations of Generative AI")');
  }
  await assessmentLink.click();
  await page.waitForURL(/\/assessment\/.+/);

  // 6. Complete Assessment with PASS
  await page.click('button:has-text("Acknowledge & Begin Assessment")');
  const correctAnswers = [
    "It generates new content rather than just analyzing existing data",
    "Transformer",
    "The practice of crafting inputs to get desired outputs from AI models",
    "Retrieval-Augmented Generation — grounding responses in external knowledge",
    "Total Cost of Ownership over 3 years",
    "AI systems based on their risk level to fundamental rights and safety",
    "Data silos and integration with legacy systems",
    "Diverse training data, fairness metrics, and regular auditing"
  ];

  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(500); // Wait for DOM to update with new question
    let clicked = false;
    for (const answerText of correctAnswers) {
      const optionBtn = page.locator(`button:has-text("${answerText}")`);
      if (await optionBtn.isVisible()) {
        await optionBtn.click();
        clicked = true;
        break;
      }
    }
    expect(clicked).toBeTruthy();

    if (i < 3) {
      await page.click('button:has-text("Next")');
    } else {
      await page.click('button:has-text("Submit Assessment")');
    }
  }
  await page.click('button:has-text("Yes, Submit Grade")');
  await page.waitForURL(/\/results.*/);

  // 7. Verify Certificate List and Public Verification
  await page.goto('/certificates');
  await expect(page.locator('h1')).toContainText('My Credentials');
  const credentialCode = await page.locator('p.font-mono').innerText();

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("Verify")')
  ]);

  await popup.waitForLoadState();
  await expect(popup.locator('h1')).toContainText('Credential Verified');
  await expect(popup.locator('body')).toContainText(name);
});
