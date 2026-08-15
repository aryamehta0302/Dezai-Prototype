import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError } from './provider-error';

/**
 * GeminiProvider - Google Gemini REST integration.
 * Requires GEMINI_API_KEY environment variable.
 * 
 * Uses Gemini Pro for context-aware educational responses.
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly apiKey: string | undefined;
  private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Generate response using Gemini API
   * 
   * Calls the Gemini generateContent endpoint. Resilience is handled by
   * AIProviderService so every provider follows the same policy.
   */
  async generateResponse(userMessage: string, systemPrompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider is not configured (missing GEMINI_API_KEY)');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    ).catch((error: Error) => {
      throw new AIProviderError(`Gemini request failed: ${error.message}`);
    });
    if (!response.ok) {
      const retryAfter = Number(response.headers.get('retry-after'));
      throw new AIProviderError(
        `Gemini request failed (${response.status})`,
        response.status,
        Number.isFinite(retryAfter) ? retryAfter * 1000 : undefined,
      );
    }
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new AIProviderError('Gemini returned an empty response');
    return text;
  }

  /**
   * Check if Gemini provider is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Return provider name
   */
  getName(): string {
    return 'gemini';
  }
}
