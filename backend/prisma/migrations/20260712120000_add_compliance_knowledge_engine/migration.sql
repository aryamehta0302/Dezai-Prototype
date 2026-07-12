-- CreateEnum
CREATE TYPE "ComplianceGeneratedContentType" AS ENUM ('LESSON', 'SUMMARY', 'FLASHCARD', 'ASSESSMENT');

-- CreateTable
CREATE TABLE "compliance_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_document_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_generated_content" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" "ComplianceGeneratedContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_generated_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compliance_documents_organizationId_createdAt_idx" ON "compliance_documents"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_document_chunks_documentId_index_key" ON "compliance_document_chunks"("documentId", "index");

-- CreateIndex
CREATE INDEX "compliance_document_chunks_documentId_idx" ON "compliance_document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "compliance_generated_content_organizationId_documentId_type_idx" ON "compliance_generated_content"("organizationId", "documentId", "type");

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_document_chunks" ADD CONSTRAINT "compliance_document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "compliance_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_generated_content" ADD CONSTRAINT "compliance_generated_content_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_generated_content" ADD CONSTRAINT "compliance_generated_content_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "compliance_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_question_banks" ADD CONSTRAINT "enterprise_question_banks_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "compliance_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
