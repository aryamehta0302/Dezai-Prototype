import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LearningModule } from '../learning/learning.module';
import { AssessmentsModule } from '../assessments/assessments.module';
import { AuditModule } from '../audit/audit.module';
import { ChatController } from './controllers/chat.controller';
import { IntelligenceController } from './controllers/intelligence.controller';
import { ComplianceKnowledgeController } from './controllers/compliance-knowledge.controller';
import { ChatService } from './services/chat.service';
import { MentorIntelligenceService } from './services/mentor-intelligence.service';
import { ComplianceKnowledgeService } from './services/compliance-knowledge.service';
import { ChatRepository } from './repositories/chat.repository';
import { AIProviderService } from './services/ai-provider.service';
import { MockProvider } from './services/providers/mock-provider';
import { ClaudeProvider } from './services/providers/claude-provider';
import { GeminiProvider } from './services/providers/gemini-provider';
import { OpenAIProvider } from './services/providers/openai-provider';
import { PromptBuilderService } from './services/prompt-builder.service';

@Module({
  imports: [DatabaseModule, LearningModule, AssessmentsModule, AuditModule],
  controllers: [
    ChatController,
    IntelligenceController,
    ComplianceKnowledgeController,
  ],
  providers: [
    ChatService,
    MentorIntelligenceService,
    ComplianceKnowledgeService,
    ChatRepository,
    AIProviderService,
    MockProvider,
    ClaudeProvider,
    GeminiProvider,
    OpenAIProvider,
    PromptBuilderService,
  ],
  exports: [ChatService, MentorIntelligenceService, ComplianceKnowledgeService],
})
export class AiModule {}
