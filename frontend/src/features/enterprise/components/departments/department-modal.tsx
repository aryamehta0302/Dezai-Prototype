"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/shared/ui/textarea";
import { Loader2, Plus, Edit2 } from "lucide-react";
import { useCreateDepartment, useUpdateDepartment } from "../../hooks/use-enterprise";
import { Department } from "../../api/enterprise.api";

interface DepartmentModalProps {
  organizationId: string;
  department?: Department; // If provided, it's edit mode
}

export function DepartmentModal({ organizationId, department }: DepartmentModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isEditMode = !!department;
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment(organizationId);
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment(organizationId);

  const isPending = isCreating || isUpdating;

  // Initialize state when opening in edit mode
  useEffect(() => {
    if (open && department) {
      setName(department.name);
      setDescription(department.description || "");
    } else if (!open && !isEditMode) {
      setName("");
      setDescription("");
    }
  }, [open, department, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditMode && department) {
      updateDepartment(
        { 
          departmentId: department.id, 
          data: { name, description } 
        },
        { onSuccess: () => setOpen(false) }
      );
    } else {
      createDepartment(
        { name, description },
        { onSuccess: () => setOpen(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEditMode ? (
        <DialogTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-muted border-none bg-transparent outline-none cursor-pointer text-muted-foreground">
          <Edit2 className="h-4 w-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger className="bg-primary hover:bg-primary-hover text-white shadow-sm flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors border-none cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Department
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of this department." 
                : "Add a new department to organize your team."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Department Name</Label>
              <Input 
                id="name"
                placeholder="e.g. Engineering, Sales" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea 
                id="description"
                placeholder="Briefly describe what this department does..." 
                className="resize-none h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-hover text-white"
              disabled={!name.trim() || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditMode ? "Save Changes" : "Create Department"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
