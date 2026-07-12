"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { EmployeeProfile } from "../types/employee-learning.types";

export function useEmployeeProfile() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.getProfile();
      setProfile((res as unknown as { profile: EmployeeProfile }).profile);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { profile, loading, error, refetch: fetch };
}
