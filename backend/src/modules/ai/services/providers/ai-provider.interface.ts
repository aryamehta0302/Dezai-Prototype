/**
 * AIProvider Interface
 * 
 * Defines the contract for AI response generation.
 * Implementations: MockProvider, ClaudeProvider, GeminiProvider, OpenAIProvider
 */
export interface AIProvider {
  /**
   * Generate a response based on the user message and session context.
   * 
   * @param userMessage - The user's question/prompt
   * @param systemPrompt - Context about the current lesson/module/program
   * @returns Promise<string> - The AI mentor's response
   */
  generateResponse(userMessage: string, systemPrompt: string): Promise<string>;

  /**
   * Check if the provider is properly configured (has API key, etc.)
   * 
   * @returns boolean - true if ready to use, false if missing configuration
   */
  isConfigured(): boolean;

  /**
   * Get the provider name for logging/debugging
   * 
   * @returns string - Provider name (e.g., "mock", "claude", "gemini")
   */
  getName(): string;
}
