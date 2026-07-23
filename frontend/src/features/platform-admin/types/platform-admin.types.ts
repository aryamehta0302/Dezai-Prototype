export interface PlatformOverviewMetrics {
  totalUsers: number;
  totalInstitutions: number;
  totalDepartments: number;
  totalPrograms: number;
  totalAssessments: number;
  totalCredentialsIssued: number;
  totalXpAwarded: number;
}

export interface PlatformUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  accountStatus: string;
  xp: number;
  streakCount: number;
  createdAt: string;
  lastActiveAt?: string;
  facultyInfo?: { id: string; institutionId: string };
  instAdminInfo?: { id: string; institutionId: string };
}

export interface PlatformInstitution {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  country?: string;
  state?: string;
  city?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  approvedAt?: string;
  suspendedAt?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  _count?: {
    faculty: number;
    admins: number;
    programs: number;
    institutionDepartments: number;
  };
}

export interface SystemHealthMetrics {
  status: 'OK' | 'DEGRADED';
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: {
      status: string;
      latencyMs: number;
    };
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
    };
  };
}
