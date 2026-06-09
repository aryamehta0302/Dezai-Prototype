"use client";

import { create } from "zustand";

export interface QuizStoreState {
  // Active quiz
  activeQuizId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, number | null>; // questionId -> selected option index
  flaggedQuestions: Set<string>;
  timeRemaining: number; // seconds
  isSubmitted: boolean;
  tabSwitchCount: number;

  // Results
  score: number | null;
  totalPoints: number | null;
  passed: boolean | null;

  // Actions
  startQuiz: (quizId: string, durationSeconds: number, questionIds: string[]) => void;
  selectAnswer: (questionId: string, optionIndex: number) => void;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: (totalQuestions: number) => void;
  prevQuestion: () => void;
  decrementTimer: () => void;
  recordTabSwitch: () => void;
  submitQuiz: (score: number, totalPoints: number, passingScore: number) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStoreState>()((set, get) => ({
  activeQuizId: null,
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: new Set(),
  timeRemaining: 0,
  isSubmitted: false,
  tabSwitchCount: 0,
  score: null,
  totalPoints: null,
  passed: null,

  startQuiz: (quizId, durationSeconds, questionIds) =>
    set({
      activeQuizId: quizId,
      currentQuestionIndex: 0,
      answers: Object.fromEntries(questionIds.map((id) => [id, null])),
      flaggedQuestions: new Set(),
      timeRemaining: durationSeconds,
      isSubmitted: false,
      tabSwitchCount: 0,
      score: null,
      totalPoints: null,
      passed: null,
    }),

  selectAnswer: (questionId, optionIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionIndex },
    })),

  toggleFlag: (questionId) =>
    set((state) => {
      const newFlagged = new Set(state.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return { flaggedQuestions: newFlagged };
    }),

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  nextQuestion: (totalQuestions) =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, totalQuestions - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  decrementTimer: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),

  recordTabSwitch: () =>
    set((state) => ({
      tabSwitchCount: state.tabSwitchCount + 1,
    })),

  submitQuiz: (score, totalPoints, passingScore) =>
    set({
      isSubmitted: true,
      score,
      totalPoints,
      passed: (score / totalPoints) * 100 >= passingScore,
    }),

  resetQuiz: () =>
    set({
      activeQuizId: null,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: new Set(),
      timeRemaining: 0,
      isSubmitted: false,
      tabSwitchCount: 0,
      score: null,
      totalPoints: null,
      passed: null,
    }),
}));
