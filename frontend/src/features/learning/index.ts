/**
 * @module features/learning
 * Course player & progress tracking feature.
 */

export { ContinueLearningCard } from "./components/continue-learning-card";
export { EnrolledCourseCard } from "./components/enrolled-course-card";
export { CourseProgressPill } from "./components/course-progress-pill";
export { LessonVideoPlayer } from "./components/lesson-video-player";
export { CourseModuleSidebar } from "./components/course-module-sidebar";
export { LessonMarkdownRenderer } from "./components/lesson-markdown-renderer";
export { LessonResourceList } from "./components/lesson-resource-list";
export { PersonalNotesPanel } from "./components/personal-notes-panel";
export { MarkCompleteButton } from "./components/mark-complete-button";

export { useProgress } from "./hooks/useProgress";
export { useNotes } from "./hooks/useNotes";

export { learningService } from "./services/learning.service";
export { lessonService } from "./services/lesson.service";

export { StudentDashboardPage } from "./pages/StudentDashboardPage";
export { CoursePlayerPage } from "./pages/CoursePlayerPage";

export type { LessonProgress, CourseProgress, DashboardStats, PlayerState, Note } from "./types/learning.types";
