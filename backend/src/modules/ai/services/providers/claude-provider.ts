import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError } from './provider-error';

/**
 * ClaudeProvider - Anthropic Messages API integration.
 * Requires ANTHROPIC_API_KEY environment variable.
 * 
 * Uses Claude 3.5 Sonnet for context-aware educational responses.
 */
@Injectable()
export class ClaudeProvider implements AIProvider {
  private readonly apiKey: string | undefined;
  private readonly model =
    process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  /**
   * Generate response using Claude API
   * 
   * Calls the Anthropic Messages API. Resilience is handled by
   * AIProviderService so every provider follows the same policy.
   */
  async generateResponse(userMessage: string, systemPrompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Claude provider is not configured (missing ANTHROPIC_API_KEY)');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 800,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(20_000),
    }).catch((error: Error) => {
      throw new AIProviderError(`Claude request failed: ${error.message}`);
    });
    if (!response.ok) {
      const retryAfter = Number(response.headers.get('retry-after'));
      throw new AIProviderError(
        `Claude request failed (${response.status})`,
        response.status,
        Number.isFinite(retryAfter) ? retryAfter * 1000 : undefined,
      );
    }
    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((item) => item.type === 'text')?.text?.trim();
    if (!text) throw new AIProviderError('Claude returned an empty response');
    return text;
  }

  /**
   * Check if Claude provider is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Return provider name
   */
  getName(): string {
    return 'claude';
  }
}
