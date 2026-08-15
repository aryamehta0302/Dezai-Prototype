import { useMutation, useQuery } from '@tanstack/react-query';
import { aiMentorApi } from '../services/ai-mentor-api.service';

export const MENTOR_INTELLIGENCE_KEYS = {
  recommendations: () => ['ai-mentor', 'recommendations'],
};

export const useMentorRecommendations = () => {
  return useQuery({
    queryKey: MENTOR_INTELLIGENCE_KEYS.recommendations(),
    queryFn: aiMentorApi.getRecommendations,
    staleTime: 60000,
  });
};

export const useGenerateRemediation = () => {
  return useMutation({
    mutationFn: (attemptId: string) =>
      aiMentorApi.generateRemediation(attemptId),
  });
};

export const useGenerateLessonSummary = () => {
  return useMutation({
    mutationFn: (lessonId: string) =>
      aiMentorApi.generateLessonSummary(lessonId),
  });
};

export const useGenerateModuleSummary = () => {
  return useMutation({
    mutationFn: (moduleId: string) =>
      aiMentorApi.generateModuleSummary(moduleId),
  });
};

export const useGenerateStudyNotes = () => {
  return useMutation({
    mutationFn: ({
      lessonId,
      saveToNotes,
    }: {
      lessonId: string;
      saveToNotes?: boolean;
    }) => aiMentorApi.generateStudyNotes(lessonId, saveToNotes === true),
  });
};
