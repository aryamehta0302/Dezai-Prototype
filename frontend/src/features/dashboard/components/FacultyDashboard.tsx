"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Bell,
  BookOpen,
  Users,
  Award,
  Clock,
  PlusCircle,
  Trophy,
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
  User,
  Building2,
  ChevronRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { apiClient } from "@/core/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { toast } from "sonner";


// --- Interfaces ---
interface DashboardStats {
  totalPrograms: number;
  totalStudents: number;
  pendingAttempts: number;
  completionRate: number;
}

interface StudentMetric {
  userId: string;
  name: string;
  email: string;
  xp: number;
  progress: number;
  programTitle: string;
}

interface DifficultModule {
  moduleId: string;
  moduleTitle: string;
  programTitle: string;
  passRate: number;
  averageScore: number;
  totalAttempts: number;
}

interface ExtendedAnalytics {
  totalPrograms: number;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  topStudents: StudentMetric[];
  weakStudents: StudentMetric[];
  difficultModules: DifficultModule[];
}

interface ActivityEvent {
  id: string;
  type: "ENROLLMENT" | "SUBMISSION" | "COMPLETION";
  timestamp: string;
  studentName: string;
  programTitle: string;
  detail: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "REMINDER" | "CREDENTIAL" | "UPDATE" | "SYSTEM" | "ANNOUNCEMENT";
  read: boolean;
  createdAt: string;
}

interface FacultyProfile {
  id: string;
  department: string | null;
  designation: string | null;
  verificationStatus: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    xp: number;
    streakCount: number;
  };
  institution: {
    id: string;
    name: string;
    logoUrl: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
  };
}

interface DashboardResponse { stats: DashboardStats }
interface ExtendedAnalyticsResponse { success: boolean; data: ExtendedAnalytics }
interface ActivityResponse { success: boolean; data: ActivityEvent[] }
interface NotificationsResponse { notifications: NotificationItem[] }
interface ProgramsListResponse { programs: ProgramItem[] }
interface QuestionBanksResponse { questionBanks: QuestionBankItem[] }
interface ProgramItem { id: string; title: string; tracks?: { modules?: { id: string; title: string }[] }[] }
interface QuestionBankItem { id: string; title: string }

export function FacultyDashboard() {
  const { user: authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalPrograms: 0, totalStudents: 0, pendingAttempts: 0, completionRate: 0 });
  const [analytics, setAnalytics] = useState<ExtendedAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [programTitle, setProgramTitle] = useState("");
  const [programDesc, setProgramDesc] = useState("");
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [passingScore, setPassingScore] = useState(80);
  const [sampleSize, setSampleSize] = useState(10);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [programsList, setProgramsList] = useState<ProgramItem[]>([]);
  const [banksList, setBanksList] = useState<QuestionBankItem[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profRes = await apiClient.get<FacultyProfile>("/users/faculty/profile");
      if (profRes) {
        setProfile(profRes);
        setEditName(profRes.user.name || "");
        setEditDept(profRes.department || "");
        setEditDesignation(profRes.designation || "");
      }

      const statsRes = await apiClient.get<DashboardResponse>("/users/faculty/dashboard");
      if (statsRes?.stats) setStats(statsRes.stats);

      const analyticsRes = await apiClient.get<ExtendedAnalyticsResponse>("/analytics/faculty/extended");
      if (analyticsRes && analyticsRes.success && analyticsRes.data) {
        const d = analyticsRes.data;
        setAnalytics(d);
        setStats(prev => ({ ...prev, completionRate: d.completionRate, totalStudents: d.totalStudents, totalPrograms: d.totalPrograms }));
      }

      const activityRes = await apiClient.get<ActivityResponse>("/analytics/faculty/activity");
      if (activityRes && activityRes.success && Array.isArray(activityRes.data)) setActivity(activityRes.data);

      const notifRes = await apiClient.get<NotificationsResponse>("/notifications");
      if (notifRes?.notifications) setNotifications(notifRes.notifications);
    } catch (err) {
      console.error("Error loading dashboard details:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchModalPrerequisites = async () => {
    try {
      const progRes = await apiClient.get<ProgramsListResponse>("/programs");
      if (progRes?.programs) setProgramsList(progRes.programs);
      const bankRes = await apiClient.get<QuestionBanksResponse>("/assessments/question-banks");
      if (bankRes?.questionBanks) setBanksList(bankRes.questionBanks);
    } catch { /* ignore */ }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success("Notification marked as read");
    } catch { toast.error("Failed to update notification"); }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed to mark all as read"); }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle || !programDesc || isCreatingProgram) return;
    setIsCreatingProgram(true);
    try {
      await apiClient.post("/programs", { title: programTitle, description: programDesc });
      toast.success("Program created successfully!");
      setShowProgramModal(false);
      setProgramTitle("");
      setProgramDesc("");
      fetchDashboardData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create program");
    } finally { setIsCreatingProgram(false); }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentTitle || !selectedModuleId || !selectedBankId || isCreatingAssessment) { toast.error("Please fill in all required fields."); return; }
    setIsCreatingAssessment(true);
    try {
      await apiClient.post("/assessments", { title: assessmentTitle, moduleId: selectedModuleId, questionBankId: selectedBankId, passingScore: Number(passingScore), sampleSize: Number(sampleSize) });
      toast.success("Assessment published successfully!");
      setShowAssessmentModal(false);
      setAssessmentTitle("");
      setSelectedModuleId("");
      setSelectedBankId("");
      fetchDashboardData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create assessment");
    } finally { setIsCreatingAssessment(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const res = await apiClient.patch<{ profile: FacultyProfile }>("/users/faculty/profile", { name: editName, department: editDept, designation: editDesignation });
      if (res?.profile) { setProfile(res.profile); toast.success("Profile updated successfully!"); }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update profile info"); }
    finally { setIsSavingProfile(false); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <PageContainer className="py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-sm text-muted">Loading dashboard...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border-light bg-white flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-1">
          <div className="mb-4 flex items-center gap-2.5 px-2">
            {profile?.institution.logoUrl ? (
              <img src={profile.institution.logoUrl} alt="Logo" className="h-7 w-7 rounded-lg object-contain border border-border-light" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
            <span className="text-sm font-semibold text-on-surface truncate">{profile?.institution.name || "University"}</span>
          </div>

          {[
            { value: "overview", icon: LayoutDashboard, label: "Overview" },
            { value: "analytics", icon: BarChart3, label: "Analytics" },
            { value: "profile", icon: Settings, label: "Profile" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === value
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface hover:text-on-surface"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border-light flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {profile?.user.name ? profile.user.name.charAt(0).toUpperCase() : "I"}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-on-surface truncate">{profile?.user.name || "Instructor"}</p>
            <p className="text-xs text-muted">{profile?.designation || "Faculty"}</p>
          </div>
          <button
            onClick={() => setShowNotifications(true)}
            className="ml-auto relative p-1.5 rounded-lg hover:bg-surface transition-colors text-muted"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-danger text-white text-2xs font-bold flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-(--container-max) px-4 sm:px-6 lg:px-12 py-8">

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Programs", value: stats.totalPrograms, icon: BookOpen, color: "text-primary bg-primary/10" },
                { label: "Students", value: stats.totalStudents, icon: Users, color: "text-success bg-success/10" },
                { label: "Pending", value: stats.pendingAttempts, icon: Clock, color: "text-warning bg-warning/10" },
                { label: "Completion", value: `${stats.completionRate}%`, icon: Award, color: "text-info bg-info/10" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card-elevation p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted font-medium">{label}</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card-elevation p-5 space-y-4">
                <h3 className="text-sm font-semibold text-on-surface">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setShowProgramModal(true)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-light hover:border-primary/30 hover:bg-surface transition-colors text-left">
                    <PlusCircle className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">Create Program</p>
                      <p className="text-xs text-muted">Scaffold a new micro-credential</p>
                    </div>
                  </button>
                  <button onClick={async () => { await fetchModalPrerequisites(); setShowAssessmentModal(true); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-light hover:border-primary/30 hover:bg-surface transition-colors text-left">
                    <PlusCircle className="h-5 w-5 text-success shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">Publish Assessment</p>
                      <p className="text-xs text-muted">Create and link a quiz</p>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab("analytics")} className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-primary/30 hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-info shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-on-surface">View Analytics</p>
                        <p className="text-xs text-muted">Cohort performance metrics</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted shrink-0" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 card-elevation p-5 space-y-4">
                <h3 className="text-sm font-semibold text-on-surface">Recent Student Activity</h3>
                <div className="space-y-3 max-h-[320px] overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted">
                      <Clock className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs">Enrollments and submissions will appear here.</p>
                    </div>
                  ) : (
                    activity.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-high transition-colors">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          event.type === "COMPLETION" ? "bg-success/10 text-success" :
                          event.type === "SUBMISSION" ? "bg-warning/10 text-warning" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {event.type === "COMPLETION" ? <Award className="h-4 w-4" /> :
                           event.type === "SUBMISSION" ? <FileText className="h-4 w-4" /> :
                           <Users className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-sm font-medium text-on-surface truncate">{event.studentName}</p>
                            <span className="text-xs text-muted shrink-0">
                              {new Date(event.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-xs text-muted truncate">{event.detail}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="card-elevation px-4 py-3 text-center">
                <p className="text-xs text-muted font-medium">Total Enrolled</p>
                <p className="text-lg font-bold text-on-surface">{stats.totalStudents}</p>
              </div>
              <div className="card-elevation px-4 py-3 text-center">
                <p className="text-xs text-muted font-medium">Active Users</p>
                <p className="text-lg font-bold text-on-surface">{analytics?.activeStudents || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card-elevation p-5 space-y-4">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" /> Top Performers
              </h4>
              <div className="space-y-2">
                {!analytics?.topStudents?.length ? (
                  <p className="text-sm text-muted text-center py-6">No data available.</p>
                ) : (
                  analytics.topStudents.map((s, i) => (
                    <div key={s.userId} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? "bg-warning/20 text-warning" :
                          i === 1 ? "bg-slate-200 text-slate-700" :
                          i === 2 ? "bg-amber-100 text-amber-800" :
                          "bg-surface-high text-muted"
                        }`}>{i + 1}</span>
                        <div className="truncate">
                          <p className="text-sm font-medium text-on-surface truncate">{s.name}</p>
                          <p className="text-xs text-muted truncate">{s.programTitle}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-primary">{s.xp} XP</p>
                        <p className="text-xs text-muted">{s.progress}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-elevation p-5 space-y-4">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" /> Needs Attention
              </h4>
              <div className="space-y-2">
                {!analytics?.weakStudents?.length ? (
                  <p className="text-sm text-muted text-center py-6">All students on track.</p>
                ) : (
                  analytics.weakStudents.map((s) => (
                    <div key={s.userId} className="flex items-center justify-between p-3 rounded-xl bg-danger/5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{s.name}</p>
                        <p className="text-xs text-muted truncate">{s.programTitle}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-medium shrink-0">
                        {s.progress}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-elevation p-5 space-y-4">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-info" /> Difficult Modules
              </h4>
              <div className="space-y-2">
                {!analytics?.difficultModules?.length ? (
                  <div className="text-center py-6 text-muted">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">All stable</p>
                    <p className="text-xs">No difficult modules detected.</p>
                  </div>
                ) : (
                  analytics.difficultModules.map((m) => (
                    <div key={m.moduleId} className="p-3 rounded-xl bg-surface space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{m.moduleTitle}</p>
                          <p className="text-xs text-muted truncate">{m.programTitle}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          m.passRate < 50 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                        }`}>{m.passRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted pt-1 border-t border-border-light">
                        <span>Avg: {m.averageScore}%</span>
                        <span>{m.totalAttempts} attempts</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-elevation p-6 space-y-6">
              <h3 className="text-base font-semibold text-on-surface">Profile Details</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">Full Name</label>
                    <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">Email</label>
                    <input type="email" disabled value={profile?.user.email || ""}
                      className="w-full rounded-xl border border-border-light bg-surface-high px-4 py-2.5 text-sm outline-hidden text-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">Department</label>
                    <input type="text" required value={editDept} onChange={(e) => setEditDept(e.target.value)} placeholder="e.g. Computer Science"
                      className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">Designation</label>
                    <input type="text" required value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} placeholder="e.g. Assistant Professor"
                      className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2">
                    {isSavingProfile ? (
                      <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</>
                    ) : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card-elevation p-6 space-y-4">
              <h3 className="text-base font-semibold text-on-surface">Institution</h3>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-surface space-y-3">
                {profile?.institution.logoUrl ? (
                  <img src={profile.institution.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-2xl bg-white border border-border-light p-2.5" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">{profile?.institution.name}</h4>
                  <span className="text-xs text-muted bg-primary-container text-primary px-2 py-0.5 rounded-full inline-block mt-1">
                    {profile?.verificationStatus}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface">
                  <MapPin className="h-4 w-4 text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted font-medium">Location</p>
                    <p className="text-sm text-on-surface">
                      {[profile?.institution.city, profile?.institution.state, profile?.institution.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface">
                  <User className="h-4 w-4 text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted font-medium">Faculty ID</p>
                    <p className="text-sm font-mono text-on-surface">{profile?.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-danger/10 text-danger text-xs font-medium px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary hover:underline">Mark all read</button>
                )}
                <button onClick={() => setShowNotifications(false)} className="p-1 rounded-lg hover:bg-surface text-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted">
                  <Bell className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} onClick={() => !n.read && handleMarkAsRead(n.id)}
                    className={`p-3.5 rounded-xl transition-colors cursor-pointer ${
                      n.read ? "bg-white border border-border-light" : "bg-primary/5 border border-primary/20"
                    }`}>
                    {!n.read && <span className="float-right h-2 w-2 rounded-full bg-primary mt-1" />}
                    <h4 className="text-sm font-medium text-on-surface">{n.title}</h4>
                    <p className="text-xs text-muted mt-0.5">{n.message}</p>
                    <span className="text-xs text-muted block mt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setShowProgramModal(false)} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-on-surface">Create Program</h3>
              <button onClick={() => setShowProgramModal(false)} className="p-1 rounded-lg hover:bg-surface text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Program Title</label>
                <input type="text" required placeholder="e.g. Advanced AI & Prompt Engineering" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Description</label>
                <textarea required rows={3} placeholder="Provide an overview of the curriculum..." value={programDesc} onChange={(e) => setProgramDesc(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-high text-on-surface text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isCreatingProgram}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                  {isCreatingProgram ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating...</> : "Publish Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setShowAssessmentModal(false)} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-on-surface">Publish Assessment</h3>
              <button onClick={() => setShowAssessmentModal(false)} className="p-1 rounded-lg hover:bg-surface text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Assessment Title</label>
                <input type="text" required placeholder="e.g. Module 1 Final Quiz" value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Module</label>
                  <select required value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors">
                    <option value="">Select module</option>
                    {programsList.map((prog) => (
                      <optgroup key={prog.id} label={prog.title}>
                        {prog.tracks?.map((track: { modules?: { id: string; title: string }[] }) =>
                          track.modules?.map((mod: { id: string; title: string }) => (
                            <option key={mod.id} value={mod.id}>{mod.title}</option>
                          ))
                        )}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Question Bank</label>
                  <select required value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors">
                    <option value="">Select bank</option>
                    {banksList.map((bank) => (
                      <option key={bank.id} value={bank.id}>{bank.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Passing Score (%)</label>
                  <input type="number" min="1" max="100" required value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Questions</label>
                  <input type="number" min="1" required value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-light bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-high text-on-surface text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isCreatingAssessment}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                  {isCreatingAssessment ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Publishing...</> : "Publish Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
