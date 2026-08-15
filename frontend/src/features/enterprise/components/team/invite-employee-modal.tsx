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
import { Mail, Briefcase, Plus, Loader2 } from "lucide-react";
import { useInviteEmployee, useDepartments } from "../../hooks/use-enterprise";

interface InviteEmployeeModalProps {
  organizationId: string;
}

export function InviteEmployeeModal({ organizationId }: InviteEmployeeModalProps) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("none");

  const { data: departments, isLoading: isLoadingDepts } = useDepartments(organizationId);
  const { mutate: inviteEmployee, isPending } = useInviteEmployee(organizationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    inviteEmployee(
      { 
        userId, 
        title: title || undefined, 
        departmentId: departmentId !== "none" ? departmentId : undefined 
      },
      {
        onSuccess: () => {
          setOpen(false);
          setUserId("");
          setTitle("");
          setDepartmentId("none");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-primary hover:bg-primary-hover text-white shadow-sm flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors border-none cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization. They will receive an email with instructions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="font-semibold">User ID / Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="userId"
                  placeholder="Enter User ID (UUID) for now" 
                  className="pl-10 h-11"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">For MVP, paste the user's UUID.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Job Title <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="title"
                  placeholder="e.g. Software Engineer" 
                  className="pl-10 h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="font-semibold">Department <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Select value={departmentId} onValueChange={(val: string | null) => setDepartmentId(val || "none")}>
                <SelectTrigger id="department" className="h-11">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {!isLoadingDepts && departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
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
              disabled={!userId || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
