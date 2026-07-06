export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }

  get retryable(): boolean {
    return (
      this.status === 408 ||
      this.status === 429 ||
      this.status === undefined ||
      (this.status >= 500 && this.status < 600)
    );
  }
}
