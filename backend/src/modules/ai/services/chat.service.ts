import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ChatRepository } from '../repositories/chat.repository';
import { AIProviderService } from './ai-provider.service';
import { CreateChatSessionDto, SendMessageDto, UpdateSessionContextDto, UpdateSessionTitleDto } from '../dto/chat.dto';

/**
 * ChatService handles business logic for chat sessions and messaging.
 * Uses AIProviderService for generating mentor responses.
 * Injects lesson/module/program context into prompts.
 */
@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private aiProviderService: AIProviderService,
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new chat session for the user
   */
  async createSession(userId: string, dto: CreateChatSessionDto) {
    return this.chatRepository.createSession(userId, dto);
  }

  /**
   * Get a specific session by ID, ensuring the requesting user owns it
   */
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

  /**
   * Get all chat sessions for the authenticated user
   */
  async getUserSessions(userId: string, limit: number = 50, offset: number = 0) {
    return this.chatRepository.getUserSessions(userId, limit, offset);
  }

  /**
   * Delete a chat session, ensuring the requesting user owns it
   */
  async deleteSession(sessionId: string, userId: string) {
    const isOwner = await this.chatRepository.verifySessionOwnership(sessionId, userId);

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    await this.chatRepository.deleteSession(sessionId);

    return { success: true, message: 'Chat session deleted successfully' };
  }

  /**
   * Send a message in a session and get an AI mentor response
   * Returns both the user message and the mentor response
   */
  async sendMessage(sessionId: string, userId: string, dto: SendMessageDto) {
    // Verify session exists and belongs to user
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

    // Save user message
    const userMessage = await this.chatRepository.addMessage(
      sessionId,
      'USER',
      dto.content,
    );

    // Build system prompt with context injection
    const systemPrompt = await this.buildSystemPrompt(session);

    // Generate AI mentor response using configured provider
    const mentorResponseContent = await this.aiProviderService.generateResponse(
      dto.content,
      systemPrompt,
    );

    // Save mentor message
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

  /**
   * Update the active context for a session
   * (useful when user navigates to a different lesson/module)
   */
  async updateSessionContext(
    sessionId: string,
    userId: string,
    dto: UpdateSessionContextDto,
  ) {
    const isOwner = await this.chatRepository.verifySessionOwnership(sessionId, userId);

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    return this.chatRepository.updateSessionContext(sessionId, dto);
  }

  /**
   * Update session title
   */
  async updateSessionTitle(
    sessionId: string,
    userId: string,
    dto: UpdateSessionTitleDto,
  ) {
    const isOwner = await this.chatRepository.verifySessionOwnership(sessionId, userId);

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    return this.chatRepository.updateSessionTitle(sessionId, dto);
  }

  /**
   * Build a system prompt with enhanced context injection
   * Includes lesson/module/program information with objectives and content
   */
  private async buildSystemPrompt(session: any): Promise<string> {
    const contextParts: string[] = [];

    // Add lesson context with full enrichment
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
          // Add program context if available
          if (lesson.module?.track?.program) {
            contextParts.push(`Program: ${lesson.module.track.program.title}`);
          }

          // Add module context if available
          if (lesson.module) {
            contextParts.push(`Module: ${lesson.module.title}`);
          }

          // Add lesson title and details
          contextParts.push(`Lesson: ${lesson.title}`);

          // Add learning objectives if available
          if ((lesson as any).objectives) {
            contextParts.push(`Learning Objectives: ${(lesson as any).objectives}`);
          }

          // Include lesson content (first 800 chars for better context)
          if (lesson.content) {
            const contentSummary = lesson.content.substring(0, 800);
            contextParts.push(`Lesson Content: ${contentSummary}${lesson.content.length > 800 ? '...' : ''}`);
          }

          // Add prerequisites if available
          if ((lesson as any).prerequisites) {
            contextParts.push(`Prerequisites: ${(lesson as any).prerequisites}`);
          }
        }
      } catch (error) {
        // Silently fail context injection, continue with user message
        console.warn('Error fetching lesson context:', error);
      }
    }

    // Build final system prompt with enhanced instructions
    const basePrompt = `You are an AI Mentor for the Dezai educational platform. 
Your role is to help students learn effectively through:
- Explaining concepts clearly and concisely
- Breaking down complex topics into manageable parts
- Providing relevant examples and analogies
- Encouraging deeper understanding through questions
- Supporting students in their learning journey

${
  contextParts.length > 0
    ? `Current Learning Context:\n${contextParts.join('\n')}\n\nPlease tailor your responses to the student's current lesson and learning path. Focus on the lesson content and objectives provided above.`
    : 'Help the student with any learning questions they have.'
}

Keep responses concise (2-3 paragraphs max) and encouraging.
Use markdown for formatting when appropriate.
If the student asks about topics outside the current lesson, gently redirect them back to their studies when possible.`;

    return basePrompt;
  }
}
