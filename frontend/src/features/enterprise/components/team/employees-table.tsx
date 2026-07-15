"use client";

import React, { useState } from "react";
import { Employee } from "../../api/enterprise.api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/shared/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal, Mail, UserX, CheckCircle2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
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
import { useAcceptInvitation, useRemoveEmployee } from "../../hooks/use-enterprise";

interface EmployeesTableProps {
  organizationId: string;
  employees: Employee[];
  isLoading: boolean;
}

export function EmployeesTable({ organizationId, employees, isLoading }: EmployeesTableProps) {
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);

  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation(organizationId);
  const { mutate: removeEmployee, isPending: isRemoving } = useRemoveEmployee(organizationId);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-full h-16 skeleton-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-surface">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-1">No team members yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-4">
          Your organization is currently empty. Invite members to start building your team directory.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: Employee["employmentStatus"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">Active</Badge>;
      case "INVITED":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">Pending Invitation</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">Suspended</Badge>;
      case "TERMINATED":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-0">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRemove = () => {
    if (!employeeToRemove) return;
    removeEmployee(employeeToRemove.id, {
      onSuccess: () => setEmployeeToRemove(null)
    });
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-level-1">
        <Table>
          <TableHeader className="bg-surface-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-on-surface-variant w-[300px]">Employee</TableHead>
              <TableHead className="font-semibold text-on-surface-variant">Title</TableHead>
              <TableHead className="font-semibold text-on-surface-variant">Department</TableHead>
              <TableHead className="font-semibold text-on-surface-variant">Status</TableHead>
              <TableHead className="font-semibold text-on-surface-variant text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-surface-muted/30 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={employee.user?.avatar || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary font-medium">
                        {employee.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{employee.user?.name || "Unknown User"}</span>
                      <span className="text-xs text-muted-foreground">{employee.user?.email || "No email"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-on-surface-variant">
                  {employee.title || <span className="text-muted-foreground italic">Not specified</span>}
                </TableCell>
                <TableCell>
                  {employee.department ? (
                    <span className="font-medium text-on-surface-variant">{employee.department.name}</span>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(employee.employmentStatus)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-muted border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      {employee.employmentStatus === "INVITED" && (
                        <>
                          <DropdownMenuItem 
                            className="cursor-pointer text-success focus:bg-success/10 focus:text-success"
                            onSelect={() => acceptInvitation(employee.id)}
                            disabled={isAccepting}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Accept Invitation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onSelect={() => setEmployeeToRemove(employee)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Remove from Organization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Remove Employee Confirmation Dialog */}
      <Dialog open={!!employeeToRemove} onOpenChange={(open: boolean) => !open && setEmployeeToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{employeeToRemove?.user?.name || "this employee"}</strong> from the organization?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeToRemove(null)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
