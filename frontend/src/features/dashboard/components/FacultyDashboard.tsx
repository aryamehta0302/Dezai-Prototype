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
  MapPin
} from "lucide-react";
import { ModuleCompletionChart } from "@/features/analytics/components/module-completion-chart";
import { ProgramPerformanceChart } from "@/features/analytics/components/program-performance-chart";
import { useProgramAnalytics } from "@/features/analytics/hooks/useProgramAnalytics";
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
  type: 'ENROLLMENT' | 'SUBMISSION' | 'COMPLETION';
  timestamp: string;
  studentName: string;
  programTitle: string;
  detail: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'CREDENTIAL' | 'UPDATE' | 'SYSTEM' | 'ANNOUNCEMENT';
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

export function FacultyDashboard() {
  const { user: authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "profile">("overview");
  const [loading, setLoading] = useState(true);

  // States
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalStudents: 0,
    pendingAttempts: 0,
    completionRate: 0,
  });
  const [analytics, setAnalytics] = useState<ExtendedAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal States
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

  // Form states for profile edit
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Auxiliary data for creation modals & analytics
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [banksList, setBanksList] = useState<any[]>([]);
  const [analyticsProgramId, setAnalyticsProgramId] = useState<string>("");
  const { moduleStats, isLoading: moduleStatsLoading } = useProgramAnalytics(analyticsProgramId);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const profRes = await apiClient.get<any>("/users/faculty/profile");
      if (profRes) {
        setProfile(profRes);
        setEditName(profRes.user.name || "");
        setEditDept(profRes.department || "");
        setEditDesignation(profRes.designation || "");
      }

      // Fetch summary stats
      const statsRes = await apiClient.get<any>("/users/faculty/dashboard");
      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }

      // Fetch extended analytics
      const analyticsRes = await apiClient.get<any>("/analytics/faculty/extended");
      if (analyticsRes && analyticsRes.success && analyticsRes.data) {
        const analyticsData = analyticsRes.data;
        setAnalytics(analyticsData);
        // Sync overview metrics with extended calculation
        setStats(prev => ({
          ...prev,
          completionRate: analyticsData.completionRate,
          totalStudents: analyticsData.totalStudents,
          totalPrograms: analyticsData.totalPrograms,
        }));
      }

      // Fetch activity feed
      const activityRes = await apiClient.get<any>("/analytics/faculty/activity");
      if (activityRes && activityRes.success && Array.isArray(activityRes.data)) {
        setActivity(activityRes.data);
      }

      // Fetch programs list for charts
      const progRes = await apiClient.get<any>("/programs");
      if (progRes?.programs) {
        setProgramsList(progRes.programs);
        if (progRes.programs.length > 0) setAnalyticsProgramId(progRes.programs[0].id);
      }

      // Fetch notifications
      const notifRes = await apiClient.get<any>("/notifications");
      if (notifRes?.notifications) {
        setNotifications(notifRes.notifications);
      }
    } catch (err: any) {
      console.error("Error loading dashboard details:", err);
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch programs and question banks for creation modals
  const fetchModalPrerequisites = async () => {
    try {
      const progRes = await apiClient.get<any>("/programs");
      if (progRes?.programs) {
        setProgramsList(progRes.programs);
      }
      const bankRes = await apiClient.get<any>("/assessments/question-banks");
      if (bankRes?.questionBanks) {
        setBanksList(bankRes.questionBanks);
      }
    } catch (err) {
      console.error("Error fetching modal prerequisites:", err);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  // Create Program handler
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle || !programDesc || isCreatingProgram) return;
    setIsCreatingProgram(true);
    try {
      await apiClient.post("/programs", {
        title: programTitle,
        description: programDesc,
      });
      toast.success("Program created successfully!");
      setShowProgramModal(false);
      setProgramTitle("");
      setProgramDesc("");
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create program");
    } finally {
      setIsCreatingProgram(false);
    }
  };

  // Create Assessment handler
  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentTitle || !selectedModuleId || !selectedBankId || isCreatingAssessment) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsCreatingAssessment(true);
    try {
      await apiClient.post("/assessments", {
        title: assessmentTitle,
        moduleId: selectedModuleId,
        questionBankId: selectedBankId,
        passingScore: Number(passingScore),
        sampleSize: Number(sampleSize),
      });
      toast.success("Assessment published successfully!");
      setShowAssessmentModal(false);
      setAssessmentTitle("");
      setSelectedModuleId("");
      setSelectedBankId("");
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create assessment");
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const res = await apiClient.patch<any>("/users/faculty/profile", {
        name: editName,
        department: editDept,
        designation: editDesignation,
      });
      if (res?.profile) {
        setProfile(res.profile);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile info");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-surface-lowest">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-sm font-semibold text-muted">Retrieving dashboard consoles...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-[calc(100vh-64px)] bg-neutral-50/50 flex">
        {/* --- Sidebar Navigation --- */}
      <aside className="w-64 border-r border-border-light bg-white flex flex-col justify-between shrink-0">
        <div className="p-5">
          <div className="mb-6 flex items-center gap-3 px-2">
            {profile?.institution.logoUrl ? (
              <img
                src={profile.institution.logoUrl}
                alt="Logo"
                className="h-8 w-8 rounded-lg object-contain border border-border-light"
              />
            ) : (
              <Building2 className="h-7 w-7 text-primary" />
            )}
            <div className="truncate">
              <h4 className="text-sm font-bold text-on-surface truncate">{profile?.institution.name || "University"}</h4>
              <span className="text-2xs text-muted font-medium">Affiliated Node</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "overview"
                ? "bg-primary text-white shadow-md shadow-primary/10"
                : "text-muted hover:bg-surface hover:text-on-surface"
                }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Console Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "analytics"
                ? "bg-primary text-white shadow-md shadow-primary/10"
                : "text-muted hover:bg-surface hover:text-on-surface"
                }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              <span>Analytics & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "profile"
                ? "bg-primary text-white shadow-md shadow-primary/10"
                : "text-muted hover:bg-surface hover:text-on-surface"
                }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Instructor Profile</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-border-light bg-neutral-50/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {profile?.user.name ? profile.user.name.charAt(0).toUpperCase() : "I"}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-on-surface truncate">{profile?.user.name || "Instructor"}</p>
            <span className="text-2xs font-semibold text-muted bg-primary-container text-primary px-2 py-0.5 rounded-full capitalize">
              {profile?.designation || "Faculty"}
            </span>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub Header / Action bar */}
        <header className="h-16 bg-white border-b border-border-light px-6 flex items-center justify-between shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-on-surface capitalize">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "analytics" && "Cohort Analytics"}
              {activeTab === "profile" && "Profile & Institution Settings"}
            </h1>
            <p className="text-2xs text-muted font-medium">Manage and audit your micro-credentials</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-xl hover:bg-surface transition-all text-on-surface/80"
            >
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4.5 min-w-4.5 px-1 rounded-full bg-danger text-white text-3xs font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Panel */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto">

          {/* --- TAB 1: OVERVIEW --- */}
          {activeTab === "overview" && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric Card 1 */}
                <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-muted uppercase tracking-wider">Taught Programs</span>
                    <h2 className="text-2xl font-black text-on-surface">{stats.totalPrograms}</h2>
                    <span className="text-3xs text-muted flex items-center gap-1 font-semibold">
                      <TrendingUp className="h-3 w-3 text-success" /> Active curriculum units
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-all">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-muted uppercase tracking-wider">Total Cohort</span>
                    <h2 className="text-2xl font-black text-on-surface">{stats.totalStudents}</h2>
                    <span className="text-3xs text-muted flex items-center gap-1 font-semibold">
                      <Users className="h-3 w-3 text-success" /> Enrolled learners
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-105 transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-muted uppercase tracking-wider">Pending Submissions</span>
                    <h2 className="text-2xl font-black text-on-surface">{stats.pendingAttempts}</h2>
                    <span className="text-3xs text-muted flex items-center gap-1 font-semibold">
                      <Clock className="h-3 w-3 text-warning" /> Quizzes awaiting grade
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-105 transition-all">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>

                {/* Metric Card 4 */}
                <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-muted uppercase tracking-wider">Completion Rate</span>
                    <h2 className="text-2xl font-black text-on-surface">{stats.completionRate}%</h2>
                    <span className="text-3xs text-muted flex items-center gap-1 font-semibold">
                      <Award className="h-3 w-3 text-success" /> Earned credentials
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center text-info group-hover:scale-105 transition-all">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Quick Actions */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-on-surface">Console Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowProgramModal(true)}
                        className="w-full flex items-center gap-3 p-3 text-left border border-border-light hover:border-primary/30 hover:bg-neutral-50 rounded-xl transition-all duration-200 group"
                      >
                        <PlusCircle className="h-5 w-5 text-primary group-hover:scale-105 transition-all" />
                        <div>
                          <p className="text-xs font-bold text-on-surface">Create Program</p>
                          <span className="text-3xs text-muted font-medium">Scaffold new micro-credential</span>
                        </div>
                      </button>

                      <button
                        onClick={async () => {
                          await fetchModalPrerequisites();
                          setShowAssessmentModal(true);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left border border-border-light hover:border-primary/30 hover:bg-neutral-50 rounded-xl transition-all duration-200 group"
                      >
                        <PlusCircle className="h-5 w-5 text-success group-hover:scale-105 transition-all" />
                        <div>
                          <p className="text-xs font-bold text-on-surface">Publish Assessment</p>
                          <span className="text-3xs text-muted font-medium">Create and link custom quiz</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("analytics")}
                        className="w-full flex items-center justify-between p-3 text-left border border-border-light hover:border-primary/30 hover:bg-neutral-50 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-info group-hover:scale-105 transition-all" />
                          <div>
                            <p className="text-xs font-bold text-on-surface">View Performance</p>
                            <span className="text-3xs text-muted font-medium">See cohorts analytics</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Recent Activity Feed */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4 h-[400px] flex flex-col">
                    <h3 className="text-sm font-extrabold text-on-surface">Recent Student Activity</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {activity.length === 0 ? (
                        <div className="flex h-full items-center justify-center flex-col text-center p-6 text-muted">
                          <Clock className="h-10 w-10 mb-2 opacity-30" />
                          <p className="text-xs font-semibold">No recent activity detected.</p>
                          <span className="text-3xs text-muted">Enrollments or quiz submissions will populate here.</span>
                        </div>
                      ) : (
                        activity.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-all"
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${event.type === 'COMPLETION' ? 'bg-success/10 text-success' :
                              event.type === 'SUBMISSION' ? 'bg-warning/10 text-warning' :
                                'bg-primary/10 text-primary'
                              }`}>
                              {event.type === 'COMPLETION' && <Award className="h-4 w-4" />}
                              {event.type === 'SUBMISSION' && <FileText className="h-4 w-4" />}
                              {event.type === 'ENROLLMENT' && <Users className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center gap-2">
                                <p className="text-xs font-bold text-on-surface truncate">{event.studentName}</p>
                                <span className="text-3xs text-muted font-medium shrink-0">
                                  {new Date(event.timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-2xs text-muted font-semibold mt-0.5 truncate">{event.detail}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- TAB 2: ANALYTICS & WIDGETS --- */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Analytics Subheader */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <BarChart3 className="h-4.5 w-4.5" /> Cohort Metrics & Diagnostics
                  </h3>
                  <p className="text-2xs text-muted font-medium">Use these cards to pinpoint weak performers and difficult quiz modules.</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center bg-white px-4 py-2.5 rounded-xl border border-border-light shadow-sm">
                    <span className="text-3xs text-muted uppercase font-bold">Total Enrolled</span>
                    <p className="text-sm font-black text-on-surface">{stats.totalStudents}</p>
                  </div>
                  <div className="text-center bg-white px-4 py-2.5 rounded-xl border border-border-light shadow-sm">
                    <span className="text-3xs text-muted uppercase font-bold">Active Users</span>
                    <p className="text-sm font-black text-on-surface">{analytics?.activeStudents || 0}</p>
                  </div>
                </div>
              </div>

              {/* Grid Layout for Cohort Detail Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Performance: Top vs Weak Student XP */}
                <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Student Performance (XP vs Progress)
                  </h4>
                  <ProgramPerformanceChart
                    topStudents={analytics?.topStudents ?? []}
                    weakStudents={analytics?.weakStudents ?? []}
                    isLoading={loading}
                  />
                </div>

                {/* Module Completion Chart */}
                <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-info" /> Module Completion Rates
                    </h4>
                    <select
                      value={analyticsProgramId}
                      onChange={(e) => setAnalyticsProgramId(e.target.value)}
                      className="rounded-lg border border-border-light bg-neutral-50 px-2 py-1 text-3xs font-bold outline-hidden focus:border-primary"
                    >
                      {programsList.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  {analyticsProgramId ? (
                    <ModuleCompletionChart
                      moduleStats={moduleStats}
                      isLoading={moduleStatsLoading}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
                      <BookOpen className="h-8 w-8 opacity-30" />
                      <p className="text-xs font-semibold">Select a program to see module stats.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Top Students Leaderboard */}
                <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" /> Top Performers (XP)
                  </h4>
                  <div className="space-y-2.5">
                    {!analytics?.topStudents || analytics.topStudents.length === 0 ? (
                      <p className="text-2xs text-muted text-center py-6">No cohort data available.</p>
                    ) : (
                      analytics.topStudents.map((student, idx) => (
                        <div key={student.userId} className="flex items-center justify-between p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? 'bg-warning/20 text-warning border border-warning/30' :
                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                                idx === 2 ? 'bg-amber-100 text-amber-800' :
                                  'bg-neutral-100 text-muted'
                              }`}>
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-on-surface truncate">{student.name}</p>
                              <span className="text-3xs text-muted truncate block">{student.programTitle}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-primary">{student.xp} XP</p>
                            <span className="text-3xs text-muted font-semibold">{student.progress}% Progress</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Weak Students Attention Widget */}
                <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger" /> Needs Attention (Low Progress)
                  </h4>
                  <div className="space-y-2.5">
                    {!analytics?.weakStudents || analytics.weakStudents.length === 0 ? (
                      <p className="text-2xs text-muted text-center py-6">All students performing stably.</p>
                    ) : (
                      analytics.weakStudents.map((student) => (
                        <div key={student.userId} className="flex items-center justify-between p-3 bg-danger/5 border border-danger/10 rounded-xl">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-on-surface truncate">{student.name}</p>
                            <span className="text-3xs text-muted truncate block">{student.programTitle}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-3xs font-extrabold">
                              {student.progress}% progress
                            </span>
                            <p className="text-3xs text-muted mt-1 font-semibold">{student.xp} total XP</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Difficult Modules Diagnostics */}
                <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-info" /> Difficult Modules (Quiz stats)
                  </h4>
                  <div className="space-y-2.5">
                    {!analytics?.difficultModules || analytics.difficultModules.length === 0 ? (
                      <div className="text-center py-6 text-muted">
                        <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-50" />
                        <p className="text-2xs font-semibold">No critical diagnostic logs.</p>
                        <span className="text-3xs">All assessments showing stable pass rates.</span>
                      </div>
                    ) : (
                      analytics.difficultModules.map((module) => (
                        <div key={module.moduleId} className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-bold text-on-surface truncate">{module.moduleTitle}</p>
                              <span className="text-3xs text-muted truncate block">{module.programTitle}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${module.passRate < 50 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                              }`}>
                              {module.passRate}% Pass Rate
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-3xs text-muted font-semibold pt-1 border-t border-dashed border-neutral-200">
                            <span>Avg. Score: {module.averageScore}%</span>
                            <span>{module.totalAttempts} total attempts</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- TAB 3: INSTRUCTOR PROFILE & SETTINGS --- */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form Editor */}
              <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="text-sm font-extrabold text-on-surface">Update Profile Details</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface/80">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface/80">Email Address (Read-Only)</label>
                      <input
                        type="email"
                        disabled
                        value={profile?.user.email || ""}
                        className="w-full rounded-xl border border-border-light bg-neutral-100/70 px-4 py-2.5 text-xs outline-hidden text-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface/80">Academic Department</label>
                      <input
                        type="text"
                        required
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface/80">Designation / Title</label>
                      <input
                        type="text"
                        required
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        placeholder="e.g. Assistant Professor"
                        className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md hover:shadow-primary/10 transition-all flex items-center gap-2"
                    >
                      {isSavingProfile ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving changes...
                        </>
                      ) : (
                        "Save Profile Updates"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Affiliated Institution details */}
              <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-1">
                <h3 className="text-sm font-extrabold text-on-surface">Institution Affiliation</h3>
                <div className="flex flex-col items-center text-center p-4 bg-neutral-50/50 rounded-xl border border-neutral-100 space-y-3">
                  {profile?.institution.logoUrl ? (
                    <img
                      src={profile.institution.logoUrl}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-2xl bg-white border border-border-light p-2.5 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Building2 className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-extrabold text-on-surface">{profile?.institution.name}</h4>
                    <span className="text-3xs text-muted font-bold tracking-wider uppercase bg-primary-container text-primary px-2 py-0.5 rounded-full inline-block mt-1">
                      Faculty Affiliation Status: {profile?.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-semibold text-on-surface/90">
                  <div className="flex items-center gap-2.5 p-3 bg-neutral-50/50 rounded-xl">
                    <MapPin className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-3xs text-muted font-bold">LOCATION</p>
                      <p className="text-2xs text-on-surface font-extrabold">
                        {profile?.institution.city && `${profile.institution.city}, `}
                        {profile?.institution.state && `${profile.institution.state}, `}
                        {profile?.institution.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-neutral-50/50 rounded-xl">
                    <User className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-3xs text-muted font-bold">TEACHER ID</p>
                      <p className="text-2xs font-mono font-bold text-on-surface">{profile?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
      </div>

      {/* --- NOTIFICATIONS SIDEBAR DRAWER --- */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Overlay backdrop */}
          <div
            onClick={() => setShowNotifications(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-4 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-on-surface">Instructor Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-danger/10 text-danger text-3xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-3xs font-bold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted">
                  <Bell className="h-10 w-10 mb-2 opacity-30 animate-bounce" />
                  <p className="text-xs font-semibold">No alerts recorded.</p>
                  <span className="text-3xs">System warnings and updates will display here.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                    className={`p-3.5 border rounded-xl transition-all relative cursor-pointer ${n.read
                      ? 'bg-white border-border-light text-on-surface/80 hover:bg-neutral-50/50'
                      : 'bg-primary/5 border-primary/20 text-on-surface hover:bg-primary/10 shadow-xs'
                      }`}
                  >
                    {!n.read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                    )}
                    <h4 className="text-xs font-bold pr-4">{n.title}</h4>
                    <p className="text-2xs text-muted font-semibold mt-1">{n.message}</p>
                    <span className="text-3xs text-muted font-semibold block mt-2">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE PROGRAM MODAL --- */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setShowProgramModal(false)} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-on-surface">Create New Micro-Credential Program</h3>
              <button onClick={() => setShowProgramModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-on-surface/85">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced AI & Prompt Engineering"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-on-surface/85">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide an overview of the curriculum and track options..."
                  value={programDesc}
                  onChange={(e) => setProgramDesc(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-on-surface font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProgram}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isCreatingProgram ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    "Publish Program"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE ASSESSMENT MODAL --- */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setShowAssessmentModal(false)} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-on-surface">Publish New Assessment</h3>
              <button onClick={() => setShowAssessmentModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-on-surface/85">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1 Final Quiz"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module selection */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-on-surface/85">Select Module</label>
                  <select
                    required
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                  >
                    <option value="">-- Choose Module --</option>
                    {programsList.map((prog) => (
                      <optgroup key={prog.id} label={prog.title}>
                        {prog.tracks?.map((track: any) => (
                          track.modules?.map((mod: any) => (
                            <option key={mod.id} value={mod.id}>
                              {mod.title}
                            </option>
                          ))
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Question Bank selection */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-on-surface/85">Select Question Bank</label>
                  <select
                    required
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                  >
                    <option value="">-- Choose Bank --</option>
                    {banksList.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Passing score */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-on-surface/85">Passing Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Sample size */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-on-surface/85">Questions Count (Sample Size)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-on-surface font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAssessment}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isCreatingAssessment ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Assessment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
