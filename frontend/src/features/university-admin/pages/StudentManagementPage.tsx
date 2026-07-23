"use client";

import React, { useEffect, useState } from "react";
import { universityAdminService } from "../services/university-admin.service";
import { StudentEnrollmentDetail } from "../types/university-admin.types";
import { StudentTable } from "../components/StudentTable";
import { MentorAssignmentModal } from "../components/MentorAssignmentModal";

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<StudentEnrollmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollmentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    universityAdminService
      .getAllStudents({ search: search || undefined })
      .then((data) => {
        setStudents(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenMentorModal = (student: StudentEnrollmentDetail) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Student Oversight</h1>
        <p className="text-sm text-slate-400">Track student program progress, manage mentor assignments, and access performance analytics</p>
      </div>

      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadStudents()}
          className="w-80 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={loadStudents}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
        >
          Search
        </button>
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
        onSuccess={loadStudents}
      />
    </div>
  );
};
