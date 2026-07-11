import { test, expect, request } from '@playwright/test';
import { SignJWT } from 'jose';

test('Credential revocation flow via Faculty API role-override', async ({ page, request }) => {
  const uniqueId = Date.now();
  const email = `revoke-student-${uniqueId}@dezai.edu`;
  const name = `Revocation Student ${uniqueId}`;
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

  // 10. Go to certificates and get credential details
  await page.goto('/certificates');
  await expect(page.locator('h1').first()).toContainText('My Credentials');

  // Grab the credential ID from the page
  const credentialCode = await page.locator('p.font-mono').innerText();
  expect(credentialCode).not.toBeNull();

  // 11. Authenticate as Faculty on the API and patch status to REVOKED
  // First, login to get the faculty user ID
  const loginResponse = await request.post('http://127.0.0.1:3001/api/auth/login', {
    data: {
      email: 'faculty@dezai.edu',
      password: 'password123'
    }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  const facultyId = loginData.user.id;

  // Generate a JWT directly instead of relying on NextAuth
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dezai_auth_secret_xyz123abc987');
  const token = await new SignJWT({
    id: facultyId,
    email: 'faculty@dezai.edu',
    role: 'FACULTY',
    onboarded: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  // Get all credentials to find the credential DB ID
  const allCredentialsResponse = await request.get('http://127.0.0.1:3001/api/credentials/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("allCredentialsResponse status:", allCredentialsResponse.status());
  console.log("allCredentialsResponse text:", await allCredentialsResponse.text());
  expect(allCredentialsResponse.ok()).toBeTruthy();
  const allCreds = await allCredentialsResponse.json();
  const targetCred = allCreds.credentials.find((c: any) => c.verificationCode === credentialCode);
  expect(targetCred).toBeDefined();

  // Patch the status to REVOKED
  const patchResponse = await request.patch(`http://127.0.0.1:3001/api/credentials/${targetCred.id}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    data: {
      status: 'REVOKED'
    }
  });
  console.log("patchResponse status:", patchResponse.status());
  console.log("patchResponse text:", await patchResponse.text());
  expect(patchResponse.ok()).toBeTruthy();

  // Re-fetch to double check if DB actually updated
  const reFetchResponse = await request.get(`http://127.0.0.1:3001/api/credentials/all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const reFetchData = await reFetchResponse.json();
  const reFetchTarget = reFetchData.credentials.find((c: any) => c.verificationCode === credentialCode);
  console.log("DB status after patch:", reFetchTarget?.verificationStatus);

  // 12. Verify that lookup page now shows "Credential Not Found" or revoked status
  await page.goto(`/verify/${credentialCode}`);
  await expect(page.locator('h2')).toContainText('Credential Revoked');
});
