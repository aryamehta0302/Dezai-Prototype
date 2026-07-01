import { test, expect } from '@playwright/test';

test('Student registration and onboarding role assignment', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `student-${uniqueId}@dezai.edu`;
  const name = `Test Student ${uniqueId}`;
  const password = 'password123';

  // 1. Visit signup page
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('/signup');
  await expect(page).toHaveTitle(/Dezai/);

  // 2. Fill registration details
  await page.fill('input[placeholder="John Doe"]', name);
  await page.fill('input[placeholder="name@university.edu"]', email);
  await page.fill('input[placeholder="••••••••"]', password);

  // 3. Submit form
  await page.click('button[type="submit"]');

  // 4. Wait for redirect to onboarding page
  await page.waitForURL('**/onboarding');
  await expect(page.locator('h1')).toContainText('Select Your Role');

  // 5. Select Student / Learner role
  await page.click('button:has-text("Student / Learner")');

  // 6. Complete Onboarding
  await page.click('button:has-text("Complete Onboarding")');

  // 7. Verify redirect to dashboard
  await expect(page.locator('h1')).toContainText(/Good/i);
});
