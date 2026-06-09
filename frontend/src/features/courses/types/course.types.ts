import { CourseCategory, CertificateTier } from "@/shared/types/common.types";

export interface CourseFilter {
  search: string;
  category: CourseCategory | "ALL";
  tier: CertificateTier | "ALL";
  university: string;
  priceRange: [number, number];
  sortBy: "popular" | "rating" | "price-low" | "price-high" | "newest";
}

export const DEFAULT_FILTERS: CourseFilter = {
  search: "",
  category: "ALL",
  tier: "ALL",
  university: "ALL",
  priceRange: [0, 2000],
  sortBy: "popular",
};
