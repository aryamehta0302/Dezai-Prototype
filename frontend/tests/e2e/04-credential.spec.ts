import { test, expect } from '@playwright/test';

test('Credential generation on success and public credential verification route', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  const uniqueId = Date.now();
  const email = `cred-${uniqueId}@dezai.edu`;
  const name = `Cred User ${uniqueId}`;
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

  // 4. Open Getting Started accordion if not already open
  const assessmentLink = page.locator('a:has-text("Assessment")').first();
  if (!(await assessmentLink.isVisible())) {
    await page.click('button:has-text("Foundations of Generative AI")');
  }
  await assessmentLink.click();
  await page.waitForURL(/\/assessment\/.+/);

  // 6. Acknowledge and Begin
  await page.click('button:has-text("Acknowledge & Begin Assessment")');

  // 7. Solve all questions with CORRECT answers
  const correctAnswers = [
    "It generates new content rather than just analyzing existing data",
    "Transformer",
    "Crafting inputs to get desired outputs from AI models",
    "Retrieval-Augmented Generation",
    "Total Cost of Ownership over 3 years",
    "AI systems based on risk level to rights and safety",
    "Model performs well on training data but poorly on new data",
    "Image recognition and computer vision tasks",
    "Algorithm for computing gradients in neural networks",
    "Data silos and integration with legacy systems",
    "Diverse training data, fairness metrics, and regular auditing",
    "Gradients become too small for deep networks to learn effectively"
  ];

  for (let i = 0; i < 5; i++) {
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

    if (i < 4) {
      await page.click('button:has-text("Next")');
    } else {
      await page.click('button:has-text("Submit Assessment")');
    }
  }

  // 8. Confirm Submission in Dialog
  await page.click('button:has-text("Yes, Submit Grade")');

  // 9. Verify passed result page
  await page.waitForURL(/\/results.*/);
  await expect(page.locator('h1')).toContainText(/Assessment Result|Results|Congratulations/i);

  // 10. Navigate to My Credentials
  await page.goto('/certificates');
  await expect(page.locator('h1').first()).toContainText('My Credentials');

  // 11. Find the credential card and click the Verify button
  // Click Verify button inside the card which opens a new window or route
  // The card has a verify button that runs: onClick={() => window.open(`/verify/${credential.verificationCode}`, '_blank')}
  // We can listen for the popup or we can extract the link, or we can just navigate to verify URL if we grab the verificationCode.
  // Wait, let's grab the text of the Credential ID or click the Verify button and wait for the popup.
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("Verify")')
  ]);

  await popup.waitForLoadState();
  await expect(popup.locator('body')).toContainText('Verified by');
  await expect(popup.locator('body')).toContainText(name);
});
