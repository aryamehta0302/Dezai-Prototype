import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Connected.');

  // Update all assessments to use generous config
  const count = await prisma.assessment.updateMany({
    data: { maxAttempts: 10, allowResume: true },
  });
  console.log(`Updated ${count.count} assessments to maxAttempts=10, allowResume=true`);

  // Delete any active (incomplete) exam sessions — they're stale
  const sessions = await prisma.examSession.deleteMany({
    where: { status: 'ACTIVE' },
  });
  console.log(`Deleted ${sessions.count} stale exam sessions`);

  // Find and delete any incomplete attempts (stale from crashed starts)
  const staleAttempts = await prisma.assessmentAttempt.findMany({
    where: { completedAt: null },
    include: { attemptAnswers: true, violations: true },
  });
  console.log(`Found ${staleAttempts.length} stale incomplete attempts`);

  for (const attempt of staleAttempts) {
    await prisma.attemptAnswer.deleteMany({ where: { attemptId: attempt.id } });
    await prisma.violationLog.deleteMany({ where: { attemptId: attempt.id } });
    await prisma.assessmentAttempt.delete({ where: { id: attempt.id } });
    console.log(`  Deleted stale attempt ${attempt.id} (score=${attempt.score})`);
  }

  // Find and delete any 0-score completed attempts that were auto-closed by the bug
  // These have score=0, passed=false, and no attemptAnswers (no real attempt was made)
  const zeroScoreAttempts = await prisma.assessmentAttempt.findMany({
    where: { completedAt: { not: null }, score: 0, passed: false },
    include: { attemptAnswers: { take: 1 } },
  });
  const buggyAttempts = zeroScoreAttempts.filter(a => a.attemptAnswers.length === 0);
  console.log(`Found ${buggyAttempts.length} buggy 0-score attempts with no answers`);

  for (const attempt of buggyAttempts) {
    await prisma.violationLog.deleteMany({ where: { attemptId: attempt.id } });
    await prisma.assessmentAttempt.delete({ where: { id: attempt.id } });
    console.log(`  Deleted buggy attempt ${attempt.id}`);
  }

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
