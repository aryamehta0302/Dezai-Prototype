-- CreateEnum
CREATE TYPE "ProgramCategory" AS ENUM ('AI', 'COMMERCE', 'DESIGN');

-- CreateEnum
CREATE TYPE "ProgramTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "category" "ProgramCategory" NOT NULL DEFAULT 'AI',
ADD COLUMN     "tier" "ProgramTier" NOT NULL DEFAULT 'TIER_1';
