-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 1800;

-- AlterTable
ALTER TABLE "question_bank_questions" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
