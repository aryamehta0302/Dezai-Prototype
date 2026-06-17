import { apiClient } from "@/core/api/client";
import type {
  ApiProgramsResponse,
  ApiProgramResponse,
} from "../types/program.types";

export const programsApi = {
  getAll: () =>
    apiClient.get<ApiProgramsResponse>("/programs"),

  getById: (id: string) =>
    apiClient.get<ApiProgramResponse>(`/programs/${id}`),
};
