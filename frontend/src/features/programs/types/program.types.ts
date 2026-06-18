export interface ApiProgram {
  id: string;
  title: string;
  description: string;
  institutionId: string;
  facultyId: string | null;
  createdAt: string;
  updatedAt: string;
  institution: { name: string; logoUrl: string | null };
  faculty: { user: { name: string } } | null;
  tracks: ApiTrack[];
}

export interface ApiTrack {
  id: string;
  programId: string;
  type: "ROOTS" | "EDGE";
  title: string | null;
  description: string | null;
  modules: ApiModule[];
}

export interface ApiModule {
  id: string;
  trackId: string;
  title: string;
  order: number;
  lessons: ApiLesson[];
}

export interface ApiResource {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  url: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
}

export interface ApiLessonDetail extends ApiLesson {
  moduleId: string;
  content: string;
  contentFormat: 'MARKDOWN' | 'HTML';
  createdAt: string;
  updatedAt: string;
  module: { title: string; track: { programId: string } };
  resources?: ApiResource[];
}

export interface ApiEnrollment {
  id: string;
  userId: string;
  programId: string;
  createdAt: string;
  progress: number;
  completedAt: string | null;
  program?: ApiProgram;
}

export interface ApiEnrollmentsResponse {
  success: boolean;
  enrollments: ApiEnrollment[];
}

export interface ApiProgramsResponse {
  success: boolean;
  programs: ApiProgram[];
}

export interface ApiProgramResponse {
  success: boolean;
  program: ApiProgram;
}

export interface ApiLessonResponse {
  success: boolean;
  lesson: ApiLessonDetail;
}

export interface ApiEnrollResponse {
  success: boolean;
  enrollment: ApiEnrollment;
}

export interface ApiProgressResponse {
  success: boolean;
  progress?: { id: string };
  alreadyCompleted?: boolean;
  xpResult?: { success: boolean; currentXp: number; amountAwarded: number } | null;
}

export interface ApiNoteResponse {
  success: boolean;
  note: { id: string; content: string; updatedAt: string } | null;
}

export interface ApiBookmarkResponse {
  success: boolean;
  bookmarked: boolean;
}
