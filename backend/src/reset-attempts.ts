import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        in: ['student@dezai.edu', 'student@dezai.com'],
      },
    },
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  console.log(`Resetting attempts and sessions for user: ${user.email} (ID: ${user.id})`);

  // Delete attempts answers first (foreign key constraints)
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const attemptIds = attempts.map((a) => a.id);

  const answerDel = await prisma.attemptAnswer.deleteMany({
    where: {
      attemptId: { in: attemptIds },
    },
  });
  console.log(`Deleted ${answerDel.count} attempt answers.`);

  const violationDel = await prisma.violationLog.deleteMany({
    where: {
      userId: user.id,
    },
  });
  console.log(`Deleted ${violationDel.count} violation logs.`);

  const attemptDel = await prisma.assessmentAttempt.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${attemptDel.count} assessment attempts.`);

  const sessionDel = await prisma.examSession.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${sessionDel.count} exam sessions.`);

  console.log('Attempts reset successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
