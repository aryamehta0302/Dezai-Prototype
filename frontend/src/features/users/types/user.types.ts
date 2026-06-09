export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedAt: string;
  universityName?: string;
}

export interface ProfileStats {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  xpEarned: number;
  learningStreak: number;
  hoursLearned: number;
}

export interface ActivityItem {
  id: string;
  type: "enrollment" | "completion" | "certificate" | "quiz" | "achievement";
  title: string;
  description: string;
  timestamp: string;
}
