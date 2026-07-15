"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Plus
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useOrganizations } from "../../hooks/use-enterprise";

interface EnterpriseSidebarProps {
  onLogout?: () => void;
}

export function EnterpriseSidebar({ onLogout }: EnterpriseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: organizations, isLoading } = useOrganizations();
  
  // Default to first organization for now
  const activeOrg = organizations?.[0];

  const navigation = [
    { name: "Dashboard", href: "/enterprise/dashboard", icon: LayoutDashboard },
    { name: "Team Directory", href: "/enterprise/team", icon: Users },
    { name: "Departments", href: "/enterprise/departments", icon: Briefcase },
    { name: "Settings", href: "/enterprise/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-screen sticky top-0 shrink-0">
      {/* Org Switcher Header */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-1.5 h-12 hover:bg-surface-muted transition-colors rounded-md bg-transparent border-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" disabled={isLoading}>
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-8 w-8 rounded-full skeleton-shimmer" />
                ) : (
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={activeOrg?.logoUrl || ""} alt={activeOrg?.name || "Organization"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {activeOrg?.name?.charAt(0) || "O"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col items-start text-sm overflow-hidden">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-20 skeleton-shimmer rounded mb-1" />
                      <div className="h-3 w-16 skeleton-shimmer rounded" />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground truncate max-w-[120px]">
                        {activeOrg?.name || "Select Organization"}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">Enterprise</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations?.map((org) => (
              <DropdownMenuItem 
                key={org.id} 
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-primary font-medium cursor-pointer"
              onClick={() => router.push("/onboarding/enterprise")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 px-3 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold" 
                    : "text-on-surface-variant hover:text-foreground hover:bg-surface-muted font-medium"
                }`}
              >
                <item.icon className={`h-4 w-4 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-10 px-3 text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
