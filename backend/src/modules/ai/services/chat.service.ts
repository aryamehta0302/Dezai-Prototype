import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { AIProviderService } from './ai-provider.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { PromptBuilderService } from './prompt-builder.service';
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
    private auditService: AuditService,
    private promptBuilderService: PromptBuilderService,
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

    const systemPrompt = await this.promptBuilderService.buildChatPrompt(
      session,
      dto.content,
    );

    let mentorResponseContent: string;
    try {
      mentorResponseContent = await this.aiProviderService.generateResponse(
        dto.content,
        systemPrompt,
      );
    } catch (error) {
      // Keep retries idempotent: a failed provider call must not leave an
      // unanswered user message that will be duplicated by the UI retry.
      await this.chatRepository.deleteMessage(userMessage.id);
      throw error;
    }

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

}
