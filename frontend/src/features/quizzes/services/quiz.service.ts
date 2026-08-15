import { getQuizById, getQuizByCourseId, type MockQuiz } from "@/lib/mock-data/quizzes";

function getCourseIdFromSlug(slug: string): string | undefined {
  const mapping: Record<string, string> = {
    "generative-ai-for-leaders-strategic-implementation": "course-1",
    "machine-learning-fundamentals": "course-2",
    "deep-learning-masterclass": "course-3",
    "ai-ethics-governance": "course-4",
    "digital-marketing-strategy": "course-5",
    "financial-technology-innovation": "course-6",
    "e-commerce-operations-management": "course-7",
    "business-analytics-decision-making": "course-8",
    "ui-ux-design-principles": "course-9",
    "design-thinking-for-innovation": "course-10",
    "visual-communication-storytelling": "course-11",
    "product-design-from-concept-to-launch": "course-12",
  };
  return mapping[slug];
}

export const quizService = {
  getQuiz: (quizId: string, slug?: string): MockQuiz | undefined => {
    let quiz = getQuizById(quizId);
    if (!quiz && slug) {
      const courseId = getCourseIdFromSlug(slug);
      if (courseId) {
        quiz = getQuizByCourseId(courseId);
      }
    }
    return quiz;
  },

  calculateScore: (
    quiz: MockQuiz,
    answers: Record<string, number | null>
  ): { score: number; totalPoints: number; percentage: number; passed: boolean } => {
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q) => {
      totalPoints += q.points;
      if (answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    return {
      score,
      totalPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
    };
  },

  getAnsweredCount: (answers: Record<string, number | null>): number => {
    return Object.values(answers).filter((a) => a !== null).length;
  },
};
