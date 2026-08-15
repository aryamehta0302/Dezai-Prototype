export type FacultyVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'REJECTED';

export interface FacultyMemberDetail {
  id: string;
  userId: string;
  institutionId: string;
  departmentId?: string;
  designation?: string;
  employeeId?: string;
  contactNumber?: string;
  verificationStatus: FacultyVerificationStatus;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    accountStatus: AccountStatus;
    createdAt?: string;
    lastActiveAt?: string;
  };
  institutionDept?: {
    id: string;
    name: string;
    code?: string;
  };
  documents?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
}

export interface StudentEnrollmentDetail {
  id: string;
  userId: string;
  programId: string;
  mentorFacultyId?: string;
  progress: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    xp: number;
    streakCount: number;
    accountStatus: AccountStatus;
    lastActiveAt?: string;
  };
  program: {
    id: string;
    title: string;
    description?: string;
  };
  mentor?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface UniversityDashboardMetrics {
  totalFaculty: number;
  pendingFacultyApprovals: number;
  activeFaculty: number;
  suspendedFaculty: number;
  totalStudents: number;
  activeEnrollments: number;
  completedPrograms: number;
  totalDepartments: number;
  totalPrograms: number;
  activePrograms: number;
  assessmentPassRate: number;
  credentialsIssuedThisMonth: number;
  institutionStatus: string;
  recentActivity: Array<{
    id: string;
    action: string;
    details?: string;
    createdAt: string;
    user?: {
      name?: string;
      email?: string;
    };
  }>;
}
