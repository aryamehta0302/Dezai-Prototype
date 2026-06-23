import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ChatRepository } from '../repositories/chat.repository';
import { AIProviderService } from './ai-provider.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import {
  CreateChatSessionDto,
  SendMessageDto,
  UpdateSessionContextDto,
  UpdateSessionTitleDto,
} from '../dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private aiProviderService: AIProviderService,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createSession(userId: string, dto: CreateChatSessionDto) {
    const session = await this.chatRepository.createSession(userId, dto);

    await this.auditService.logAction(
      userId,
      AuditAction.CHAT_SESSION_CREATED,
      `Chat session ${session.id} created`,
    );

    return session;
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.chatRepository.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    return session;
  }

  async getUserSessions(userId: string, limit: number = 50, offset: number = 0) {
    return this.chatRepository.getUserSessions(userId, limit, offset);
  }

  async deleteSession(sessionId: string, userId: string) {
    const isOwner = await this.chatRepository.verifySessionOwnership(
      sessionId,
      userId,
    );

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    await this.chatRepository.deleteSession(sessionId);

    await this.auditService.logAction(
      userId,
      AuditAction.CHAT_SESSION_DELETED,
      `Chat session ${sessionId} deleted`,
    );

    return { success: true, message: 'Chat session deleted successfully' };
  }

  async sendMessage(sessionId: string, userId: string, dto: SendMessageDto) {
    const session = await this.chatRepository.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const userMessage = await this.chatRepository.addMessage(
      sessionId,
      'USER',
      dto.content,
    );

    const systemPrompt = await this.buildSystemPrompt(session);

    const mentorResponseContent = await this.aiProviderService.generateResponse(
      dto.content,
      systemPrompt,
    );

    const mentorMessage = await this.chatRepository.addMessage(
      sessionId,
      'MENTOR',
      mentorResponseContent,
    );

    return {
      success: true,
      userMessage,
      mentorMessage,
    };
  }

  async updateSessionContext(
    sessionId: string,
    userId: string,
    dto: UpdateSessionContextDto,
  ) {
    const isOwner = await this.chatRepository.verifySessionOwnership(
      sessionId,
      userId,
    );

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    return this.chatRepository.updateSessionContext(sessionId, dto);
  }

  async updateSessionTitle(
    sessionId: string,
    userId: string,
    dto: UpdateSessionTitleDto,
  ) {
    const isOwner = await this.chatRepository.verifySessionOwnership(
      sessionId,
      userId,
    );

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    return this.chatRepository.updateSessionTitle(sessionId, dto);
  }

  private async buildSystemPrompt(session: any): Promise<string> {
    const contextParts: string[] = [];

    const recentMessages = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (recentMessages.length > 0) {
      const history = recentMessages
        .map((message) =>
          `${message.sender === 'USER' ? 'Student' : 'Mentor'}: ${message.content}`,
        )
        .join('\n');

      contextParts.push(`Conversation History:\n${history}`);
    }

    if (session.activeLessonId) {
      try {
        const lesson = await this.prisma.lesson.findUnique({
          where: { id: session.activeLessonId },
          include: {
            module: {
              include: {
                track: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        });

        if (lesson) {
          if (lesson.module?.track?.program) {
            contextParts.push(`Program: ${lesson.module.track.program.title}`);
          }

          if (lesson.module) {
            contextParts.push(`Module: ${lesson.module.title}`);
          }

          contextParts.push(`Lesson: ${lesson.title}`);

          if ((lesson as any).objectives) {
            contextParts.push(
              `Learning Objectives: ${(lesson as any).objectives}`,
            );
          }

          if (lesson.content) {
            const contentSummary = lesson.content.substring(0, 800);
            contextParts.push(
              `Lesson Content: ${contentSummary}${
                lesson.content.length > 800 ? '...' : ''
              }`,
            );
          }

          if ((lesson as any).prerequisites) {
            contextParts.push(`Prerequisites: ${(lesson as any).prerequisites}`);
          }
        }
      } catch (error) {
        console.warn('Error fetching lesson context:', error);
      }
    }

    const basePrompt = `You are an AI Mentor for the Dezai educational platform.
Your role is to help students learn effectively through:
- Explaining concepts clearly and concisely
- Breaking down complex topics into manageable parts
- Providing relevant examples and analogies
- Encouraging deeper understanding through questions
- Supporting students in their learning journey

${
  contextParts.length > 0
    ? `Current Learning Context:\n${contextParts.join(
        '\n',
      )}\n\nPlease tailor your responses to the student's current lesson, learning path, and conversation history. Focus on the lesson content and objectives provided above.`
    : 'Help the student with any learning questions they have.'
}

Keep responses concise (2-3 paragraphs max) and encouraging.
Use markdown for formatting when appropriate.
If the student asks about topics outside the current lesson, gently redirect them back to their studies when possible.`;

    return basePrompt;
  }
}