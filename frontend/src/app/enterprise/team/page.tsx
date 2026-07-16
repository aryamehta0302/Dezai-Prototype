"use client";

import React, { useState } from "react";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { EmployeesTable } from "@/features/enterprise/components/team/employees-table";
import { InviteEmployeeModal } from "@/features/enterprise/components/team/invite-employee-modal";
import { useOrganizations, useEmployees } from "@/features/enterprise/hooks/use-enterprise";

export default function EnterpriseTeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Temporary: Grab the first organization the user has access to
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const activeOrgId = orgs?.[0]?.id;

  const { data: employees, isLoading: isLoadingEmployees } = useEmployees(activeOrgId);

  // Filter employees based on search query
  const filteredEmployees = employees?.filter(emp => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.user?.name.toLowerCase().includes(q) ||
      emp.user?.email.toLowerCase().includes(q) ||
      emp.title?.toLowerCase().includes(q) ||
      emp.department?.name.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight text-foreground flex items-center gap-3">
            Team Directory
            <div className="h-8 px-3 rounded-full bg-primary/10 text-primary text-sm flex items-center font-bold">
              {employees?.length || 0} Members
            </div>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your employees, assign roles, and track onboarding status.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeOrgId && <InviteEmployeeModal organizationId={activeOrgId} />}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-2 rounded-xl border border-border shadow-level-1">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or role..." 
            className="pl-10 h-10 bg-transparent border-none shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto px-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground font-medium h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <EmployeesTable 
        organizationId={activeOrgId || ""}
        employees={filteredEmployees} 
        isLoading={isLoadingOrgs || isLoadingEmployees} 
      />

    </div>
  );
}
