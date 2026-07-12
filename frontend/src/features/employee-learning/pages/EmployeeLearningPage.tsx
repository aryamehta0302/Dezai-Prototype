"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Loader2 } from "lucide-react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import { AssessmentList } from "../components/AssessmentList";
import type { AssessmentWithStatus } from "../types/employee-learning.types";

export default function EmployeeLearningPage() {
  const [assessments, setAssessments] = useState<AssessmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.listAssessments();
      setAssessments((res as unknown as { assessments: AssessmentWithStatus[] }).assessments);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance Training</h1>
        <p className="text-sm text-muted-foreground">
          Complete compliance assessments to earn credentials
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AssessmentList assessments={assessments} />
      )}
    </div>
  );
}
