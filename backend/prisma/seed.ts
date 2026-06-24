import { PrismaClient, UserRole, VerifyStatus, ApprovalStatus, CredentialTier } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Credentials Testing...');

  // Clean the database
  await prisma.credentialLog.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.module.deleteMany();
  await prisma.programTrack.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  console.log('🧹 Database Cleared');

  // 1. Create Institution
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-1' },
    update: {},
    create: {
      id: 'inst-1',
      name: 'Dezai Tech University',
    },
  });
  console.log('✅ Institution Created');

  // 2. Create Users (Faculty & Student)
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@dezai.com' },
    update: {},
    create: {
      id: 'fac-1',
      email: 'faculty@dezai.com',
      passwordHash: '$2a$12$W9f.tXQZzXQ.W7r/xQy8p.W/tXQZzXQ.W7r/xQy8p.W/tXQZzXQ.', // Fake hash
      name: 'Dr. Sarah Connor',
      role: UserRole.FACULTY,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@dezai.com' },
    update: {},
    create: {
      id: 'stu-1',
      email: 'student@dezai.com',
      passwordHash: '56648cea69f03959b5a0556062bc01d0:caf87d09f73d07e6396f2da7321856730d553bf964fc544907a991912e5a9d7e3ae531d4e135f8a4ec608d4f1053d20fc30b1c4b1a03fbc019a174e993c2c4d6', // password123 (PBKDF2)
      name: 'Alex Johnson',
      role: UserRole.STUDENT,
    },
  });
  console.log('✅ Faculty & Student Created');
  console.log('🧑‍🎓 STUDENT LOGIN INFO:');
  console.log('Email: student@dezai.com');
  console.log('Password: password123');

  // 3. Create Program & Enrollment (100% Progress for Program Credential)
  const program = await prisma.program.upsert({
    where: { id: 'prog-1' },
    update: {},
    create: {
      id: 'prog-1',
      title: 'Full Stack Engineering Track',
      description: 'Complete web development curriculum',
      institutionId: institution.id,
    },
  });

  await prisma.enrollment.upsert({
    where: { id: 'enr-1' },
    update: {},
    create: {
      id: 'enr-1',
      userId: student.id,
      programId: program.id,
      progress: 100, // 100% so student can generate PROGRAM credential!
    },
  });
  console.log('✅ Program & 100% Enrollment Created');

  // 4. Create Assessment dependencies
  const track = await prisma.programTrack.upsert({
    where: { id: 'track-1' }, update: {}, create: { id: 'track-1', programId: program.id, type: 'ROOTS' }
  });
  
  const module = await prisma.module.upsert({
    where: { id: 'mod-1' }, update: {}, create: { id: 'mod-1', trackId: track.id, title: 'Module 1', order: 1 }
  });

  const qb = await prisma.questionBank.upsert({
    where: { id: 'qb-1' }, update: {}, create: { id: 'qb-1', title: 'QB', institutionId: institution.id }
  });

  const assessment = await prisma.assessment.upsert({
    where: { id: 'ass-1' },
    update: {},
    create: {
      id: 'ass-1',
      title: 'Final React Exam',
      moduleId: module.id,
      questionBankId: qb.id,
      passingScore: 70,
    },
  });

  await prisma.assessmentAttempt.upsert({
    where: { id: 'att-1' },
    update: {},
    create: {
      id: 'att-1',
      userId: student.id,
      assessmentId: assessment.id,
      score: 95,
      passed: true,
    },
  });
  console.log('✅ Assessment & Passed Attempt Created');

  console.log('🎉 Seed Complete! You can now test the entire architecture.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
