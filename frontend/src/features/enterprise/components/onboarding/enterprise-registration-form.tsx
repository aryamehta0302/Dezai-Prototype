"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Users, CreditCard, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Progress } from "@/shared/ui/progress";
import { useCreateOrganization } from "@/features/enterprise/hooks/use-enterprise";

export function EnterpriseRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    billingEmail: "",
  });

  const { mutate: createOrganization, isPending: isSubmitting } = useCreateOrganization();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createOrganization(
      { name: formData.name, industry: formData.industry || undefined, size: formData.size || undefined },
      { onSuccess: () => router.push("/enterprise/dashboard") }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Organization Details</span>
          <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Billing & Setup</span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
      </div>

      <Card className="border-border shadow-level-2 bg-surface">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Create your organization" : "Complete setup"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 1 
                ? "Enter your company details to set up your enterprise workspace." 
                : "Just a few more details to finalize your enterprise account."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="font-semibold">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="orgName" 
                      placeholder="Acme Corporation" 
                      className="pl-10 h-11"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-semibold">Industry</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={formData.industry} onValueChange={(val: string | null) => handleChange("industry", val || "")}>
                      <SelectTrigger id="industry" className="pl-10 h-11">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology & Software</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size" className="font-semibold">Company Size</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={formData.size} onValueChange={(val: string | null) => handleChange("size", val || "")}>
                      <SelectTrigger id="size" className="pl-10 h-11">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMALL">1-50 employees (Small)</SelectItem>
                        <SelectItem value="MEDIUM">51-200 employees (Medium)</SelectItem>
                        <SelectItem value="LARGE">201-1000 employees (Large)</SelectItem>
                        <SelectItem value="ENTERPRISE">1000+ employees (Enterprise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="billingEmail" className="font-semibold">Billing Email Address</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="billingEmail" 
                      type="email"
                      placeholder="billing@acme.com" 
                      className="pl-10 h-11"
                      value={formData.billingEmail}
                      onChange={(e) => handleChange("billingEmail", e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Invoices and payment updates will be sent here.</p>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mt-6">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">Ready to launch?</p>
                    <p className="text-muted-foreground">By creating this organization, you will become the initial Owner with full administrative access to invite team members and configure settings.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-6 bg-surface-low/30 rounded-b-xl">
            {step === 1 ? (
              <>
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={!formData.name}
                  className="bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 h-10 px-6 rounded-lg transition-all"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" type="button" onClick={handleBack}>Back</Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.billingEmail}
                  className="bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 h-10 px-6 rounded-lg transition-all relative overflow-hidden"
                >
                  {isSubmitting ? "Setting up..." : "Create Workspace"}
                  {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
