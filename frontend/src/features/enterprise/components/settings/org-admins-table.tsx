"use client";

import React, { useState } from "react";
import { OrgAdmin } from "../../api/enterprise.api";
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
import { MoreHorizontal, ShieldOff, ShieldAlert } from "lucide-react";
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
import { useRemoveOrgAdmin } from "../../hooks/use-enterprise";
import { AssignAdminModal } from "./assign-admin-modal";

interface OrgAdminsTableProps {
  organizationId: string;
  admins: OrgAdmin[];
  isLoading: boolean;
}

export function OrgAdminsTable({ organizationId, admins, isLoading }: OrgAdminsTableProps) {
  const [adminToRemove, setAdminToRemove] = useState<OrgAdmin | null>(null);
  const { mutate: removeAdmin, isPending: isRemoving } = useRemoveOrgAdmin(organizationId);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full h-16 skeleton-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  const getRoleBadge = (role: OrgAdmin["role"]) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">Owner</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Admin</Badge>;
      case "MANAGER":
        return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-0">Manager</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleRemove = () => {
    if (adminToRemove) {
      removeAdmin(adminToRemove.id, {
        onSuccess: () => setAdminToRemove(null)
      });
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-surface-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-on-surface-variant w-[350px]">User</TableHead>
              <TableHead className="font-semibold text-on-surface-variant">Role</TableHead>
              <TableHead className="font-semibold text-on-surface-variant">Assigned On</TableHead>
              <TableHead className="font-semibold text-on-surface-variant text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins && admins.length > 0 ? admins.map((admin) => (
              <TableRow key={admin.id} className="hover:bg-surface-muted/30 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={admin.user?.avatar || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary font-medium">
                        {admin.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{admin.user?.name || "Unknown User"}</span>
                      <span className="text-xs text-muted-foreground">{admin.user?.email || "No email provided"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(admin.role)}
                </TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  {new Date(admin.assignedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-muted border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">Change Role</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onSelect={() => setAdminToRemove(admin)}
                      >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Revoke Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                    <ShieldAlert className="h-8 w-8 mb-2 opacity-50" />
                    <p>No admins found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!adminToRemove} onOpenChange={(open: boolean) => !open && setAdminToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Admin Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke {adminToRemove?.role.toLowerCase()} privileges for <strong>{adminToRemove?.user?.name || "this user"}</strong>? 
              They will lose access to administrative functions in this organization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminToRemove(null)} disabled={isRemoving}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Revoking..." : "Revoke Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
