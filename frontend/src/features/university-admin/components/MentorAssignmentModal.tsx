"use client";

import React, { useState, useEffect } from "react";
import { StudentEnrollmentDetail, FacultyMemberDetail } from "../types/university-admin.types";
import { universityAdminService } from "../services/university-admin.service";

interface MentorAssignmentModalProps {
  student: StudentEnrollmentDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MentorAssignmentModal: React.FC<MentorAssignmentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [facultyList, setFacultyList] = useState<FacultyMemberDetail[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      universityAdminService
        .getAllFaculty({ status: "APPROVED" })
        .then((data) => {
          setFacultyList(data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId) return;

    setSaving(true);
    try {
      if (student.mentor) {
        await universityAdminService.changeMentor(student.id, selectedFacultyId);
      } else {
        await universityAdminService.assignMentor({
          enrollmentId: student.id,
          facultyId: selectedFacultyId,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100">
          {student.mentor ? "Change Mentor" : "Assign Mentor"}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Student: <span className="text-slate-200">{student.user?.name}</span> ({student.program?.title})
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Select Faculty Mentor</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              disabled={loading || saving}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose Faculty --</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.user?.name} ({f.designation || "Faculty"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedFacultyId}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
