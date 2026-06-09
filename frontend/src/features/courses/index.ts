/**
 * @module features/courses
 * Course catalog, details & enrollment feature.
 */

export { CourseCard } from "./components/course-card";
export { CourseHero } from "./components/course-hero";
export { SyllabusAccordion } from "./components/syllabus-accordion";
export { InstructorCard } from "./components/instructor-card";
export { EnrollmentCTA } from "./components/enrollment-cta";
export { CourseFilters } from "./components/course-filters";
export { CheckoutModal } from "./components/checkout-modal";
export { RelatedCourses } from "./components/related-courses";

export { useCourses } from "./hooks/useCourses";
export { useEnrollment } from "./hooks/useEnrollment";
export { courseService } from "./services/course.service";

export { CatalogPage } from "./pages/CatalogPage";
export { CourseDetailPage } from "./pages/CourseDetailPage";

export type { CourseFilter } from "./types/course.types";
