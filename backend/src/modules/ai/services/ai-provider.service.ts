import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './providers/ai-provider.interface';
import { MockProvider } from './providers/mock-provider';
import { ClaudeProvider } from './providers/claude-provider';
import { GeminiProvider } from './providers/gemini-provider';

/**
 * AIProviderService - Manages AI provider selection and delegation
 * 
 * Selects the best available provider based on environment configuration:
 * 1. Claude (highest priority if ANTHROPIC_API_KEY is set)
 * 2. Gemini (if GEMINI_API_KEY is set)
 * 3. Mock (always available as fallback)
 */
@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private provider: AIProvider;

  constructor(
    private mockProvider: MockProvider,
    private claudeProvider: ClaudeProvider,
    private geminiProvider: GeminiProvider,
  ) {
    this.provider = this.selectProvider();
  }

  /**
   * Select the best available AI provider
   */
  private selectProvider(): AIProvider {
    // Try Claude first (highest priority)
    if (this.claudeProvider.isConfigured()) {
      this.logger.log('Using Claude AI provider');
      return this.claudeProvider;
    }

    // Fall back to Gemini
    if (this.geminiProvider.isConfigured()) {
      this.logger.log('Using Gemini AI provider');
      return this.geminiProvider;
    }

    // Default to Mock provider
    this.logger.warn(
      'No AI provider configured (missing ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY). Using mock provider.',
    );
    return this.mockProvider;
  }

  /**
   * Generate a response using the selected provider
   */
  async generateResponse(userMessage: string, systemPrompt: string): Promise<string> {
    try {
      return await this.provider.generateResponse(userMessage, systemPrompt);
    } catch (error) {
      this.logger.error(`Error generating response from ${this.provider.getName()}:`, error);

      // Fallback to mock provider if the primary provider fails
      if (this.provider !== this.mockProvider) {
        this.logger.warn('Falling back to mock provider due to error');
        return this.mockProvider.generateResponse(userMessage, systemPrompt);
      }

      throw error;
    }
  }

  /**
   * Get the current provider name
   */
  getCurrentProvider(): string {
    return this.provider.getName();
  }
}
