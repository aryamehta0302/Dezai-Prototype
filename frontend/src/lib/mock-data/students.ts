import { UserRole } from "@/shared/types/common.types";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  universityId?: string;
  universityName?: string;
  avatar: string;
  major?: string;
  year?: number;
  semester?: string;
  gpa?: number;
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  certificateIds: string[];
  joinedAt: string;
}

export const mockUsers: MockUser[] = [
  // Demo accounts
  {
    id: "user-student-1",
    name: "Aarav Patel",
    email: "student@dezai.com",
    password: "student123",
    role: UserRole.STUDENT,
    universityId: "kpgu",
    universityName: "KPGU",
    avatar: "",
    major: "Computer Science & AI",
    year: 3,
    semester: "Semester 6",
    gpa: 3.92,
    enrolledCourseIds: ["course-1", "course-2", "course-9"],
    completedCourseIds: ["course-4", "course-10"],
    certificateIds: ["cert-1", "cert-2"],
    joinedAt: "2025-08-15",
  },
  {
    id: "user-admin-uni",
    name: "Dr. Harsh Bhatt",
    email: "admin@kpgu.edu",
    password: "admin123",
    role: UserRole.UNIVERSITY_ADMIN,
    universityId: "kpgu",
    universityName: "KPGU",
    avatar: "",
    enrolledCourseIds: [],
    completedCourseIds: [],
    certificateIds: [],
    joinedAt: "2024-01-10",
  },
  {
    id: "user-admin-dezai",
    name: "Riya Desai",
    email: "superadmin@dezai.com",
    password: "superadmin123",
    role: UserRole.DEZAI_ADMIN,
    avatar: "",
    enrolledCourseIds: [],
    completedCourseIds: [],
    certificateIds: [],
    joinedAt: "2024-01-01",
  },
  // Additional students
  {
    id: "user-student-2", name: "Ishaan Shah", email: "ishaan@kpgu.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "kpgu", universityName: "KPGU", avatar: "",
    major: "Data Science", year: 2, semester: "Semester 4", gpa: 3.78,
    enrolledCourseIds: ["course-2", "course-8"], completedCourseIds: ["course-4"],
    certificateIds: ["cert-3"], joinedAt: "2025-09-01",
  },
  {
    id: "user-student-3", name: "Priya Sharma", email: "priya@parul.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "parul", universityName: "Parul University", avatar: "",
    major: "Digital Marketing", year: 4, semester: "Semester 8", gpa: 3.65,
    enrolledCourseIds: ["course-5", "course-6"], completedCourseIds: ["course-7", "course-8"],
    certificateIds: ["cert-4", "cert-5"], joinedAt: "2025-07-20",
  },
  {
    id: "user-student-4", name: "Arjun Mehta", email: "arjun@charusat.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "charusat", universityName: "CHARUSAT", avatar: "",
    major: "Artificial Intelligence", year: 3, semester: "Semester 5", gpa: 3.88,
    enrolledCourseIds: ["course-1", "course-3"], completedCourseIds: ["course-2"],
    certificateIds: ["cert-6"], joinedAt: "2025-10-05",
  },
  {
    id: "user-student-5", name: "Kavya Joshi", email: "kavya@navrachana.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "navrachana", universityName: "Navrachana University", avatar: "",
    major: "Product Design", year: 2, semester: "Semester 3", gpa: 3.95,
    enrolledCourseIds: ["course-9", "course-12"], completedCourseIds: ["course-10", "course-11"],
    certificateIds: ["cert-7", "cert-8"], joinedAt: "2025-08-30",
  },
  {
    id: "user-student-6", name: "Rohan Desai", email: "rohan@msu.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "msu", universityName: "MSU Baroda", avatar: "",
    major: "Commerce & Finance", year: 3, semester: "Semester 6", gpa: 3.72,
    enrolledCourseIds: ["course-5", "course-6", "course-8"], completedCourseIds: ["course-7"],
    certificateIds: ["cert-9"], joinedAt: "2025-06-15",
  },
  {
    id: "user-student-7", name: "Diya Patel", email: "diya@kpgu.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "kpgu", universityName: "KPGU", avatar: "",
    major: "AI & Machine Learning", year: 4, semester: "Semester 7", gpa: 3.91,
    enrolledCourseIds: ["course-1", "course-3", "course-4"], completedCourseIds: ["course-2"],
    certificateIds: ["cert-10"], joinedAt: "2025-05-10",
  },
  {
    id: "user-student-8", name: "Vivaan Modi", email: "vivaan@parul.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "parul", universityName: "Parul University", avatar: "",
    major: "FinTech", year: 2, semester: "Semester 4", gpa: 3.55,
    enrolledCourseIds: ["course-6"], completedCourseIds: [],
    certificateIds: [], joinedAt: "2026-01-15",
  },
  {
    id: "user-student-9", name: "Ananya Trivedi", email: "ananya@charusat.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "charusat", universityName: "CHARUSAT", avatar: "",
    major: "Deep Learning", year: 3, semester: "Semester 6", gpa: 3.84,
    enrolledCourseIds: ["course-3", "course-4"], completedCourseIds: ["course-1"],
    certificateIds: ["cert-11"], joinedAt: "2025-09-20",
  },
  {
    id: "user-student-10", name: "Sai Raval", email: "sai@msu.edu", password: "pass123",
    role: UserRole.STUDENT, universityId: "msu", universityName: "MSU Baroda", avatar: "",
    major: "Visual Communication", year: 2, semester: "Semester 3", gpa: 3.68,
    enrolledCourseIds: ["course-9", "course-11"], completedCourseIds: ["course-10"],
    certificateIds: ["cert-12"], joinedAt: "2025-11-01",
  },
  // More university admins
  {
    id: "user-admin-parul", name: "Dr. Meena Patel", email: "admin@parul.edu", password: "admin123",
    role: UserRole.UNIVERSITY_ADMIN, universityId: "parul", universityName: "Parul University", avatar: "",
    enrolledCourseIds: [], completedCourseIds: [], certificateIds: [], joinedAt: "2024-03-15",
  },
  {
    id: "user-admin-charusat", name: "Dr. Suresh Jain", email: "admin@charusat.edu", password: "admin123",
    role: UserRole.UNIVERSITY_ADMIN, universityId: "charusat", universityName: "CHARUSAT", avatar: "",
    enrolledCourseIds: [], completedCourseIds: [], certificateIds: [], joinedAt: "2024-02-20",
  },
];

export function getUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email === email);
}

export function getUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getStudentsByUniversity(universityId: string): MockUser[] {
  return mockUsers.filter((u) => u.role === UserRole.STUDENT && u.universityId === universityId);
}

export function getAllStudents(): MockUser[] {
  return mockUsers.filter((u) => u.role === UserRole.STUDENT);
}
