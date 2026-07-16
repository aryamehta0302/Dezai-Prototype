"use client";

import React, { useState } from "react";
import { useOrganizations, useOrgAdmins } from "@/features/enterprise/hooks/use-enterprise";
import { OrgProfileForm } from "@/features/enterprise/components/settings/org-profile-form";
import { OrgAdminsTable } from "@/features/enterprise/components/settings/org-admins-table";
import { AssignAdminModal } from "@/features/enterprise/components/settings/assign-admin-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Settings, Shield, Building2, CreditCard } from "lucide-react";

export default function EnterpriseSettingsPage() {
  // Temporary: Grab the first organization the user has access to
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const activeOrgId = orgs?.[0]?.id;
  const activeOrg = orgs?.[0];

  const { data: admins, isLoading: isLoadingAdmins } = useOrgAdmins(activeOrgId);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight text-foreground">Organization Settings</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your workspace preferences, administrators, and billing.</p>
        </div>
      </div>

      {!activeOrgId || isLoadingOrgs ? (
        <div className="space-y-4">
          <div className="h-10 w-64 skeleton-shimmer rounded-lg mb-6" />
          <div className="h-64 w-full skeleton-shimmer rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 bg-surface border border-border">
            <TabsTrigger value="profile" className="data-active:bg-primary/10 data-active:text-primary">
              <Building2 className="h-4 w-4 mr-2" />
              Org Profile
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-active:bg-primary/10 data-active:text-primary">
              <Shield className="h-4 w-4 mr-2" />
              Administrators
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-active:bg-primary/10 data-active:text-primary">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing & Plans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <OrgProfileForm organization={activeOrg!} />
          </TabsContent>
          
          <TabsContent value="admins" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Manage Administrators</h3>
                <p className="text-sm text-muted-foreground">Assign roles to users to help manage your organization.</p>
              </div>
              <AssignAdminModal organizationId={activeOrgId} />
            </div>
            <OrgAdminsTable 
              organizationId={activeOrgId} 
              admins={admins || []} 
              isLoading={isLoadingAdmins} 
            />
          </TabsContent>

          <TabsContent value="billing">
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-surface">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Billing integration coming soon</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                You are currently on the Enterprise Trial. Billing and subscription management will be available in the next release.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      )}

    </div>
  );
}
