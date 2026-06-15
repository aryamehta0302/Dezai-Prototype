"use client";

import { CourseCard } from "./course-card";
import { courseService } from "../services/course.service";

interface RelatedCoursesProps {
  courseId: string;
}

export function RelatedCourses({ courseId }: RelatedCoursesProps) {
  const courses = courseService.getRelatedCourses(courseId, 4);

  if (courses.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-on-surface">Related Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-in-staggered">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
