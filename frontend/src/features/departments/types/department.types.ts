export interface Department {
  id: string;
  institutionId: string;
  name: string;
  code?: string;
  description?: string;
  headFacultyId?: string;
  createdAt: string;
  updatedAt: string;
  headFaculty?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  facultyMembers?: Array<{
    id: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  programs?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  _count?: {
    facultyMembers: number;
    programs: number;
  };
}

export interface DepartmentStatistics {
  departmentId: string;
  name: string;
  facultyCount: number;
  programCount: number;
  activeStudentCount: number;
  totalAssessmentAttempts: number;
  passRatePercent: number;
}
