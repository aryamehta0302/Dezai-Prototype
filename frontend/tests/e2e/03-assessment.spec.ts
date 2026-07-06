import { test, expect } from '@playwright/test';

test('Assessment taking, Fisher-Yates shuffled question bank flow, and grading', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `assess-${uniqueId}@dezai.edu`;
  const name = `Assess User ${uniqueId}`;
  const password = 'password123';

  // 1. Register fresh student
  await page.goto('/signup');
  await page.fill('input[placeholder="John Doe"]', name);
  await page.fill('input[placeholder="name@university.edu"]', email);
  await page.fill('input[placeholder="••••••••"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/onboarding');
  await page.click('button:has-text("Student / Learner")');
  await page.click('button:has-text("Complete Onboarding")');
  await page.waitForURL('**/dashboard');

  // 2. Go to catalog and click first course
  await page.goto('/catalog');
  await page.click('a:has-text("Generative AI for Leaders")');
  await page.waitForURL(/\/programs\/.+/);

  // 3. Enroll
  await page.click('button:has-text("Enroll Now")');
  await page.waitForTimeout(1000);

  // 4. Open first module accordion to see curriculum/assessments if not already open
  const assessmentLink = page.locator('a:has-text("Assessment")').first();
  if (!(await assessmentLink.isVisible())) {
    await page.click('button:has-text("Foundations of Generative AI")');
  }
  await assessmentLink.click();
  await page.waitForURL(/\/assessment\/.+/);

  // 6. Acknowledge and Begin
  await page.click('button:has-text("Acknowledge & Begin Assessment")');

  // 7. Solve questions (sampleSize = 4)
  for (let i = 0; i < 4; i++) {
    // Select first option
    const options = page.locator('button:has(.rounded-full)');
    await expect(options.first()).toBeVisible();
    await options.first().click();

    // Click Next or Submit
    if (i < 3) {
      await page.click('button:has-text("Next")');
    } else {
      await page.click('button:has-text("Submit Assessment")');
    }
  }

  // 8. Confirm Submission in Dialog
  await page.click('button:has-text("Yes, Submit Grade")');

  // 9. Verify on results page
  await page.waitForURL(/\/results.*/);
  await expect(page.locator('h1')).toContainText(/Assessment Result|Results|Keep Trying/i);
});
