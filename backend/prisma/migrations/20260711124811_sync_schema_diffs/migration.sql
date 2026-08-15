/*
  Warnings:

  - Added the required column `updatedAt` to the `chat_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DROPPED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('STREAK', 'XP', 'COMPLETION', 'ASSESSMENT', 'ENGAGEMENT');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'PROFILE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'INSTITUTION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'INSTITUTION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_VERIFIED';
ALTER TYPE "AuditAction" ADD VALUE 'ENROLLMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ENROLLMENT_DROPPED';
ALTER TYPE "AuditAction" ADD VALUE 'LESSON_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'LESSON_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'LESSON_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'CHAT_SESSION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'CHAT_SESSION_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTIFICATION_SENT';
ALTER TYPE "AuditAction" ADD VALUE 'XP_AWARDED';
ALTER TYPE "AuditAction" ADD VALUE 'BOOKMARK_TOGGLED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTE_CREATED';

-- AlterEnum
ALTER TYPE "XpType" ADD VALUE 'ACHIEVEMENT_REWARD';

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "allowResume" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "timeLimitEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "credential_templates" ADD COLUMN     "defaultTier" "CredentialTier" NOT NULL DEFAULT 'CITADEL',
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "thumbnail" TEXT;

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "rarity" "AchievementRarity" NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "current" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
