import { CourseEnrollment } from "@/lib/stores/enrollment.store";
import { Achievement } from "@/features/achievements/types/achievement.types";

export type ActivityType = "ENROLLMENT" | "COMPLETION" | "PROGRESS" | "XP" | "ACHIEVEMENT";

export interface ActivityEvent {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    xp?: number;
}

export const activityService = {
    getEvents: (
        enrollments: Record<string, CourseEnrollment>,
        achievements: Achievement[],
        programsMap: Record<string, { title: string }> = {}
    ): ActivityEvent[] => {
        const events: ActivityEvent[] = [];

        // Enrollments & Completions
        Object.values(enrollments).forEach(enrollment => {
            const programTitle = programsMap[enrollment.courseId]?.title || enrollment.courseId;

            events.push({
                id: `enroll-${enrollment.id}`,
                type: "ENROLLMENT",
                title: "Enrolled in Program",
                description: `Successfully joined ${programTitle}`,
                timestamp: enrollment.enrolledAt,
            });

            if (enrollment.progress === 100) {
                events.push({
                    id: `comp-${enrollment.id}`,
                    type: "COMPLETION",
                    title: "Program Completed",
                    description: `Excellent work! You finished ${programTitle}`,
                    timestamp: enrollment.enrolledAt,
                });
            }
        });

        // Achievement Unlocks
        achievements.filter(a => a.isUnlocked).forEach(a => {
            events.push({
                id: `ach-${a.id}`,
                type: "ACHIEVEMENT",
                title: "Achievement Unlocked",
                description: `${a.title}: ${a.description}`,
                timestamp: a.unlockedAt || new Date().toISOString(),
            });
        });

        // Sort by timestamp desc
        return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
};
