import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateChatSessionDto, UpdateSessionContextDto } from '../dto/chat.dto';

/**
 * ChatRepository handles all database operations for chat sessions and messages.
 * Acts as the data access layer for the chat feature.
 */
@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chat session for a user
   */
  async createSession(
    userId: string,
    dto: CreateChatSessionDto,
  ) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        activeProgramId: dto.activeProgramId,
        activeModuleId: dto.activeModuleId,
        activeLessonId: dto.activeLessonId,
      },
      include: {
        messages: true,
      },
    });
  }

  /**
   * Get a session by ID with all its messages
   */
  async getSessionById(sessionId: string) {
    return this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get all sessions for a specific user
   */
  async getUserSessions(userId: string, limit: number = 50, offset: number = 0) {
    const sessions = await this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get only the last message as preview
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.chatSession.count({
      where: { userId },
    });

    return { sessions, total };
  }

  /**
   * Add a message to a chat session
   */
  async addMessage(
    sessionId: string,
    sender: 'USER' | 'MENTOR',
    content: string,
  ) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        content,
      },
    });
  }

  /**
   * Get messages for a session with pagination
   */
  async getSessionMessages(
    sessionId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.chatMessage.count({
      where: { sessionId },
    });

    return { messages, total };
  }

  /**
   * Update the active context for a session (active program, module, lesson)
   */
  async updateSessionContext(
    sessionId: string,
    dto: UpdateSessionContextDto,
  ) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        activeProgramId: dto.activeProgramId ?? undefined,
        activeModuleId: dto.activeModuleId ?? undefined,
        activeLessonId: dto.activeLessonId ?? undefined,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Delete a session and all its messages (cascaded by Prisma)
   */
  async deleteSession(sessionId: string) {
    return this.prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Check if session belongs to user
   */
  async verifySessionOwnership(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    return session?.userId === userId;
  }
}
