import { AIProviderService } from './ai-provider.service';
import { AIProviderError } from './providers/provider-error';

const provider = (
  name: string,
  configured: boolean,
  generateResponse: jest.Mock,
) => ({
  getName: () => name,
  isConfigured: () => configured,
  generateResponse,
});

describe('AIProviderService', () => {
  it('falls back in OpenAI -> Gemini order when a provider fails', async () => {
    const mock = provider('mock', true, jest.fn().mockResolvedValue('mock'));
    const openai = provider(
      'openai',
      true,
      jest.fn().mockRejectedValue(new AIProviderError('bad request', 400)),
    );
    const gemini = provider(
      'gemini',
      true,
      jest.fn().mockResolvedValue('gemini answer'),
    );
    const claude = provider('claude', true, jest.fn());
    const service = new AIProviderService(
      mock as never,
      openai as never,
      gemini as never,
      claude as never,
    );

    await expect(service.generateResponse('question', 'context')).resolves.toBe(
      'gemini answer',
    );
    expect(openai.generateResponse).toHaveBeenCalledTimes(1);
    expect(gemini.generateResponse).toHaveBeenCalledTimes(1);
    expect(claude.generateResponse).not.toHaveBeenCalled();
    expect(service.getCurrentProvider()).toBe('gemini');
  });

  it('retries a transient failure before falling back', async () => {
    jest.useFakeTimers();
    const mock = provider('mock', true, jest.fn());
    const openai = provider(
      'openai',
      true,
      jest
        .fn()
        .mockRejectedValueOnce(new AIProviderError('rate limited', 429))
        .mockResolvedValueOnce('recovered'),
    );
    const service = new AIProviderService(
      mock as never,
      openai as never,
      provider('gemini', false, jest.fn()) as never,
      provider('claude', false, jest.fn()) as never,
    );

    const result = service.generateResponse('question', 'context');
    await jest.advanceTimersByTimeAsync(500);
    await expect(result).resolves.toBe('recovered');
    expect(openai.generateResponse).toHaveBeenCalledTimes(2);
    expect(mock.generateResponse).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('counts and protects oversized prompt input', async () => {
    const mock = provider(
      'mock',
      true,
      jest.fn().mockResolvedValue('protected'),
    );
    const service = new AIProviderService(
      mock as never,
      provider('openai', false, jest.fn()) as never,
      provider('gemini', false, jest.fn()) as never,
      provider('claude', false, jest.fn()) as never,
    );

    await service.generateResponse('q'.repeat(10_000), 'c'.repeat(40_000));
    const [userMessage, systemPrompt] = mock.generateResponse.mock.calls[0];
    expect(service.countTokens('12345678')).toBe(2);
    expect(userMessage.length).toBeLessThan(5_100);
    expect(systemPrompt.length).toBeLessThan(23_100);
  });
});
