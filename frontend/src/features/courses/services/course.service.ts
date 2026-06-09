import { mockCourses, getCourseBySlug, getCourseById, type MockCourse } from "@/lib/mock-data/courses";
import { mockInstructors } from "@/lib/mock-data/instructors";
import type { CourseFilter } from "../types/course.types";
import { CourseCategory, CertificateTier } from "@/shared/types/common.types";

export const courseService = {
  /**
   * Get all courses, optionally filtered.
   */
  getCourses: (filters?: Partial<CourseFilter>): MockCourse[] => {
    let courses = [...mockCourses];

    if (filters) {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.shortDescription.toLowerCase().includes(q) ||
            c.instructorName.toLowerCase().includes(q) ||
            c.universityName.toLowerCase().includes(q)
        );
      }

      // Category
      if (filters.category && filters.category !== "ALL") {
        courses = courses.filter((c) => c.category === filters.category);
      }

      // Tier
      if (filters.tier && filters.tier !== "ALL") {
        courses = courses.filter((c) => c.tier === filters.tier);
      }

      // University
      if (filters.university && filters.university !== "ALL") {
        courses = courses.filter((c) => c.universityId === filters.university);
      }

      // Price range
      if (filters.priceRange) {
        courses = courses.filter(
          (c) =>
            c.price >= filters.priceRange![0] &&
            c.price <= filters.priceRange![1]
        );
      }

      // Sort
      switch (filters.sortBy) {
        case "rating":
          courses.sort((a, b) => b.rating - a.rating);
          break;
        case "price-low":
          courses.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          courses.sort((a, b) => b.price - a.price);
          break;
        case "popular":
        default:
          courses.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
          break;
      }
    }

    return courses;
  },

  getBySlug: getCourseBySlug,
  getById: getCourseById,

  getCategories: (): { value: string; label: string; count: number }[] => [
    { value: "ALL", label: "All Categories", count: mockCourses.length },
    {
      value: CourseCategory.AI,
      label: "Artificial Intelligence",
      count: mockCourses.filter((c) => c.category === CourseCategory.AI).length,
    },
    {
      value: CourseCategory.COMMERCE,
      label: "Commerce & Business",
      count: mockCourses.filter((c) => c.category === CourseCategory.COMMERCE).length,
    },
    {
      value: CourseCategory.DESIGN,
      label: "Design",
      count: mockCourses.filter((c) => c.category === CourseCategory.DESIGN).length,
    },
  ],

  getTiers: (): { value: string; label: string; description: string }[] => [
    { value: "ALL", label: "All Tiers", description: "" },
    { value: CertificateTier.TIER_1, label: "Tier 1 — Foundational", description: "Dezai Core certification" },
    { value: CertificateTier.TIER_2, label: "Tier 2 — Academic", description: "University accredited" },
    { value: CertificateTier.TIER_3, label: "Tier 3 — Professional", description: "Industry verified" },
  ],

  getRelatedCourses: (courseId: string, limit: number = 4): MockCourse[] => {
    const course = getCourseById(courseId);
    if (!course) return [];
    return mockCourses
      .filter((c) => c.id !== courseId && c.category === course.category)
      .slice(0, limit);
  },

  getInstructor: (instructorId: string) => {
    return mockInstructors.find((i) => i.id === instructorId);
  },
};
