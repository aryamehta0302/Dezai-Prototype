import { apiClient } from "@/core/api/client";
import {
  FacultyMemberDetail,
  StudentEnrollmentDetail,
  UniversityDashboardMetrics,
} from "../types/university-admin.types";

export const universityAdminService = {
  getDashboard: () => {
    return apiClient.get<UniversityDashboardMetrics>("/university-admin/dashboard");
  },

  getAllFaculty: (params?: { departmentId?: string; status?: string; search?: string }) => {
    return apiClient.get<FacultyMemberDetail[]>("/university-admin/faculty", { params });
  },

  getPendingFaculty: () => {
    return apiClient.get<FacultyMemberDetail[]>("/university-admin/faculty/pending");
  },

  getFacultyById: (id: string) => {
    return apiClient.get<FacultyMemberDetail>(`/university-admin/faculty/${id}`);
  },

  approveFaculty: (id: string) => {
    return apiClient.post<FacultyMemberDetail>(`/university-admin/faculty/${id}/approve`);
  },

  rejectFaculty: (id: string, reason?: string) => {
    return apiClient.post<FacultyMemberDetail>(`/university-admin/faculty/${id}/reject`, { reason });
  },

  suspendFaculty: (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/university-admin/faculty/${id}/suspend`);
  },

  reactivateFaculty: (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/university-admin/faculty/${id}/reactivate`);
  },

  removeFaculty: (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/university-admin/faculty/${id}`);
  },

  getAllStudents: (params?: { programId?: string; search?: string; status?: string }) => {
    return apiClient.get<StudentEnrollmentDetail[]>("/university-admin/students", { params });
  },

  getStudentDetail: (id: string) => {
    return apiClient.get<any>(`/university-admin/students/${id}`);
  },

  assignMentor: (data: { facultyId: string; enrollmentId: string }) => {
    return apiClient.post<StudentEnrollmentDetail>("/university-admin/students/mentor", data);
  },

  changeMentor: (enrollmentId: string, newFacultyId: string) => {
    return apiClient.post<StudentEnrollmentDetail>("/university-admin/students/mentor/change", { newFacultyId }, {
      params: { enrollmentId },
    });
  },

  getProfile: () => {
    return apiClient.get<any>("/university-admin/profile");
  },

  updateProfile: (data: any) => {
    return apiClient.patch<any>("/university-admin/profile", data);
  },

  getAnalytics: () => {
    return apiClient.get<any>("/university-admin/analytics");
  },
};
