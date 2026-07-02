import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError } from './provider-error';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getName(): string {
    return 'openai';
  }

  async generateResponse(
    userMessage: string,
    systemPrompt: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new AIProviderError('OpenAI provider is not configured', 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(20_000),
    }).catch((error: Error) => {
      throw new AIProviderError(`OpenAI request failed: ${error.message}`);
    });

    if (!response.ok) {
      throw await this.toProviderError(response);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AIProviderError('OpenAI returned an empty response');
    return content;
  }

  private async toProviderError(response: Response): Promise<AIProviderError> {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const retryAfter = Number(response.headers.get('retry-after'));
    return new AIProviderError(
      body.error?.message ?? `OpenAI request failed (${response.status})`,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter * 1000 : undefined,
    );
  }
}
