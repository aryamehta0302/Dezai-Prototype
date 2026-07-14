import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplianceGeneratedContentType, UserRole } from '@prisma/client';
import { inflateSync } from 'zlib';
import { PrismaService } from '../../../database/prisma.service';
import { AIProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';
import type {
  ComplianceChatDto,
  ComplianceChatCitationDto,
  ComplianceDocumentSummaryDto,
  UploadComplianceDocumentDto,
} from '../dto/compliance-knowledge.dto';

const MAX_PDF_BYTES = 12 * 1024 * 1024;
const MIN_TEXT_LENGTH = 80;
const CHUNK_SIZE = 1_600;
const CHUNK_OVERLAP = 220;

type UploadedPdf = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

type RelevantChunk = {
  id: string;
  index: number;
  text: string;
  document: { id: string; title: string };
};

@Injectable()
export class ComplianceKnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProviderService: AIProviderService,
    private readonly promptBuilderService: PromptBuilderService,
  ) {}

  async uploadDocument(
    userId: string,
    file: UploadedPdf | undefined,
    dto: UploadComplianceDocumentDto,
  ) {
    if (!file?.buffer) throw new BadRequestException('PDF file is required');
    if (file.size > MAX_PDF_BYTES) {
      throw new BadRequestException('PDF must be 12MB or smaller');
    }
    if (
      file.mimetype !== 'application/pdf' &&
      !file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      throw new BadRequestException('Only PDF policy/SOP documents are supported');
    }

    const organizationId = await this.resolveOrganizationId(
      userId,
      dto.organizationId,
    );
    const extractedText = this.extractPdfText(file.buffer);
    if (extractedText.length < MIN_TEXT_LENGTH) {
      throw new BadRequestException(
        'Could not extract enough text from this PDF. Please upload a text-based policy/SOP PDF.',
      );
    }

    const chunks = this.chunkText(extractedText);
    const document = await this.prisma.complianceDocument.create({
      data: {
        organizationId,
        uploadedById: userId,
        title: dto.title?.trim() || this.titleFromFileName(file.originalname),
        fileName: file.originalname,
        fileType: file.mimetype || 'application/pdf',
        sizeBytes: file.size,
        extractedText,
        chunks: {
          create: chunks.map((text, index) => ({ index, text })),
        },
      },
      include: { chunks: { select: { id: true } } },
    });

    const generatedContent = await this.generateAllContent(document.id, userId);

    return {
      document: this.toDocumentSummary(document, document.chunks.length),
      generatedContent,
    };
  }

  async listDocuments(userId: string, organizationId?: string) {
    const resolvedOrganizationId = await this.resolveOrganizationId(
      userId,
      organizationId,
    );
    const documents = await this.prisma.complianceDocument.findMany({
      where: { organizationId: resolvedOrganizationId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chunks: true } } },
    });

    return documents.map((document) =>
      this.toDocumentSummary(document, document._count.chunks),
    );
  }

  async getDocument(userId: string, documentId: string) {
    const document = await this.getAuthorizedDocument(userId, documentId);
    const generatedContent = await this.prisma.complianceGeneratedContent.findMany(
      {
        where: { documentId },
        orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
      },
    );

    return {
      document: this.toDocumentSummary(document, document.chunks.length),
      generatedContent,
    };
  }

  async generateAllContent(documentId: string, userId: string) {
    await this.getAuthorizedDocument(userId, documentId);
    const types = [
      ComplianceGeneratedContentType.SUMMARY,
      ComplianceGeneratedContentType.LESSON,
      ComplianceGeneratedContentType.FLASHCARD,
      ComplianceGeneratedContentType.ASSESSMENT,
    ];

    const generated = [];
    for (const type of types) {
      generated.push(await this.generateContent(documentId, userId, type));
    }
    return generated;
  }

  async generateContent(
    documentId: string,
    userId: string,
    type: ComplianceGeneratedContentType,
  ) {
    const document = await this.getAuthorizedDocument(userId, documentId);
    const digest = this.promptBuilderService.buildContentDigest(
      document.extractedText,
      `${document.title} ${type}`,
      5_000,
    );
    const systemPrompt = [
      'You generate enterprise compliance learning content from uploaded company documents.',
      'Use only the supplied document text. Do not invent policy details.',
      'Return strict JSON only, without markdown fences.',
      this.schemaInstruction(type),
    ].join('\n');

    const fallback = this.fallbackContent(type, document.title, digest);
    const raw = await this.generateText(
      `Document title: ${document.title}\nDocument text:\n${digest}`,
      systemPrompt,
      JSON.stringify(fallback),
    );
    const content = this.parseJson(raw, fallback);

    return this.prisma.complianceGeneratedContent.upsert({
      where: {
        id:
          (
            await this.prisma.complianceGeneratedContent.findFirst({
              where: { documentId, type },
              select: { id: true },
            })
          )?.id ?? '',
      },
      create: {
        organizationId: document.organizationId,
        documentId,
        type,
        title: this.generatedTitle(type, document.title),
        content,
      },
      update: {
        title: this.generatedTitle(type, document.title),
        content,
      },
    });
  }

  async chat(userId: string, dto: ComplianceChatDto) {
    const organizationId = dto.documentId
      ? (await this.getAuthorizedDocument(userId, dto.documentId)).organizationId
      : await this.resolveOrganizationId(userId);
    const chunks = await this.findRelevantChunks(
      organizationId,
      dto.message,
      dto.documentId,
    );

    if (chunks.length === 0) {
      return {
        success: true,
        answer:
          'I could not find that in the uploaded company documents. Please upload the relevant policy/SOP or ask about a documented section.',
        citations: [],
      };
    }

    const documentContext = chunks
      .map(
        (chunk) =>
          `[Document: ${chunk.document.title}, chunk ${chunk.index + 1}]\n${chunk.text}`,
      )
      .join('\n\n');
    const systemPrompt = await this.promptBuilderService.buildChatPrompt(
      {
        id: 'compliance-chat',
        activeProgramId: dto.activeProgramId,
        activeModuleId: dto.activeModuleId,
        activeLessonId: dto.activeLessonId,
      },
      dto.message,
      {
        documentContext,
        complianceOnly: true,
        includeHistory: false,
      },
    );
    const answer = await this.generateText(
      dto.message,
      systemPrompt,
      this.fallbackComplianceAnswer(chunks),
    );

    return {
      success: true,
      answer,
      citations: chunks.map((chunk): ComplianceChatCitationDto => ({
        documentId: chunk.document.id,
        documentTitle: chunk.document.title,
        chunkId: chunk.id,
        chunkIndex: chunk.index,
        excerpt: chunk.text.slice(0, 280),
      })),
    };
  }

  private async resolveOrganizationId(
    userId: string,
    requestedOrganizationId?: string,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organizationAdmin: true, employee: true },
    });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === UserRole.DEZAI_ADMIN && requestedOrganizationId) {
      return requestedOrganizationId;
    }

    const organizationId =
      user.organizationAdmin?.organizationId ?? user.employee?.organizationId;
    if (!organizationId) {
      throw new ForbiddenException('Organization access is required');
    }
    if (requestedOrganizationId && requestedOrganizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this organization');
    }
    return organizationId;
  }

  private async getAuthorizedDocument(userId: string, documentId: string) {
    const document = await this.prisma.complianceDocument.findUnique({
      where: { id: documentId },
      include: { chunks: { select: { id: true } } },
    });
    if (!document) throw new NotFoundException('Compliance document not found');

    await this.resolveOrganizationId(userId, document.organizationId);
    return document;
  }

  private async findRelevantChunks(
    organizationId: string,
    query: string,
    documentId?: string,
  ): Promise<RelevantChunk[]> {
    const chunks = await this.prisma.complianceDocumentChunk.findMany({
      where: {
        document: {
          organizationId,
          ...(documentId ? { id: documentId } : {}),
        },
      },
      include: { document: { select: { id: true, title: true } } },
      orderBy: { index: 'asc' },
      take: 240,
    });
    const keywords = this.keywords(query);

    return chunks
      .map((chunk) => ({
        ...chunk,
        score: keywords.reduce(
          (score, keyword) =>
            score +
            (chunk.text.toLowerCase().includes(keyword) ? 3 : 0) +
            (chunk.document.title.toLowerCase().includes(keyword) ? 1 : 0),
          0,
        ),
      }))
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 6)
      .sort((a, b) => a.index - b.index);
  }

  private extractPdfText(buffer: Buffer): string {
    const sources = [buffer.toString('latin1')];
    const raw = sources[0];
    for (const match of raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
      const stream = Buffer.from(match[1], 'latin1');
      try {
        sources.push(inflateSync(stream).toString('latin1'));
      } catch {
        sources.push(stream.toString('latin1'));
      }
    }

    const text = sources
      .flatMap((source) => [
        ...this.extractPdfStrings(source),
        ...this.extractHexStrings(source),
      ])
      .join(' ');

    return this.cleanText(text);
  }

  private extractPdfStrings(source: string): string[] {
    return [...source.matchAll(/\((?:\\.|[^\\)]){2,}\)/g)]
      .map((match) =>
        match[0]
          .slice(1, -1)
          .replace(/\\([nrtbf()\\])/g, (_, escaped: string) => {
            const map: Record<string, string> = {
              n: '\n',
              r: '\n',
              t: ' ',
              b: ' ',
              f: ' ',
              '(': '(',
              ')': ')',
              '\\': '\\',
            };
            return map[escaped] ?? escaped;
          }),
      )
      .filter((value) => /[A-Za-z]{3,}/.test(value));
  }

  private extractHexStrings(source: string): string[] {
    return [...source.matchAll(/<([0-9A-Fa-f]{8,})>/g)]
      .map((match) => this.decodePdfHex(match[1]))
      .filter((value) => /[A-Za-z]{3,}/.test(value));
  }

  private decodePdfHex(hex: string): string {
    const bytes = Buffer.from(hex, 'hex');
    if (bytes.length > 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      const chars: string[] = [];
      for (let index = 2; index + 1 < bytes.length; index += 2) {
        chars.push(String.fromCharCode(bytes[index] * 256 + bytes[index + 1]));
      }
      return chars.join('');
    }
    return bytes.toString('latin1');
  }

  private cleanText(value: string): string {
    return value
      .replace(/\u0000/g, '')
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
      .trim();
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(text.length, start + CHUNK_SIZE);
      chunks.push(text.slice(start, end).trim());
      if (end === text.length) break;
      start = Math.max(0, end - CHUNK_OVERLAP);
    }
    return chunks.filter((chunk) => chunk.length > 40);
  }

  private async generateText(
    userMessage: string,
    systemPrompt: string,
    fallback: string,
  ) {
    try {
      const response = await this.aiProviderService.generateResponse(
        userMessage,
        systemPrompt,
      );
      return response?.trim() || fallback;
    } catch {
      return fallback;
    }
  }

  private parseJson(raw: string, fallback: unknown) {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) return fallback;
      try {
        return JSON.parse(match[0]);
      } catch {
        return fallback;
      }
    }
  }

  private schemaInstruction(type: ComplianceGeneratedContentType): string {
    const schemas: Record<ComplianceGeneratedContentType, string> = {
      SUMMARY:
        'Schema: {"summary":"string","keyPolicies":["string"],"employeeActions":["string"],"risks":["string"]}',
      LESSON:
        'Schema: {"title":"string","objectives":["string"],"sections":[{"heading":"string","body":"string"}],"checkForUnderstanding":["string"]}',
      FLASHCARD:
        'Schema: [{"front":"string","back":"string","sourceHint":"string"}]. Return 8 cards.',
      ASSESSMENT:
        'Schema: [{"question":"string","options":["string","string","string","string"],"correctAnswerIndex":0,"explanation":"string"}]. Return 5 questions.',
    };
    return schemas[type];
  }

  private fallbackContent(
    type: ComplianceGeneratedContentType,
    title: string,
    digest: string,
  ) {
    const sentences = digest
      .split(/[.!?]\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 35)
      .slice(0, 8);
    const points = sentences.length > 0 ? sentences : [`Review ${title}.`];

    if (type === ComplianceGeneratedContentType.SUMMARY) {
      return {
        summary: points.slice(0, 3).join('. '),
        keyPolicies: points.slice(0, 4),
        employeeActions: points.slice(1, 5),
        risks: points.slice(2, 6),
      };
    }
    if (type === ComplianceGeneratedContentType.LESSON) {
      return {
        title,
        objectives: points.slice(0, 3),
        sections: points.slice(0, 4).map((point, index) => ({
          heading: `Policy area ${index + 1}`,
          body: point,
        })),
        checkForUnderstanding: points
          .slice(0, 3)
          .map((point) => `How should an employee apply: ${point.slice(0, 80)}?`),
      };
    }
    if (type === ComplianceGeneratedContentType.FLASHCARD) {
      return points.slice(0, 8).map((point, index) => ({
        front: `What does the policy say about item ${index + 1}?`,
        back: point,
        sourceHint: title,
      }));
    }
    return points.slice(0, 5).map((point, index) => ({
      question: `Which statement best matches the policy guidance for item ${index + 1}?`,
      options: [point.slice(0, 140), 'Ignore the policy until asked', 'Use personal judgment only', 'Escalate without reading the SOP'],
      correctAnswerIndex: 0,
      explanation: point,
    }));
  }

  private fallbackComplianceAnswer(chunks: RelevantChunk[]) {
    const excerpts = chunks
      .slice(0, 2)
      .map((chunk) => chunk.text.slice(0, 450))
      .join('\n\n');
    return `Based on the uploaded company document(s):\n\n${excerpts}`;
  }

  private generatedTitle(type: ComplianceGeneratedContentType, title: string) {
    const labels: Record<ComplianceGeneratedContentType, string> = {
      SUMMARY: 'Summary',
      LESSON: 'Lesson',
      FLASHCARD: 'Flashcards',
      ASSESSMENT: 'Assessment',
    };
    return `${labels[type]}: ${title}`;
  }

  private titleFromFileName(fileName: string) {
    return fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  }

  private toDocumentSummary(
    document: {
      id: string;
      organizationId: string;
      title: string;
      fileName: string;
      fileType: string;
      sizeBytes: number;
      createdAt: Date;
    },
    chunkCount: number,
  ): ComplianceDocumentSummaryDto {
    return {
      id: document.id,
      organizationId: document.organizationId,
      title: document.title,
      fileName: document.fileName,
      fileType: document.fileType,
      sizeBytes: document.sizeBytes,
      chunkCount,
      createdAt: document.createdAt,
    };
  }

  private keywords(value: string): string[] {
    const stopWords = new Set([
      'about',
      'company',
      'document',
      'policy',
      'should',
      'what',
      'when',
      'where',
      'which',
      'with',
    ]);
    return [
      ...new Set(
        value
          .toLowerCase()
          .match(/[a-z0-9]{3,}/g)
          ?.filter((word) => !stopWords.has(word)) ?? [],
      ),
    ].slice(0, 12);
  }
}
