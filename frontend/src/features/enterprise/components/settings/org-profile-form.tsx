"use client";

import React, { useState, useEffect } from "react";
import { Organization } from "../../api/enterprise.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useUpdateOrganization } from "../../hooks/use-enterprise";
import { Loader2, Globe, Users, Building } from "lucide-react";

interface OrgProfileFormProps {
  organization: Organization;
}

export function OrgProfileForm({ organization }: OrgProfileFormProps) {
  const [name, setName] = useState(organization.name);
  const [industry, setIndustry] = useState(organization.industry || "");
  const [size, setSize] = useState(organization.size || "");

  const { mutate: updateOrg, isPending } = useUpdateOrganization(organization.id);

  // Sync state if organization prop updates
  useEffect(() => {
    setName(organization.name);
    setIndustry(organization.industry || "");
    setSize(organization.size || "");
  }, [organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrg({ name, industry, size });
  };

  const hasChanges = 
    name !== organization.name || 
    industry !== (organization.industry || "") || 
    size !== (organization.size || "");

  return (
    <Card className="border-border shadow-sm bg-surface">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl">Organization Profile</CardTitle>
          <CardDescription>
            Update your enterprise workspace details and branding.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orgName" className="font-semibold">Organization Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Input 
                id="orgName"
                placeholder="e.g. Acme Corp" 
                className="pl-10 h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry" className="font-semibold">Industry</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={industry} onValueChange={(val: string | null) => setIndustry(val || "")}>
                  <SelectTrigger id="industry" className="pl-10 h-11">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology & Software</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size" className="font-semibold">Company Size</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={size} onValueChange={(val: string | null) => setSize(val || "")}>
                  <SelectTrigger id="size" className="pl-10 h-11">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1 - 50 employees</SelectItem>
                    <SelectItem value="51-200">51 - 200 employees</SelectItem>
                    <SelectItem value="201-500">201 - 500 employees</SelectItem>
                    <SelectItem value="501-1000">501 - 1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-surface-muted/30 border-t border-border px-6 py-4 flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary-hover text-white shadow-sm"
            disabled={!hasChanges || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
