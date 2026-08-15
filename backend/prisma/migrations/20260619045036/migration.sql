-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('PROGRAM', 'ASSESSMENT', 'MERIT');

-- AlterTable
ALTER TABLE "credentials" ADD COLUMN     "credentialTemplateId" TEXT;



-- CreateTable
CREATE TABLE "credential_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "designUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_credentialTemplateId_fkey" FOREIGN KEY ("credentialTemplateId") REFERENCES "credential_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_templates" ADD CONSTRAINT "credential_templates_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
