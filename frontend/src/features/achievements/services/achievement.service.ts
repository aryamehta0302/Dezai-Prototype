import { Achievement, StudentStats } from "../types/achievement.types";

const ACHIEVEMENTS_LIBRARY: Omit<Achievement, "isUnlocked">[] = [
    {
        id: "streak-1",
        type: "STREAK",
        title: "Consistency is Key",
        description: "Launch Dezai 3 days in a row.",
        icon: "Flame",
        xpValue: 100,
        target: 3,
        rarity: "COMMON",
    },
    {
        id: "streak-2",
        type: "STREAK",
        title: "Unstoppable",
        description: "Maintain a 7-day learning streak.",
        icon: "Zap",
        xpValue: 500,
        target: 7,
        rarity: "RARE",
    },
    {
        id: "xp-1",
        type: "XP",
        title: "First Steps",
        description: "Earn your first 500 XP.",
        icon: "Star",
        xpValue: 50,
        target: 500,
        rarity: "COMMON",
    },
    {
        id: "xp-2",
        type: "XP",
        title: "Power Learner",
        description: "Reach 5,000 total XP.",
        icon: "Trophy",
        xpValue: 1000,
        target: 5000,
        rarity: "EPIC",
    },
    {
        id: "completion-1",
        type: "COMPLETION",
        title: "Program Graduate",
        description: "Complete your first learning program.",
        icon: "GraduationCap",
        xpValue: 1000,
        target: 1,
        rarity: "RARE",
    },
];

export const achievementService = {
    getAchievements: (stats: StudentStats): Achievement[] => {
        return ACHIEVEMENTS_LIBRARY.map((a) => {
            let current = 0;
            switch (a.type) {
                case "STREAK":
                    current = stats.streakCount;
                    break;
                case "XP":
                    current = stats.xp;
                    break;
                case "COMPLETION":
                    current = stats.completedCourses;
                    break;
                default:
                    current = 0;
            }

            const isUnlocked = current >= (a.target || 0);
            return {
                ...a,
                current,
                isUnlocked,
                progress: Math.min(100, Math.round((current / (a.target || 1)) * 100)),
            } as Achievement;
        });
    },

    calculateLevel: (xp: number) => {
        // Basic level logic: 1000 XP per level
        const level = Math.floor(xp / 1000) + 1;
        const currentLevelXp = xp % 1000;
        const progress = (currentLevelXp / 1000) * 100;
        return {
            level,
            nextLevelXp: 1000,
            currentLevelXp,
            progress,
        };
    },
};
