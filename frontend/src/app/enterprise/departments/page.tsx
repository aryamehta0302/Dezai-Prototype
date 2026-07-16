"use client";

import React, { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { useOrganizations, useDepartments } from "@/features/enterprise/hooks/use-enterprise";
import { DepartmentCard } from "@/features/enterprise/components/departments/department-card";
import { DepartmentModal } from "@/features/enterprise/components/departments/department-modal";

export default function EnterpriseDepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Temporary: Grab the first organization the user has access to
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const activeOrgId = orgs?.[0]?.id;

  const { data: departments, isLoading: isLoadingDepartments } = useDepartments(activeOrgId);

  // Filter departments based on search query
  const filteredDepartments = departments?.filter(dept => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(q) ||
      (dept.description && dept.description.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight text-foreground flex items-center gap-3">
            Departments
            <div className="h-8 px-3 rounded-full bg-primary/10 text-primary text-sm flex items-center font-bold">
              {departments?.length || 0}
            </div>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Organize your teams and assign employees to specific business units.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeOrgId && <DepartmentModal organizationId={activeOrgId} />}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-2 rounded-xl border border-border shadow-level-1">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search departments..." 
            className="pl-10 h-10 bg-transparent border-none shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid */}
      {isLoadingOrgs || isLoadingDepartments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 skeleton-shimmer rounded-xl" />
          ))}
        </div>
      ) : filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <DepartmentCard 
              key={dept.id} 
              organizationId={activeOrgId!} 
              department={dept} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-surface">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-1">No departments found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            {searchQuery ? "Try adjusting your search query." : "Create your first department to start organizing your organization."}
          </p>
          {!searchQuery && activeOrgId && (
            <DepartmentModal organizationId={activeOrgId} />
          )}
        </div>
      )}

    </div>
  );
}
