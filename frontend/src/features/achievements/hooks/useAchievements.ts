"use client";

import { useMemo } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { achievementService } from "../services/achievement.service";
import { StudentStats } from "../types/achievement.types";

export function useAchievements() {
    const { xpEarned, enrollments, streakCount, hoursLearned } = useEnrollmentStore();

    const stats: StudentStats = useMemo(() => {
        const enrollmentArr = Object.values(enrollments);
        const completed = enrollmentArr.filter(e => e.progress >= 100).length;

        return {
            xp: xpEarned,
            level: Math.floor(xpEarned / 1000) + 1,
            nextLevelXp: 1000,
            progressToNextLevel: (xpEarned % 1000) / 10,
            streakCount: streakCount || 1,
            enrolledCourses: enrollmentArr.length,
            completedCourses: completed,
            totalHours: hoursLearned || (enrollmentArr.length * 5),
        };
    }, [xpEarned, enrollments, streakCount, hoursLearned]);

    const achievements = useMemo(
        () => achievementService.getAchievements(stats),
        [stats]
    );

    const unlockedCount = useMemo(
        () => achievements.filter(a => a.isUnlocked).length,
        [achievements]
    );

    return {
        stats,
        achievements,
        unlockedCount,
        totalCount: achievements.length,
    };
}
