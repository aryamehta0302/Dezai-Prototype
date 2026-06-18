export type AchievementType = "STREAK" | "COMPLETION" | "PERFORMANCE" | "XP" | "SOCIAL";

export interface Achievement {
    id: string;
    type: AchievementType;
    title: string;
    description: string;
    icon: string;
    xpValue: number;
    unlockedAt?: string;
    progress?: number; // 0-100
    target?: number;
    current?: number;
    isUnlocked: boolean;
    rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

export interface StudentStats {
    xp: number;
    level: number;
    nextLevelXp: number;
    progressToNextLevel: number; // 0-100
    streakCount: number;
    enrolledCourses: number;
    completedCourses: number;
    totalHours: number;
}
