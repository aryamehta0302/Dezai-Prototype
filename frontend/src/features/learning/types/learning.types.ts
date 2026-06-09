export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  universityName: string;
  instructorName: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessedLessonId?: string;
  lastAccessedAt?: string;
}

export interface PlayerState {
  courseId: string;
  courseSlug: string;
  currentLessonId: string;
  currentModuleId: string;
  isPlaying: boolean;
  playbackPosition: number;
}

export interface Note {
  id: string;
  lessonId: string;
  courseId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  xpEarned: number;
  learningStreak: number;
  hoursLearned: number;
}
