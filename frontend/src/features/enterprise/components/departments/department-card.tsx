"use client";

import React, { useState } from "react";
import { Department } from "../../api/enterprise.api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Building2, Users, MoreVertical, Trash2 } from "lucide-react";
import { DepartmentModal } from "./department-modal";
import { useDeleteDepartment } from "../../hooks/use-enterprise";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/shared/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface DepartmentCardProps {
  organizationId: string;
  department: Department;
}

export function DepartmentCard({ organizationId, department }: DepartmentCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment(organizationId);

  const handleDelete = () => {
    deleteDepartment(department.id, {
      onSuccess: () => setIsDeleteDialogOpen(false)
    });
  };

  return (
    <>
      <Card className="border-border shadow-sm hover:shadow-md transition-all group bg-surface h-full flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{department.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Created {new Date(department.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-muted border-none bg-transparent outline-none cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="flex-1 py-4">
          <p className="text-sm text-on-surface-variant line-clamp-3">
            {department.description || <span className="italic text-muted-foreground">No description provided.</span>}
          </p>
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Users className="h-4 w-4" />
            <span>Team Members</span>
          </div>
          <DepartmentModal organizationId={organizationId} department={department} />
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{department.name}</strong> department? 
              This action cannot be undone. Employees assigned to this department will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
