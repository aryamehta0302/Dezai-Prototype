import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgress } from "@/features/learning/hooks/useProgress";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { activityService } from "../services/activity.service";

export function useProfile() {
  const { user } = useAuthStore();
  const { enrollments } = useEnrollmentStore();
  const { stats } = useProgress();
  const { achievements } = useAchievements();
  const { programs } = useProgramsStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const programsMap = useMemo(() => programs.reduce((acc: any, p) => ({ ...acc, [p.id]: p }), {}), [programs]);

  const activity = useMemo(
    () => (user ? activityService.getEvents(enrollments, achievements, programsMap) : []),
    [user, enrollments, achievements, programsMap]
  );

  return { user, stats, activity };
}
