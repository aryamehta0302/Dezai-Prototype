import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { AIProviderService } from './services/ai-provider.service';
import { MockProvider } from './services/providers/mock-provider';
import { ClaudeProvider } from './services/providers/claude-provider';
import { GeminiProvider } from './services/providers/gemini-provider';

/**
 * AI Mentor Module
 * 
 * Handles all chat session and AI mentor messaging features.
 * Uses existing ChatSession and ChatMessage Prisma models.
 * 
 * Supports multiple LLM providers (Claude, Gemini, Mock fallback)
 * with automatic selection based on environment configuration.
 * 
 * Phase 1: CRUD + Mock responses with context injection
 * Phase 2: Claude/Gemini/OpenAI integration with streaming
 * Phase 3: Advanced RAG, semantic search, conversation memory
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    AIProviderService,
    MockProvider,
    ClaudeProvider,
    GeminiProvider,
  ],
  exports: [ChatService],
})
export class AiModule {}
