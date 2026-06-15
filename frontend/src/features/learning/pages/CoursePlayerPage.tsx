"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug, type MockCourse } from "@/lib/mock-data/courses";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { lessonService } from "../services/lesson.service";
import { VideoPlayer } from "../components/video-player";
import { CourseModuleSidebar } from "../components/course-module-sidebar";
import { LessonContent } from "../components/lesson-content";
import { PersonalNotesPanel } from "../components/personal-notes-panel";
import { MarkCompleteButton } from "../components/mark-complete-button";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface CoursePlayerPageProps {
  slug: string;
  lessonId: string;
}

export function CoursePlayerPage({ slug, lessonId }: CoursePlayerPageProps) {
  const router = useRouter();
  const course = getCourseBySlug(slug);
  const { isEnrolled, getEnrollment, setLastAccessedLesson } = useEnrollmentStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);

  // Set last accessed lesson
  useEffect(() => {
    if (course) {
      setLastAccessedLesson(course.id, currentLessonId);
    }
  }, [course, currentLessonId, setLastAccessedLesson]);

  if (!course) {
    return (
      <div className="py-16">
        <EmptyState icon={BookOpen} title="Course not found" />
      </div>
    );
  }

  if (!isEnrolled(course.id)) {
    return (
      <div className="py-16">
        <EmptyState
          icon={BookOpen}
          title="Not enrolled"
          description="You need to enroll in this program to access lessons."
          action={
            <Link href={`/programs/${slug}`}>
              <Button>View Program</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const lessonData = lessonService.getLesson(course.id, currentLessonId);
  const content = lessonService.getLessonContent(course.id, currentLessonId);
  const enrollment = getEnrollment(course.id);

  // Flat list of all lesson IDs for prev/next navigation
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  const goToLesson = (id: string) => {
    setCurrentLessonId(id);
    router.replace(`/programs/${slug}/learn/${id}`, { scroll: false });
  };

  const goPrev = () => {
    if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1].id);
  };

  const goNext = () => {
    if (currentIndex < allLessons.length - 1)
      goToLesson(allLessons[currentIndex + 1].id);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div
          className={`${
            sidebarOpen ? "w-80" : "w-0"
          } shrink-0 border-r border-border-light bg-white transition-all duration-300 overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border-light space-y-3">
            <div className="flex items-center justify-between">
              <Link
                href={`/programs/${slug}`}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to program
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-surface-low"
              >
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>
            <h3 className="font-semibold text-sm text-on-surface line-clamp-1">
              {course.title}
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted">
                <span>Progress</span>
                <span>{enrollment?.progress || 0}%</span>
              </div>
              <Progress value={enrollment?.progress || 0} className="h-1.5" />
            </div>
          </div>

          {/* Module List */}
          <CourseModuleSidebar
            courseId={course.id}
            modules={course.modules}
            currentLessonId={currentLessonId}
            onLessonSelect={goToLesson}
            className="flex-1 p-2"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toggle Sidebar (if closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-2 top-20 z-10 rounded-lg bg-white border border-border-light p-2 shadow-level-1 hover:bg-surface-low"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Lesson Title */}
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {lessonData?.module.title}
              </p>
              <h1 className="text-xl font-bold text-on-surface">
                {lessonData?.lesson.title}
              </h1>
            </div>

            {/* Video Player (for video lessons) */}
            {lessonData?.lesson.type === "video" && (
              <VideoPlayer
                title={lessonData.lesson.title}
                duration={lessonData.lesson.duration}
              />
            )}

            {/* Lesson Content */}
            {content && <LessonContent content={content} />}

            {/* Notes */}
            <div className="border-t border-border-light pt-6">
              <PersonalNotesPanel courseId={course.id} lessonId={currentLessonId} />
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-border-light bg-white px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex <= 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <MarkCompleteButton
            courseId={course.id}
            lessonId={currentLessonId}
            onComplete={goNext}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentIndex >= allLessons.length - 1}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
