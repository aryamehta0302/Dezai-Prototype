import { test, expect } from '@playwright/test';

test('Proctoring violation flow (focus loss & lockout)', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `proctor-${uniqueId}@dezai.edu`;
  const name = `Proctor User ${uniqueId}`;
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

  // 4. Open Getting Started accordion and click assessment if not already open
  const assessmentLink = page.locator('a:has-text("Assessment")').first();
  if (!(await assessmentLink.isVisible())) {
    await page.click('button:has-text("Foundations of Generative AI")');
  }
  await assessmentLink.click();
  await page.waitForURL(/\/assessment\/.+/);

  // 5. Acknowledge and Begin
  await page.click('button:has-text("Acknowledge & Begin Assessment")');
  await page.waitForTimeout(1000);

  // 6. Trigger 1st Violation: Focus Loss
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('text=Proctoring Warning: Focus Lost')).toBeVisible();

  // 7. Acknowledge warning
  await page.click('button:has-text("I Acknowledge and Will Keep Focus")');
  await page.waitForTimeout(1000);

  // 8. Trigger 2nd Violation: Focus Loss
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('text=Proctoring Violation: Focus Lost')).toBeVisible();
  await expect(page.locator('text=Screen Locked').first()).toBeVisible();
});
