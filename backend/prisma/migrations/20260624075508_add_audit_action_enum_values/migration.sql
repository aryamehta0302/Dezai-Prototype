-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'PROCTORING_VIOLATION';
ALTER TYPE "AuditAction" ADD VALUE 'XP_TRANSACTION';
ALTER TYPE "AuditAction" ADD VALUE 'XP_THRESHOLD_UNLOCKED';
ALTER TYPE "AuditAction" ADD VALUE 'PAYMENT_RECEIVED';
ALTER TYPE "AuditAction" ADD VALUE 'ACCESS_GRANTED';
ALTER TYPE "AuditAction" ADD VALUE 'LEADERBOARD_FROZEN';
ALTER TYPE "AuditAction" ADD VALUE 'VOUCHER_ISSUED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_LOCKOUT_TRIGGERED';
ALTER TYPE "AuditAction" ADD VALUE 'QUESTION_BANK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'QUESTION_BANK_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'QUESTION_BANK_DELETED';
