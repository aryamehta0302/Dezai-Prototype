import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  CreateChatSessionDto,
  SendMessageDto,
  UpdateSessionContextDto,
  ChatSessionResponseDto,
  ChatMessageResponseDto,
} from '../dto/chat.dto';

/**
 * AI Mentor Chat Controller
 * Handles all chat session and messaging operations.
 * All endpoints require JWT authentication.
 */
@Controller('ai-mentor')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/ai-mentor/sessions
   * Retrieve all chat sessions for the authenticated user
   * 
   * Query Parameters:
   * - limit: number (default 50)
   * - offset: number (default 0)
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSessions(
    @Req() req,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const userId = req.user.id;
    const { sessions, total } = await this.chatService.getUserSessions(
      userId,
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      sessions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
  }

  /**
   * POST /api/ai-mentor/sessions
   * Create a new chat session
   * 
   * Body:
   * {
   *   activeProgramId?: string (UUID)
   *   activeModuleId?: string (UUID)
   *   activeLessonId?: string (UUID)
   * }
   */
  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Req() req,
    @Body() dto: CreateChatSessionDto,
  ): Promise<{ success: boolean; session: ChatSessionResponseDto }> {
    const userId = req.user.id;
    const session = await this.chatService.createSession(userId, dto);

    return {
      success: true,
      session,
    };
  }

  /**
   * GET /api/ai-mentor/sessions/:id
   * Retrieve a specific chat session with all its messages
   * 
   * URL Parameters:
   * - id: string (session UUID)
   */
  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSession(
    @Req() req,
    @Param('id') sessionId: string,
  ): Promise<{ success: boolean; session: ChatSessionResponseDto }> {
    const userId = req.user.id;
    const session = await this.chatService.getSession(sessionId, userId);

    return {
      success: true,
      session,
    };
  }

  /**
   * DELETE /api/ai-mentor/sessions/:id
   * Delete a chat session (cascades to all messages)
   * 
   * URL Parameters:
   * - id: string (session UUID)
   */
  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteSession(
    @Req() req,
    @Param('id') sessionId: string,
  ) {
    const userId = req.user.id;
    return this.chatService.deleteSession(sessionId, userId);
  }

  /**
   * POST /api/ai-mentor/chat
   * Send a message to the AI mentor and get a response
   * 
   * Body:
   * {
   *   sessionId: string (UUID) - required
   *   content: string - required, max 5000 chars
   * }
   * 
   * Response:
   * {
   *   success: boolean
   *   userMessage: ChatMessage
   *   mentorMessage: ChatMessage
   * }
   */
  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Req() req,
    @Body() dto: SendMessageDto,
  ) {
    const userId = req.user.id;
    return this.chatService.sendMessage(dto.sessionId, userId, dto);
  }

  /**
   * POST /api/ai-mentor/sessions/:id/context
   * Update the active context for a session
   * (useful when user navigates to a different lesson/module)
   * 
   * URL Parameters:
   * - id: string (session UUID)
   * 
   * Body:
   * {
   *   activeProgramId?: string (UUID)
   *   activeModuleId?: string (UUID)
   *   activeLessonId?: string (UUID)
   * }
   */
  @Post('sessions/:id/context')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateSessionContext(
    @Req() req,
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionContextDto,
  ): Promise<{ success: boolean; session: ChatSessionResponseDto }> {
    const userId = req.user.id;
    const session = await this.chatService.updateSessionContext(
      sessionId,
      userId,
      dto,
    );

    return {
      success: true,
      session,
    };
  }
}
