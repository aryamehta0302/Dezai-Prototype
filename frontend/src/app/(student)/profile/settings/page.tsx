"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageContainer } from "@/shared/components/page-container";
import { useAuthStore } from "@/lib/stores/auth.store";
import { toast } from "sonner";
import { User, Lock, Bell, Shield, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  return (
    <PageContainer className="py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-border-light hover:bg-surface-low transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
            <p className="text-sm text-muted mt-0.5">{user?.name || "Manage your account"}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <nav className="flex md:flex-col gap-2 md:w-48 shrink-0">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-left ${
                  activeSection === id
                    ? "bg-primary text-white shadow-md"
                    : "text-muted hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "privacy" && <PrivacySettings />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      const token = (session as { accessToken?: string })?.accessToken;
      if (!token) throw new Error("No access token");
      const res = await fetch(`${API}/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update profile");
      }
      const data = await res.json();
      setUser({ ...user!, name: data.user?.name || name });
      await updateSession({ name: data.user?.name || name });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-on-surface">Profile Information</h2>
        <p className="text-sm text-muted mt-1">Update your personal details</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface/80">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface/80">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm outline-hidden opacity-60 cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving\u2026" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-on-surface">Security</h2>
        <p className="text-sm text-muted mt-1">Password and account security</p>
      </div>
      <div className="py-12 text-center space-y-3">
        <Lock className="h-10 w-10 text-muted/30 mx-auto" />
        <p className="text-sm font-medium text-muted">Password management coming soon</p>
        <p className="text-xs text-muted max-w-xs mx-auto">You&apos;ll be able to change your password here</p>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    programUpdates: true,
    achievementUnlocks: true,
    assessmentReminders: true,
    newAnnouncements: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  const items = [
    { key: "programUpdates" as const, label: "Program updates", desc: "Notify me when program content changes" },
    { key: "achievementUnlocks" as const, label: "Achievement unlocks", desc: "Celebrate when I earn a new achievement" },
    { key: "assessmentReminders" as const, label: "Assessment reminders", desc: "Remind me before an assessment deadline" },
    { key: "newAnnouncements" as const, label: "New announcements", desc: "Updates from instructors and admins" },
  ];

  return (
    <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-on-surface">Notifications</h2>
        <p className="text-sm text-muted mt-1">Control what you get notified about</p>
      </div>
      <div className="space-y-1">
        {items.map(({ key, label, desc }) => (
          <label
            key={key}
            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-low transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-on-surface">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => toggle(key)}
              className="h-5 w-5 rounded-md border-2 border-border-light text-primary focus:ring-primary cursor-pointer"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function PrivacySettings() {
  const [settings, setSettings] = useState({
    showOnLeaderboard: true,
    shareActivity: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Privacy setting updated");
  };

  return (
    <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-on-surface">Privacy</h2>
        <p className="text-sm text-muted mt-1">Control your visibility on the platform</p>
      </div>
      <div className="space-y-1">
        <label className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-low transition-colors cursor-pointer">
          <div>
            <p className="text-sm font-medium text-on-surface">Show on leaderboard</p>
            <p className="text-xs text-muted">Display your name and rank on public leaderboards</p>
          </div>
          <input
            type="checkbox"
            checked={settings.showOnLeaderboard}
            onChange={() => toggle("showOnLeaderboard")}
            className="h-5 w-5 rounded-md border-2 border-border-light text-primary focus:ring-primary cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-low transition-colors cursor-pointer">
          <div>
            <p className="text-sm font-medium text-on-surface">Share learning activity</p>
            <p className="text-xs text-muted">Allow instructors to see your progress and activity</p>
          </div>
          <input
            type="checkbox"
            checked={settings.shareActivity}
            onChange={() => toggle("shareActivity")}
            className="h-5 w-5 rounded-md border-2 border-border-light text-primary focus:ring-primary cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
