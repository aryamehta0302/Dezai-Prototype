-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'REJECTED');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'DEPARTMENT_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_REJECTED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_SUSPENDED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_REACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_REMOVED';
ALTER TYPE "AuditAction" ADD VALUE 'FACULTY_ASSIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'MENTOR_ASSIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'MENTOR_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'UNIVERSITY_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE 'UNIVERSITY_REJECTED';
ALTER TYPE "AuditAction" ADD VALUE 'UNIVERSITY_SUSPENDED';
ALTER TYPE "AuditAction" ADD VALUE 'UNIVERSITY_REACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_SUSPENDED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_REACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_ROLE_ASSIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_ROLE_REVOKED';
ALTER TYPE "AuditAction" ADD VALUE 'PLATFORM_SETTINGS_UPDATED';

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "mentorFacultyId" TEXT;

-- AlterTable
ALTER TABLE "faculty_members" ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "employeeId" TEXT;

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedById" TEXT;

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedById" TEXT;

-- CreateTable
CREATE TABLE "institution_departments" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "headFacultyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institution_departments_institutionId_name_key" ON "institution_departments"("institutionId", "name");

-- AddForeignKey
ALTER TABLE "faculty_members" ADD CONSTRAINT "faculty_members_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "institution_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "institution_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_mentorFacultyId_fkey" FOREIGN KEY ("mentorFacultyId") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_departments" ADD CONSTRAINT "institution_departments_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_departments" ADD CONSTRAINT "institution_departments_headFacultyId_fkey" FOREIGN KEY ("headFacultyId") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
