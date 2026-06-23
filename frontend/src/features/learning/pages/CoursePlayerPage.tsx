"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { courseService } from "@/features/programs/services/course.service";
import { learningApi } from "../services/learning-api.service";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { LessonVideoPlayer } from "../components/lesson-video-player";
import { CourseModuleSidebar } from "../components/course-module-sidebar";
import { LessonMarkdownRenderer } from "../components/lesson-markdown-renderer";
import { LessonResourceList } from "../components/lesson-resource-list";
import { PersonalNotesPanel } from "../components/personal-notes-panel";
import { MarkCompleteButton } from "../components/mark-complete-button";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
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
import { slugify } from "@/shared/utils/slug";
import type { ApiProgram, ApiLessonDetail, ApiModule } from "@/features/programs/types/program.types";

interface CoursePlayerPageProps {
  slug: string;
  lessonId: string;
}

export function CoursePlayerPage({ slug, lessonId }: CoursePlayerPageProps) {
  const { isEnrolled, getEnrollment, setLastAccessedLesson } = useEnrollmentStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const [course, setCourse] = useState<ApiProgram | null>(null);
  const [lessonDetail, setLessonDetail] = useState<ApiLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Load course on mount only (not on every lessonId change)
  useEffect(() => {
    async function load() {
      const program = await courseService.getBySlug(slug);
      setCourse(program);
      setLoading(false);
    }
    load();
  }, [slug]);

  // Fetch lesson content when currentLessonId changes
  const fetchLesson = useCallback(async (id: string) => {
    setLessonDetail(null);
    try {
      const res = await learningApi.getLesson(id);
      if (res.success) setLessonDetail(res.lesson);
    } catch { /* ignore */ }
  }, []);

  // Initial lesson fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    if (lessonId) fetchLesson(lessonId);
  }, []);

  // Update URL silently + fetch lesson content on navigation
  const goToLesson = useCallback((id: string) => {
    setCurrentLessonId(id);
    window.history.replaceState(null, "", `/programs/${slug}/learn/${id}`);
    fetchLesson(id);
  }, [slug, fetchLesson]);

  // Persist last-accessed lesson
  useEffect(() => {
    if (course) {
      setLastAccessedLesson(course.id, currentLessonId);
    }
  }, [course, currentLessonId, setLastAccessedLesson]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16">
        <EmptyState icon={BookOpen} title="Course not found" />
      </div>
    );
  }

  if (!isEnrolled(course.id)) {
    const courseSlug = slugify(course.title);
    return (
      <div className="py-16">
        <EmptyState
          icon={BookOpen}
          title="Not enrolled"
          description="You need to enroll in this program to access lessons."
          action={
            <Link href={`/programs/${courseSlug}`}>
              <Button>View Program</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const allModules: ApiModule[] = course.tracks.flatMap(t => t.modules);
  const allLessons = allModules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentModule = allModules.find(m => m.lessons.some(l => l.id === currentLessonId));
  const enrollment = getEnrollment(course.id);

  const goPrev = () => {
    if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1].id);
  };

  const goNext = () => {
    if (currentIndex < allLessons.length - 1) {
      // Find the first uncompleted lesson after the current index
      const nextUncompleted = allLessons
        .slice(currentIndex + 1)
        .find(l => !enrollment?.lessonsCompleted.some(lc => lc.lessonId === l.id));

      if (nextUncompleted) {
        goToLesson(nextUncompleted.id);
      } else {
        // If all following lessons are completed, just go to the immediate next one
        goToLesson(allLessons[currentIndex + 1].id);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"
          } shrink-0 border-r border-border-light bg-white transition-all duration-300 overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col">
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

          <CourseModuleSidebar
            courseId={course.id}
            modules={allModules}
            currentLessonId={currentLessonId}
            onLessonSelect={(id) => goToLesson(id)}
            className="flex-1 p-2"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-2 top-20 z-10 rounded-lg bg-white border border-border-light p-2 shadow-level-1 hover:bg-surface-low"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {currentModule?.title ?? "Lesson"}
              </p>
              <h1 className="text-xl font-bold text-on-surface">
                {(currentLessonId && allLessons.find(l => l.id === currentLessonId)?.title) ?? "Loading..."}
              </h1>
            </div>

            {lessonDetail?.videoUrl && (
              <LessonVideoPlayer
                title={lessonDetail.title}
                videoUrl={lessonDetail.videoUrl}
              />
            )}

            {lessonDetail?.content && <LessonMarkdownRenderer content={lessonDetail.content} />}

            {lessonDetail?.resources && lessonDetail.resources.length > 0 && (
              <LessonResourceList resources={lessonDetail.resources} className="mt-6" />
            )}

            <div className="border-t border-border-light pt-6">
              <PersonalNotesPanel courseId={course.id} lessonId={currentLessonId} />
            </div>
          </div>
        </div>

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
