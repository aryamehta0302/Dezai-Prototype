-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ENTERPRISE_QUESTION_BANK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ENTERPRISE_QUESTION_BANK_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'ENTERPRISE_QUESTION_BANK_DELETED';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "managerId" TEXT;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
