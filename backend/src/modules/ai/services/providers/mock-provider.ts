import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';

/**
 * MockProvider - Safe fallback provider for development/testing
 * 
 * Generates contextual mock responses when no real LLM is configured.
 * Used as fallback when ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY is missing.
 */
@Injectable()
export class MockProvider implements AIProvider {
  private readonly mockResponses = [
    'Great question about "{topic}"! 📚 To give you the best answer, I need to understand more about what specifically you\'re trying to learn. Can you elaborate?',
    'I see you\'re asking about "{topic}". 🤔 This is an important concept! Let me break it down: The key principles involve understanding the fundamentals first, then building on them step by step.',
    'That\'s a thoughtful question regarding "{topic}"! ✨ Here are the main points to consider: 1) Start with the basics, 2) Practice with examples, 3) Review and reflect on what you\'ve learned.',
    'Excellent inquiry about "{topic}"! 💡 The answer involves several interconnected concepts. Would you like me to focus on one particular aspect, or would you prefer a comprehensive overview?',
    'You\'re touching on something really important about "{topic}". 🎯 Let me share the key insight: Success comes from understanding both the theory and practice. Let\'s work through this together!',
  ];

  /**
   * Generate a mock response based on the user message
   */
  async generateResponse(userMessage: string, systemPrompt: string): Promise<string> {
    // Extract a topic from the user message (first 30 chars or until punctuation)
    const topic = userMessage.substring(0, Math.min(30, userMessage.length)).replace(/[?!.]+$/, '');

    // Select a random response
    const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    let response = this.mockResponses[randomIndex];

    // Replace {topic} placeholder with actual topic
    response = response.replace('{topic}', topic);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return response;
  }

  /**
   * Mock provider is always configured (no external dependencies)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Return provider name
   */
  getName(): string {
    return 'mock';
  }
}
