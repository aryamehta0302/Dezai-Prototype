export class UniversityDashboardDto {
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

  recentActivity: any[];
}
