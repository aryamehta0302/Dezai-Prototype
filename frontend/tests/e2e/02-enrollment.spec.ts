import { test, expect } from '@playwright/test';

test('Browse catalog and enroll in program', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `enroll-${uniqueId}@dezai.edu`;
  const name = `Enroll User ${uniqueId}`;
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

  // 2. Navigate to catalog
  await page.goto('/catalog');
  await expect(page.locator('h1')).toContainText('Course Catalog');

  // 3. Click first course card (e.g., Generative AI for Leaders)
  await page.click('a:has-text("Generative AI for Leaders")');

  // 4. Verify on course details page
  await page.waitForURL(/\/programs\/.+/);
  await expect(page.locator('button:has-text("Enroll Now")')).toBeVisible();

  // 5. Enroll in the program
  await page.click('button:has-text("Enroll Now")');

  // 6. Verify enrollment success state
  await expect(page.locator('button:has-text("Start Learning")')).toBeVisible();
});
