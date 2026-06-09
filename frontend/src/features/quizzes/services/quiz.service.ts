import { getQuizById, type MockQuiz } from "@/lib/mock-data/quizzes";

export const quizService = {
  getQuiz: (quizId: string): MockQuiz | undefined => getQuizById(quizId),

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
