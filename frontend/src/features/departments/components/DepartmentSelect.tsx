"use client";

import React, { useEffect, useState } from "react";
import { departmentService } from "../services/department.service";
import { Department } from "../types/department.types";

interface DepartmentSelectProps {
  institutionId?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  institutionId,
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    departmentService
      .getDepartments(institutionId)
      .then((data) => {
        if (isMounted) {
          setDepartments(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDepartments([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [institutionId]);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      <option value="">
        {loading ? "Loading departments..." : "Select Department"}
      </option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name} {dept.code ? `(${dept.code})` : ""}
        </option>
      ))}
    </select>
  );
};
