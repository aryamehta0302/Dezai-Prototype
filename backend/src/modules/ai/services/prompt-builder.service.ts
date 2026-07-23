import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CHARS = 3_000;
const MAX_CONTEXT_CHARS = 1_800;

interface ChatContext {
  id: string;
  activeProgramId?: string | null;
  activeModuleId?: string | null;
  activeLessonId?: string | null;
}

interface ChatPromptOptions {
  documentContext?: string;
  complianceOnly?: boolean;
  includeHistory?: boolean;
}

@Injectable()
export class PromptBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async buildChatPrompt(
    session: ChatContext,
    userMessage: string,
    options: ChatPromptOptions = {},
  ): Promise<string> {
    const [history, learningContext] = await Promise.all([
      options.includeHistory === false ? Promise.resolve('') : this.buildHistory(session.id),
      this.buildLearningContext(session, userMessage),
    ]);

    return [
      options.complianceOnly
        ? 'You are the AI Compliance Chat for the Dezai enterprise learning platform.'
        : 'You are the concise, encouraging AI Mentor for the Dezai learning platform.',
      options.complianceOnly
        ? 'Answer ONLY from the uploaded company document excerpts. If the excerpts do not answer the question, say that the uploaded documents do not contain the answer.'
        : 'Explain clearly, use relevant examples, and ask a check-for-understanding question when useful.',
      options.complianceOnly
        ? 'Do not use outside knowledge, general compliance assumptions, or policy details that are not present in the document excerpts.'
        : 'Use only the supplied learning context; say when the context does not contain an answer.',
      'Keep answers to 2-3 short paragraphs and use markdown when it improves clarity.',
      learningContext ? `Learning context:\n${learningContext}` : '',
      options.documentContext
        ? `Uploaded company document excerpts:\n${options.documentContext.slice(0, MAX_CONTEXT_CHARS * 3)}`
        : '',
      history ? `Recent conversation:\n${history}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  buildContentDigest(content: string, query: string, maxChars = 2_400): string {
    const normalized = content.replace(/\r/g, '').trim();
    if (normalized.length <= maxChars) return normalized;

    const keywords = this.keywords(query);
    const blocks = normalized
      .split(/\n{2,}|(?<=[.!?])\s+/)
      .map((text, index) => ({ text: text.trim(), index }))
      .filter(({ text }) => text.length > 20)
      .map((block) => ({
        ...block,
        score:
          (block.text.startsWith('#') ? 4 : 0) +
          keywords.reduce(
            (score, word) =>
              score + (block.text.toLowerCase().includes(word) ? 2 : 0),
            0,
          ),
      }))
      .sort((a, b) => b.score - a.score || a.index - b.index);

    const selected: typeof blocks = [];
    let length = 0;
    for (const block of blocks) {
      if (length + block.text.length > maxChars) continue;
      selected.push(block);
      length += block.text.length + 1;
      if (length >= maxChars * 0.85) break;
    }

    const digest = selected
      .sort((a, b) => a.index - b.index)
      .map(({ text }) => text)
      .join('\n')
      .slice(0, maxChars);
    return digest || normalized.slice(0, maxChars);
  }

  private async buildHistory(sessionId: string): Promise<string> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES + 1,
      select: { sender: true, content: true },
    });

    // The current user message was persisted before prompt construction.
    return messages
      .slice(1)
      .reverse()
      .map(
        (message) =>
          `${message.sender === 'USER' ? 'Student' : 'Mentor'}: ${message.content.slice(0, 500)}`,
      )
      .join('\n')
      .slice(-MAX_HISTORY_CHARS);
  }

  private async buildLearningContext(
    session: ChatContext,
    userMessage: string,
  ): Promise<string> {
    if (session.activeLessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: session.activeLessonId },
        include: {
          module: { include: { track: { include: { program: true } } } },
        },
      });
      if (!lesson) return '';

      const excerpt = this.buildContentDigest(
        lesson.content,
        `${lesson.title} ${userMessage}`,
        1_200,
      );
      return [
        `Program: ${lesson.module.track.program.title}`,
        `Module: ${lesson.module.title}`,
        `Lesson: ${lesson.title}`,
        excerpt ? `Relevant lesson excerpt:\n${excerpt}` : '',
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, MAX_CONTEXT_CHARS);
    }

    if (session.activeModuleId) {
      const module = await this.prisma.module.findUnique({
        where: { id: session.activeModuleId },
        include: {
          track: { include: { program: true } },
          lessons: { orderBy: { order: 'asc' }, select: { title: true } },
        },
      });
      if (module) {
        return [
          `Program: ${module.track.program.title}`,
          `Module: ${module.title}`,
          `Lessons: ${module.lessons.map((lesson) => lesson.title).join(', ')}`,
        ].join('\n');
      }
    }

    if (session.activeProgramId) {
      const program = await this.prisma.program.findUnique({
        where: { id: session.activeProgramId },
        select: { title: true, description: true },
      });
      if (program) {
        return `Program: ${program.title}\n${(program.description ?? '').slice(0, 600)}`;
      }
    }

    return '';
  }

  private keywords(value: string): string[] {
    const stopWords = new Set([
      'about',
      'could',
      'explain',
      'from',
      'have',
      'lesson',
      'that',
      'this',
      'what',
      'when',
      'with',
      'your',
    ]);
    return [
      ...new Set(
        value
          .toLowerCase()
          .match(/[a-z0-9]{4,}/g)
          ?.filter((word) => !stopWords.has(word)) ?? [],
      ),
    ].slice(0, 12);
  }
}
