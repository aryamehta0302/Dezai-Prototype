"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { universityAdminService } from "../services/university-admin.service";
import { StudentEnrollmentDetail } from "../types/university-admin.types";
import { StudentTable } from "../components/StudentTable";
import { MentorAssignmentModal } from "../components/MentorAssignmentModal";

export const StudentManagementPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || searchParams?.get("q") || "";

  const [students, setStudents] = useState<StudentEnrollmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollmentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadStudents = useCallback((querySearch?: string) => {
    setLoading(true);
    const activeSearch = querySearch !== undefined ? querySearch : search;
    universityAdminService
      .getAllStudents({ search: activeSearch || undefined })
      .then((data) => {
        setStudents(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setSearch(q);
    loadStudents(q);
  }, [searchParams]);

  const handleOpenMentorModal = (student: StudentEnrollmentDetail) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <PageContainer className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Student Oversight</h1>
        <p className="text-sm text-muted">Track student program progress, manage mentor assignments, and access performance analytics</p>
      </div>

      <div className="flex justify-between items-center bg-surface-low p-4 rounded-xl border border-border-light">
        <Input
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadStudents()}
          className="w-80"
        />
        <Button onClick={() => loadStudents()} variant="default" size="sm">
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
      </div>

      <StudentTable
        students={students}
        loading={loading}
        onAssignMentor={handleOpenMentorModal}
      />

      <MentorAssignmentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadStudents()}
      />
    </PageContainer>
  );
};
