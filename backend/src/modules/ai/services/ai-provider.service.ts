import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AIProvider } from './providers/ai-provider.interface';
import { MockProvider } from './providers/mock-provider';
import { ClaudeProvider } from './providers/claude-provider';
import { GeminiProvider } from './providers/gemini-provider';
import { OpenAIProvider } from './providers/openai-provider';
import { AIProviderError } from './providers/provider-error';

const MAX_INPUT_TOKENS = 7_000;
const MAX_ATTEMPTS_PER_PROVIDER = 2;
const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 60_000;
const MIN_REQUEST_INTERVAL_MS = 150;

interface CircuitState {
  failures: number;
  openUntil: number;
  lastRequestAt: number;
}

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private readonly circuits = new Map<string, CircuitState>();
  private lastSuccessfulProvider = 'mock';

  constructor(
    private readonly mockProvider: MockProvider,
    private readonly openAIProvider: OpenAIProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly claudeProvider: ClaudeProvider,
  ) {}

  async generateResponse(
    userMessage: string,
    systemPrompt: string,
  ): Promise<string> {
    const protectedInput = this.protectTokenLimit(userMessage, systemPrompt);
    const providers = this.configuredProviders();
    let lastError: unknown;

    for (const provider of providers) {
      if (this.isCircuitOpen(provider)) continue;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
        try {
          await this.applyRateLimit(provider);
          const response = await provider.generateResponse(
            protectedInput.userMessage,
            protectedInput.systemPrompt,
          );
          this.recordSuccess(provider);
          return response;
        } catch (error) {
          lastError = error;
          const retryable =
            !(error instanceof AIProviderError) || error.retryable;
          this.logger.warn(
            `${provider.getName()} attempt ${attempt} failed: ${
              error instanceof Error ? error.message : 'unknown error'
            }`,
          );
          if (!retryable || attempt === MAX_ATTEMPTS_PER_PROVIDER) break;
          await this.delay(this.retryDelay(error, attempt));
        }
      }

      this.recordFailure(provider);
      this.logger.warn(`Falling back after ${provider.getName()} failure`);
    }

    this.logger.error(
      'All AI providers failed',
      lastError instanceof Error ? lastError.stack : undefined,
    );
    throw new ServiceUnavailableException(
      'The AI Mentor is temporarily unavailable. Please try again shortly.',
    );
  }

  getCurrentProvider(): string {
    return this.lastSuccessfulProvider;
  }

  countTokens(value: string): number {
    if (!value) return 0;
    // A conservative dependency-free approximation suitable for input guards.
    return Math.ceil(value.length / 4);
  }

  private configuredProviders(): AIProvider[] {
    const external = [
      this.openAIProvider,
      this.geminiProvider,
      this.claudeProvider,
    ].filter((provider) => provider.isConfigured());
    return external.length > 0 ? [...external, this.mockProvider] : [this.mockProvider];
  }

  private protectTokenLimit(userMessage: string, systemPrompt: string) {
    const userBudget = Math.min(1_250, this.countTokens(userMessage));
    const systemBudget = MAX_INPUT_TOKENS - userBudget;
    const trimToTokens = (value: string, tokens: number) =>
      value.length > tokens * 4
        ? `${value.slice(0, tokens * 4)}\n[Context truncated to token budget]`
        : value;

    return {
      userMessage: trimToTokens(userMessage, 1_250),
      systemPrompt: trimToTokens(systemPrompt, systemBudget),
    };
  }

  private isCircuitOpen(provider: AIProvider): boolean {
    const state = this.state(provider);
    if (state.openUntil <= Date.now()) {
      state.openUntil = 0;
      return false;
    }
    this.logger.warn(`Skipping ${provider.getName()}: circuit is open`);
    return true;
  }

  private recordSuccess(provider: AIProvider) {
    const state = this.state(provider);
    state.failures = 0;
    state.openUntil = 0;
    this.lastSuccessfulProvider = provider.getName();
  }

  private recordFailure(provider: AIProvider) {
    const state = this.state(provider);
    state.failures++;
    if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
      state.openUntil = Date.now() + CIRCUIT_RESET_MS;
      this.logger.warn(`${provider.getName()} circuit opened for 60 seconds`);
    }
  }

  private async applyRateLimit(provider: AIProvider) {
    const state = this.state(provider);
    const waitMs = Math.max(
      0,
      MIN_REQUEST_INTERVAL_MS - (Date.now() - state.lastRequestAt),
    );
    if (waitMs > 0) await this.delay(waitMs);
    state.lastRequestAt = Date.now();
  }

  private retryDelay(error: unknown, attempt: number): number {
    if (error instanceof AIProviderError && error.retryAfterMs) {
      return Math.min(error.retryAfterMs, 10_000);
    }
    return 250 * 2 ** (attempt - 1);
  }

  private state(provider: AIProvider): CircuitState {
    const name = provider.getName();
    let state = this.circuits.get(name);
    if (!state) {
      state = { failures: 0, openUntil: 0, lastRequestAt: 0 };
      this.circuits.set(name, state);
    }
    return state;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
