import React from "react";
import { Metadata } from "next";
import { EnterpriseRegistrationForm } from "@/features/enterprise/components/onboarding/enterprise-registration-form";

export const metadata: Metadata = {
  title: "Create Enterprise Workspace | DEZAI",
  description: "Set up your organization and start managing your team's learning journey.",
};

export default function EnterpriseOnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
      
      {/* Navbar Minimal */}
      <header className="h-20 flex items-center px-8 border-b border-border/50 bg-surface/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight">DEZAI</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-muted text-xs font-semibold text-muted-foreground ml-2 border border-border">
            Enterprise
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-display-sm font-bold tracking-tight text-foreground mb-3">
            Set up your organization
          </h1>
          <p className="text-headline-sm text-muted-foreground max-w-[600px] mx-auto">
            Create a dedicated workspace to manage your team's compliance, training, and development programs.
          </p>
        </div>
        
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <EnterpriseRegistrationForm />
        </div>
      </main>
    </div>
  );
}
