import { getUserByEmail, type MockUser } from "@/lib/mock-data/students";
import { UserRole } from "@/shared/types/common.types";
import type { LoginCredentials, SignupData } from "../types/auth.types";

export interface AuthResult {
  success: boolean;
  user?: MockUser;
  error?: string;
}

export const authService = {
  /**
   * Mock login: checks email/password against mock users.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = getUserByEmail(credentials.email);

    if (!user) {
      return { success: false, error: "No account found with this email" };
    }

    if (user.password !== credentials.password) {
      return { success: false, error: "Incorrect password" };
    }

    return { success: true, user };
  },

  /**
   * Mock signup: creates a new student user in memory.
   */
  signup: async (data: SignupData): Promise<AuthResult> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if email already exists
    const existing = getUserByEmail(data.email);
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create mock user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.STUDENT,
      avatar: "",
      enrolledCourseIds: [],
      completedCourseIds: [],
      certificateIds: [],
      joinedAt: new Date().toISOString(),
    };

    return { success: true, user: newUser };
  },

  /**
   * Mock logout.
   */
  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  /**
   * Get demo credentials for quick login.
   */
  getDemoCredentials: () => [
    {
      label: "Student Demo",
      email: "student@dezai.com",
      password: "student123",
      role: UserRole.STUDENT,
      description: "Browse courses, enroll, learn, take quizzes",
    },
    {
      label: "University Admin",
      email: "admin@kpgu.edu",
      password: "admin123",
      role: UserRole.UNIVERSITY_ADMIN,
      description: "KPGU dashboard, courses, instructors",
    },
    {
      label: "Dezai Admin",
      email: "superadmin@dezai.com",
      password: "superadmin123",
      role: UserRole.DEZAI_ADMIN,
      description: "Platform analytics, user management",
    },
  ],
};
