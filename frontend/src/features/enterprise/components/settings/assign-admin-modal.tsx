"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Loader2, Plus, ShieldCheck, Mail } from "lucide-react";
import { useAssignOrgAdmin } from "../../hooks/use-enterprise";

interface AssignAdminModalProps {
  organizationId: string;
}

export function AssignAdminModal({ organizationId }: AssignAdminModalProps) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("MANAGER");

  const { mutate: assignAdmin, isPending } = useAssignOrgAdmin(organizationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    assignAdmin(
      { userId: userId.trim(), role },
      {
        onSuccess: () => {
          setOpen(false);
          setUserId("");
          setRole("MANAGER");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-primary hover:bg-primary-hover text-white shadow-sm flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors border-none cursor-pointer">
        <Plus className="h-4 w-4 mr-2" />
        Assign Role
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Assign Admin Role
            </DialogTitle>
            <DialogDescription>
              Grant administrative privileges to an existing user in your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="font-semibold">User ID / Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  id="userId"
                  placeholder="Enter User ID (UUID) for now" 
                  className="pl-10 h-11"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="font-semibold">Access Level</Label>
              <Select value={role} onValueChange={(val: string | null) => setRole(val || "MANAGER")}>
                <SelectTrigger id="role" className="h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">
                    <div className="flex flex-col">
                      <span className="font-medium">Manager</span>
                      <span className="text-xs text-muted-foreground">Can manage departments and employees</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex flex-col">
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-muted-foreground">Can manage everything except billing/owners</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="OWNER">
                    <div className="flex flex-col">
                      <span className="font-medium">Owner</span>
                      <span className="text-xs text-muted-foreground">Full access to everything including billing</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-hover text-white"
              disabled={!userId.trim() || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
