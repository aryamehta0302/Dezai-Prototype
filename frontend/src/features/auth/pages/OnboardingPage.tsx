"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "@/shared/types/common.types";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";
import {
  GraduationCap,
  ShieldAlert,
  BookOpen,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Building2,
  MapPin,
  FileText,
  UserCheck,
  Globe,
  Milestone,
} from "lucide-react";

interface Institution {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
}

export function OnboardingPage() {
  const { completeOnboarding, isSessionLoading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cascading location state
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // Faculty-only fields
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const rolesList = [
    {
      id: UserRole.STUDENT,
      title: "Student / Learner",
      description: "Gain skills, complete modules, take verified assessments, and earn university-grade credentials.",
      icon: BookOpen,
      color: "border-primary/20 bg-primary/5 text-primary",
      activeColor: "border-primary ring-2 ring-primary bg-primary/5",
    },
    {
      id: UserRole.FACULTY,
      title: "Faculty Member / Instructor",
      description: "Create programs, build lessons, design question banks, manage assessments, and grade submissions.",
      icon: GraduationCap,
      color: "border-secondary/20 bg-secondary/5 text-secondary",
      activeColor: "border-secondary ring-2 ring-secondary bg-secondary/5",
    },
    {
      id: UserRole.UNIVERSITY_ADMIN,
      title: "University Administrator",
      description: "Manage institution details, approve programs, add faculty, and track student outcomes.",
      icon: Briefcase,
      color: "border-tertiary/20 bg-tertiary/5 text-tertiary",
      activeColor: "border-tertiary ring-2 ring-tertiary bg-tertiary/5",
    },
    {
      id: UserRole.DEZAI_ADMIN,
      title: "Dezai Super Administrator",
      description: "Monitor platform metrics, manage all universities, verify new credentials, and adjust global settings.",
      icon: ShieldAlert,
      color: "border-error/20 bg-error/5 text-error",
      activeColor: "border-error ring-2 ring-error bg-error/5",
    },
  ];

  // Load countries when entering step 2
  useEffect(() => {
    if (step !== 2) return;
    setLoadingCountries(true);
    apiClient
      .get<{ countries: string[] }>("/institutions/locations")
      .then((res) => setCountries(res.countries ?? []))
      .catch(() => toast.error("Failed to load countries."))
      .finally(() => setLoadingCountries(false));
  }, [step]);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]); setSelectedState(""); return;
    }
    setLoadingStates(true);
    apiClient
      .get<{ states: string[] }>("/institutions/locations", { params: { country: selectedCountry } })
      .then((res) => { setStates(res.states ?? []); setSelectedState(""); setCities([]); setSelectedCity(""); setInstitutions([]); setSelectedInstitutionId(""); })
      .catch(() => toast.error("Failed to load states."))
      .finally(() => setLoadingStates(false));
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCities([]); setSelectedCity(""); return;
    }
    setLoadingCities(true);
    apiClient
      .get<{ cities: string[] }>("/institutions/locations", { params: { country: selectedCountry, state: selectedState } })
      .then((res) => { setCities(res.cities ?? []); setSelectedCity(""); setInstitutions([]); setSelectedInstitutionId(""); })
      .catch(() => toast.error("Failed to load cities."))
      .finally(() => setLoadingCities(false));
  }, [selectedCountry, selectedState]);

  // Load institutions when city changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || !selectedCity) {
      setInstitutions([]); setSelectedInstitutionId(""); return;
    }
    setLoadingInstitutions(true);
    apiClient
      .get<Institution[]>("/institutions", { params: { country: selectedCountry, state: selectedState, city: selectedCity } })
      .then((res) => { setInstitutions(res ?? []); setSelectedInstitutionId(""); })
      .catch(() => toast.error("Failed to load universities."))
      .finally(() => setLoadingInstitutions(false));
  }, [selectedCountry, selectedState, selectedCity]);

  const handleRoleContinue = () => {
    if (!selectedRole) return;
    // DEZAI_ADMIN doesn't need institution — directly submit
    if (selectedRole === UserRole.DEZAI_ADMIN) {
      handleComplete();
    } else {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!selectedRole || isSubmitting) return;

    if (selectedRole !== UserRole.DEZAI_ADMIN) {
      if (!selectedInstitutionId) { toast.error("Please select a university."); return; }
      if (selectedRole === UserRole.FACULTY && (!department.trim() || !designation.trim())) {
        toast.error("Please enter your Department and Designation."); return;
      }
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/onboarding", {
        role: selectedRole,
        ...(selectedInstitutionId ? { institutionId: selectedInstitutionId } : {}),
        ...(department ? { department } : {}),
        ...(designation ? { designation } : {}),
      });
      await completeOnboarding(selectedRole);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Onboarding failed. Please try again.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const step2CanSubmit =
    !!selectedInstitutionId &&
    (selectedRole !== UserRole.FACULTY || (!!department.trim() && !!designation.trim()));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">

        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-border-light pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Milestone className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted font-bold tracking-widest uppercase">
                Workspace Setup
              </span>
              <p className="text-sm font-extrabold text-on-surface">
                {step === 1 ? "Step 1 — Select Your Role" : "Step 2 — Institutional Affiliation"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-neutral-200"}`} />
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step === 2 ? "bg-primary" : "bg-neutral-200"}`} />
          </div>
        </div>

        {/* ──────────── STEP 1: ROLE SELECTION ──────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
                Select Your Role
              </h1>
              <p className="mx-auto max-w-md text-sm text-muted leading-relaxed">
                Welcome to Dezai! Tell us how you plan to use the platform.
                This will customize your workspace dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {rolesList.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRole(item.id)}
                    className={`relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-200 hover:shadow-level-2 group ${
                      isSelected ? item.activeColor : "border-border-light bg-white"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!selectedRole || isSubmitting || isSessionLoading}
                onClick={handleRoleContinue}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ──────────── STEP 2: INSTITUTION SELECTION ──────────── */}
        {step === 2 && (
          <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-on-surface">Institutional Affiliation</h2>
              <p className="text-xs text-muted mt-1">
                Select your university to link your academic credentials and personalise your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              {/* Country */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                  <Globe className="h-3.5 w-3.5 text-muted" /> Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={loadingCountries}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-60"
                >
                  <option value="">
                    {loadingCountries ? "Loading countries…" : "Select country…"}
                  </option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                  <MapPin className="h-3.5 w-3.5 text-muted" /> State / Province
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={!selectedCountry || loadingStates}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingStates ? "Loading states…" : "Select state…"}
                  </option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                  <Building2 className="h-3.5 w-3.5 text-muted" /> City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState || loadingCities}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingCities ? "Loading cities…" : "Select city…"}
                  </option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                  <GraduationCap className="h-3.5 w-3.5 text-muted" /> University / Institution
                </label>
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  disabled={!selectedCity || loadingInstitutions}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingInstitutions ? "Loading universities…" : "Select university…"}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              {/* Faculty-only: Department & Designation */}
              {selectedRole === UserRole.FACULTY && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-light">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                      <Building2 className="h-3.5 w-3.5 text-muted" /> Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface/85">
                      <FileText className="h-3.5 w-3.5 text-muted" /> Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Assistant Professor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border-light">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm font-semibold text-muted hover:bg-neutral-50 hover:text-on-surface transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting || !step2CanSubmit}
                onClick={handleComplete}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Complete Onboarding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
