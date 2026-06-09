"use client";

import type { MockQuestion } from "@/lib/mock-data/quizzes";
import { RadioOption } from "./radio-option";

interface QuestionCardProps {
  question: MockQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  showCorrectAnswer?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer = false,
}: QuestionCardProps) {
  return (
    <div className="space-y-6 no-select">
      {/* Question Header */}
      <div className="space-y-2">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-lg font-semibold text-on-surface leading-relaxed">
          {question.text}
        </h2>
        <p className="text-xs text-muted">
          {question.points} point{question.points !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <RadioOption
            key={index}
            label={option}
            index={index}
            selected={selectedAnswer === index}
            onSelect={() => onSelectAnswer(index)}
            isCorrect={showCorrectAnswer ? index === question.correctAnswer : undefined}
            isWrong={
              showCorrectAnswer && selectedAnswer === index && index !== question.correctAnswer
                ? true
                : undefined
            }
            disabled={showCorrectAnswer}
          />
        ))}
      </div>
    </div>
  );
}
