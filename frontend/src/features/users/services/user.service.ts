import type { MockUser } from "@/lib/mock-data/students";
import type { ActivityItem } from "../types/user.types";

export const userService = {
  getRecentActivity: (userId: string): ActivityItem[] => {
    // Mock activity data
    return [
      {
        id: "act-1",
        type: "enrollment",
        title: "Enrolled in course",
        description: "Generative AI for Leaders",
        timestamp: "2026-06-07T10:30:00Z",
      },
      {
        id: "act-2",
        type: "certificate",
        title: "Certificate earned",
        description: "AI Ethics & Governance — Grade: A+",
        timestamp: "2026-06-06T14:20:00Z",
      },
      {
        id: "act-3",
        type: "quiz",
        title: "Assessment completed",
        description: "Machine Learning Fundamentals — Score: 92%",
        timestamp: "2026-06-05T16:00:00Z",
      },
      {
        id: "act-4",
        type: "completion",
        title: "Course completed",
        description: "Design Thinking for Innovation",
        timestamp: "2026-06-04T12:00:00Z",
      },
      {
        id: "act-5",
        type: "achievement",
        title: "Achievement unlocked",
        description: "7-day learning streak! 🔥",
        timestamp: "2026-06-03T08:00:00Z",
      },
    ];
  },
};
