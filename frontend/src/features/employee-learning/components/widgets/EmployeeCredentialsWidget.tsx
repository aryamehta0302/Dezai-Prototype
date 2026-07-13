"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Award, ExternalLink } from "lucide-react";
import Link from "next/link";
import { COMPLIANCE_TRACK_LABELS, ComplianceTrack } from "../../types/employee-learning.types";

interface Credential {
  id: string;
  complianceTrack: ComplianceTrack;
  verificationCode: string;
  issuedAt: string;
  status: string;
  assessmentTitle: string | null;
}

interface Props {
  credentials: Credential[];
  loading: boolean;
}

export function EmployeeCredentialsWidget({ credentials, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const active = credentials.filter((c) => c.status === "ACTIVE");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Credentials</CardTitle>
        <Link href="/enterprise/credentials" className="text-xs text-blue-600 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No credentials earned yet. Pass assessments to earn certifications!
          </p>
        ) : (
          <div className="space-y-3">
            {active.slice(0, 3).map((cred) => (
              <div
                key={cred.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="rounded-lg bg-amber-50 p-2">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {COMPLIANCE_TRACK_LABELS[cred.complianceTrack]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued {new Date(cred.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {cred.verificationCode}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
