import { programsApi } from "./programs-api.service";
import { slugify } from "@/shared/utils/slug";
import type { ApiProgram, ApiTrack, ApiModule } from "../types/program.types";
import { CourseCategory, CertificateTier } from "@/shared/types/common.types";
import type { CourseFilter } from "../types/course.types";

let cachedPrograms: ApiProgram[] | null = null;
let cachedSlugMap: Map<string, ApiProgram> | null = null;

function buildSlugMap(programs: ApiProgram[]): Map<string, ApiProgram> {
  const map = new Map<string, ApiProgram>();
  for (const p of programs) {
    map.set(slugify(p.title), p);
  }
  return map;
}

function getCategoryFromProgram(_program: ApiProgram): CourseCategory {
  return CourseCategory.AI;
}

function getTierFromProgram(_program: ApiProgram): CertificateTier {
  return CertificateTier.TIER_1;
}

function getTotalLessons(tracks: ApiTrack[]): number {
  return tracks.reduce((sum, t) =>
    sum + t.modules.reduce((msum, m) => msum + m.lessons.length, 0), 0);
}

function getTotalModules(tracks: ApiTrack[]): number {
  return tracks.reduce((sum, t) => sum + t.modules.length, 0);
}

function flattenLessons(tracks: ApiTrack[]): ApiModule["lessons"] {
  return tracks.flatMap(t => t.modules.flatMap(m => m.lessons));
}

export const courseService = {
  async loadPrograms(): Promise<ApiProgram[]> {
    if (cachedPrograms) return cachedPrograms;
    const res = await programsApi.getAll();
    if (res.success) {
      cachedPrograms = res.programs;
      cachedSlugMap = buildSlugMap(res.programs);
      return res.programs;
    }
    return [];
  },

  invalidateCache() {
    cachedPrograms = null;
    cachedSlugMap = null;
  },

  async getCourses(filters?: Partial<CourseFilter>): Promise<ApiProgram[]> {
    let courses = await this.loadPrograms();

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.institution?.name.toLowerCase().includes(q) ||
            c.faculty?.user.name.toLowerCase().includes(q)
        );
      }

      if (filters.sortBy === "popular" || !filters.sortBy) {
        // no enrollment count on Program, keep as-is
      }
    }

    return courses;
  },

  async getBySlug(slug: string): Promise<ApiProgram | null> {
    await this.loadPrograms();
    return cachedSlugMap?.get(slug) ?? null;
  },

  async getById(id: string): Promise<ApiProgram | null> {
    try {
      const res = await programsApi.getById(id);
      if (res.success) return res.program;
    } catch { /* ignore */ }
    return null;
  },

  async getCategories(): Promise<{ value: string; label: string; count: number }[]> {
    const courses = await this.loadPrograms();
    return [
      { value: "ALL", label: "All Categories", count: courses.length },
      { value: CourseCategory.AI, label: "Artificial Intelligence", count: courses.length },
      { value: CourseCategory.COMMERCE, label: "Commerce & Business", count: 0 },
      { value: CourseCategory.DESIGN, label: "Design", count: 0 },
    ];
  },

  getTiers(): { value: string; label: string; description: string }[] {
    return [
      { value: "ALL", label: "All Tiers", description: "" },
      { value: CertificateTier.TIER_1, label: "Tier 1 — Foundational", description: "Dezai Core certification" },
      { value: CertificateTier.TIER_2, label: "Tier 2 — Academic", description: "University accredited" },
      { value: CertificateTier.TIER_3, label: "Tier 3 — Professional", description: "Industry verified" },
    ];
  },

  async getRelatedCourses(_programId: string, _limit: number = 4): Promise<ApiProgram[]> {
    const courses = await this.loadPrograms();
    return courses.slice(0, _limit);
  },

  getTotalLessons,
  getTotalModules,
  flattenLessons,
};
