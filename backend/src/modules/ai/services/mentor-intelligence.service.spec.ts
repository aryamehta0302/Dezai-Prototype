import { MentorIntelligenceService } from './mentor-intelligence.service';

describe('MentorIntelligenceService remediation', () => {
  it('combines attempt evidence, recommends matching lessons, and respects max attempts', async () => {
    const prisma = {
      assessmentAttempt: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'attempt-1',
          userId: 'user-1',
          assessmentId: 'assessment-1',
          completedAt: new Date(),
          assessment: {
            id: 'assessment-1',
            maxAttempts: 5,
            module: {
              lessons: [
                {
                  id: 'lesson-1',
                  moduleId: 'module-1',
                  title: 'Gradient Descent',
                  content: '# Optimization\nGradient descent updates model weights.',
                },
                {
                  id: 'lesson-2',
                  moduleId: 'module-1',
                  title: 'Data Collection',
                  content: 'Collect and validate source data.',
                },
              ],
            },
          },
          attemptAnswers: [
            {
              isCorrect: false,
              question: { category: 'Optimization', difficulty: 'HARD' },
            },
            {
              isCorrect: false,
              question: { category: 'Optimization', difficulty: 'HARD' },
            },
          ],
        }),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    const attemptService = {
      getAttemptResult: jest.fn().mockResolvedValue({
        assessmentTitle: 'ML Check',
        score: 2,
        percentage: 40,
        passed: false,
      }),
    };
    const weakTopics = {
      getStudentWeakTopics: jest.fn().mockResolvedValue([
        {
          category: 'Optimization',
          totalAnswered: 4,
          totalWrong: 3,
          wrongRate: 0.75,
          isWeak: true,
          difficulty: 'HARD',
        },
      ]),
      getIncorrectQuestionAnalysis: jest.fn().mockResolvedValue([
        { questionText: 'How are model weights updated?' },
      ]),
    };
    const ai = { generateResponse: jest.fn().mockResolvedValue('- Review\n- Practice\n- Retake') };
    const service = new MentorIntelligenceService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      attemptService as never,
      weakTopics as never,
      ai as never,
      {} as never,
    );

    const result = await service.generateRemediationPlan(
      'user-1',
      'attempt-1',
    );

    expect(result.weakTopics[0].category).toBe('Optimization');
    expect(result.recommendedLessons[0].title).toBe('Gradient Descent');
    expect(result.recommendedLessons[0].reason).toContain('Optimization');
    expect(result.retakeGuidance.attemptsRemaining).toBe(3);
    expect(result.studyPlan).toHaveLength(3);
    expect(weakTopics.getStudentWeakTopics).toHaveBeenCalled();
  });
});
