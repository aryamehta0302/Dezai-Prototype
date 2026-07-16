/**
 * @module features/analytics/types/enterprise-analytics.types
 * Sprint 8 — Enterprise Analytics Dashboard
 */

export interface EnterpriseOverview {
  totalEmployees: number;
  activeEmployees: number;
  overallComplianceRate: number;
  totalCredentials: number;
  activeCredentials: number;
  assessmentsTaken: number;
  averageScore: number;
}

export interface EnterpriseTrackStat {
  track: string;
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
  credentialsIssued: number;
}

export interface EnterpriseDepartmentStat {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  compliantCount: number;
  complianceRate: number;
  credentialCount: number;
}

export interface EnterpriseEmployeeRow {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  title: string;
  employmentStatus: string;
  lastAttemptScore: number | null;
  lastAttemptPassed: boolean | null;
  lastAttemptDate: string | null;
  activeCredentials: number;
  complianceTracks: string[];
}

export interface EnterpriseEmployeeList {
  data: EnterpriseEmployeeRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type EnterpriseActivityType = 'ASSESSMENT' | 'CREDENTIAL';

export interface EnterpriseActivityEntry {
  id: string;
  type: EnterpriseActivityType;
  timestamp: string;
  employeeName: string;
  detail: string;
  passed: boolean;
}

export interface EnterpriseAnalyticsState {
  overview: EnterpriseOverview | null;
  tracks: EnterpriseTrackStat[];
  departments: EnterpriseDepartmentStat[];
  employees: EnterpriseEmployeeList | null;
  activity: EnterpriseActivityEntry[];
  isLoading: boolean;
  error: string | null;
}
