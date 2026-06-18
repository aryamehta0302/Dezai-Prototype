import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for creating a new chat session
 */
export class CreateChatSessionDto {
  @IsUUID()
  @IsOptional()
  activeProgramId?: string;

  @IsUUID()
  @IsOptional()
  activeModuleId?: string;

  @IsUUID()
  @IsOptional()
  activeLessonId?: string;
}

/**
 * DTO for sending a message in a chat session
 */
export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}

/**
 * DTO for updating session context
 */
export class UpdateSessionContextDto {
  @IsUUID()
  @IsOptional()
  activeProgramId?: string;

  @IsUUID()
  @IsOptional()
  activeModuleId?: string;

  @IsUUID()
  @IsOptional()
  activeLessonId?: string;
}

/**
 * Response DTO for chat message
 */
export class ChatMessageResponseDto {
  id: string;
  sessionId: string;
  sender: 'USER' | 'MENTOR';
  content: string;
  createdAt: Date;
}

/**
 * Response DTO for chat session
 */
export class ChatSessionResponseDto {
  id: string;
  userId: string;
  activeProgramId?: string;
  activeModuleId?: string;
  activeLessonId?: string;
  createdAt: Date;
  messages?: ChatMessageResponseDto[];
}
