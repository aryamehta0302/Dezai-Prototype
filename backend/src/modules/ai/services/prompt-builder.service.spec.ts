import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService', () => {
  const prisma = {
    chatMessage: { findMany: jest.fn() },
    lesson: { findUnique: jest.fn() },
    module: { findUnique: jest.fn() },
    program: { findUnique: jest.fn() },
  };
  const service = new PromptBuilderService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('uses only bounded recent history and a relevant lesson excerpt', async () => {
    prisma.chatMessage.findMany.mockResolvedValue([
      { sender: 'USER', content: 'current question' },
      { sender: 'MENTOR', content: 'recent answer' },
      { sender: 'USER', content: 'recent setup' },
    ]);
    prisma.lesson.findUnique.mockResolvedValue({
      title: 'Neural Networks',
      content:
        `${'Unrelated background material. '.repeat(100)}\n\n` +
        'Backpropagation computes gradients through the chain rule. '.repeat(20),
      module: {
        title: 'Machine Learning',
        track: { program: { title: 'AI Foundations' } },
      },
    });

    const prompt = await service.buildChatPrompt(
      { id: 'session', activeLessonId: 'lesson' },
      'How does backpropagation use gradients?',
    );

    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        take: 9,
      }),
    );
    expect(prompt).toContain('Backpropagation computes gradients');
    expect(prompt).toContain('Student: recent setup');
    expect(prompt).not.toContain('current question');
    expect(prompt.length).toBeLessThan(5_500);
  });

  it('keeps content digests inside their character budget', () => {
    const digest = service.buildContentDigest(
      'General text. '.repeat(500) +
        'Important clustering objective and centroid update. '.repeat(20),
      'clustering centroid',
      700,
    );
    expect(digest.length).toBeLessThanOrEqual(700);
    expect(digest).toContain('clustering');
  });
});
