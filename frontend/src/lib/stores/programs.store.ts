"use client";

import { create } from "zustand";
import { programsApi, type ApiProgram } from "@/features/learning/services/learning-api.service";

interface ProgramsState {
    programs: ApiProgram[];
    isLoading: boolean;
    hasFetched: boolean;
    fetchPrograms: () => Promise<void>;
    getProgramById: (id: string) => ApiProgram | undefined;
}

export const useProgramsStore = create<ProgramsState>((set, get) => ({
    programs: [],
    isLoading: false,
    hasFetched: false,

    fetchPrograms: async () => {
        if (get().hasFetched || get().isLoading) return;
        set({ isLoading: true });
        try {
            const response = await programsApi.getAll();
            if (response.success) {
                set({
                    programs: Array.isArray(response.programs) ? response.programs : [],
                    hasFetched: true
                });
            } else {
                set({ hasFetched: true });
            }
        } catch (err) {
            console.error("Failed to fetch programs:", err);
            set({ hasFetched: true });
        } finally {
            set({ isLoading: false });
        }
    },

    getProgramById: (id: string) => {
        return get().programs.find((p) => p.id === id);
    },
}));
