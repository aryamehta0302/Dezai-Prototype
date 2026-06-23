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
  Lightbulb
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
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "monitoring" | "insights" | "profile">("overview");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalPrograms: 0, totalStudents: 0, pendingAttempts: 0, completionRate: 0 });
  const [analytics, setAnalytics] = useState<ExtendedAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Faculty Monitoring States
  const [taughtPrograms, setTaughtPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [programAnalytics, setProgramAnalytics] = useState<any>(null);
  const [moduleStats, setModuleStats] = useState<any[]>([]);
  const [cohortStudents, setCohortStudents] = useState<any[]>([]);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  // Student Detail Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [detailedProgress, setDetailedProgress] = useState<any>(null);
  const [loadingDetailedProgress, setLoadingDetailedProgress] = useState(false);

  // Faculty Insights & Interventions States
  const [programInsights, setProgramInsights] = useState<any>(null);
  const [interventionsList, setInterventionsList] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [outreachStudent, setOutreachStudent] = useState<any>(null);
  const [outreachMessage, setOutreachMessage] = useState("");
  const [submittingIntervention, setSubmittingIntervention] = useState(false);

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

      // Fetch taught programs for the monitoring selector
      const progListRes = await apiClient.get<any>("/analytics/faculty/programs");
      if (progListRes && progListRes.success && Array.isArray(progListRes.data)) {
        setTaughtPrograms(progListRes.data);
        if (progListRes.data.length > 0 && !selectedProgramId) {
          setSelectedProgramId(progListRes.data[0].id);
        }
      }

      // Fetch notifications
      const notifRes = await apiClient.get<any>("/notifications");
      if (notifRes?.notifications) {
        setNotifications(notifRes.notifications);
      }
    } catch (err: any) {
      console.error("Error loading dashboard details:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchProgramMonitoringData = async (programId: string) => {
    if (!programId) return;
    try {
      setLoadingMonitoring(true);
      
      // 1. Fetch program general metrics
      const analyticsRes = await apiClient.get<any>(`/analytics/programs/${programId}`);
      if (analyticsRes && analyticsRes.success) {
        setProgramAnalytics(analyticsRes.data);
      }

      // 2. Fetch module completion statistics
      const modulesRes = await apiClient.get<any>(`/analytics/programs/${programId}/modules/stats`);
      if (modulesRes && modulesRes.success) {
        setModuleStats(modulesRes.data);
      }

      // 3. Fetch student metrics table
      const studentsRes = await apiClient.get<any>(`/analytics/programs/${programId}/students`);
      if (studentsRes && studentsRes.success && studentsRes.data) {
        setCohortStudents(studentsRes.data.students || []);
      }
    } catch (err: any) {
      console.error("Error loading program monitoring details:", err);
      toast.error(err.message || "Failed to load program metrics.");
    } finally {
      setLoadingMonitoring(false);
    }
  };

  useEffect(() => {
    if (selectedProgramId) {
      fetchProgramMonitoringData(selectedProgramId);
    }
  }, [selectedProgramId]);

  const handleOpenStudentDrawer = async (studentId: string) => {
    if (!studentId || !selectedProgramId) return;
    setSelectedStudentId(studentId);
    setDrawerOpen(true);
    setDetailedProgress(null);
    try {
      setLoadingDetailedProgress(true);
      const detailRes = await apiClient.get<any>(`/analytics/programs/${selectedProgramId}/students/${studentId}`);
      if (detailRes && detailRes.success) {
        setDetailedProgress(detailRes.data);
      }
    } catch (err: any) {
      console.error("Error loading student detailed progress:", err);
      toast.error(err.message || "Failed to load student progress details.");
      setDrawerOpen(false);
    } finally {
      setLoadingDetailedProgress(false);
    }
  };

  const fetchInsightsData = async (programId: string) => {
    if (!programId) return;
    try {
      setLoadingInsights(true);
      const insightsRes = await apiClient.get<any>(`/analytics/programs/${programId}/insights`);
      if (insightsRes && insightsRes.success) {
        setProgramInsights(insightsRes.data);
      }
      
      const interventionsRes = await apiClient.get<any>(`/analytics/programs/${programId}/interventions`);
      if (interventionsRes && interventionsRes.success && Array.isArray(interventionsRes.data)) {
        setInterventionsList(interventionsRes.data);
      }
    } catch (err: any) {
      console.error("Error loading insights metrics:", err);
      toast.error(err.message || "Failed to load cohort health insights.");
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (selectedProgramId && activeTab === "insights") {
      fetchInsightsData(selectedProgramId);
    }
  }, [selectedProgramId, activeTab]);

  const handleSubmitIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !outreachStudent || !outreachMessage.trim() || submittingIntervention) return;
    try {
      setSubmittingIntervention(true);
      const res = await apiClient.post<any>(`/analytics/programs/${selectedProgramId}/interventions`, {
        userId: outreachStudent.id,
        message: outreachMessage.trim(),
      });
      if (res && res.success) {
        toast.success(`Outreach message successfully sent to ${outreachStudent.name}.`);
        setShowInterventionModal(false);
        setOutreachMessage("");
        setOutreachStudent(null);
        fetchInsightsData(selectedProgramId);
      }
    } catch (err: any) {
      console.error("Error sending intervention outreach:", err);
      toast.error(err.message || "Failed to send intervention.");
    } finally {
      setSubmittingIntervention(false);
    }
  };

  // Fetch programs and question banks for creation modals
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

            <button
              onClick={() => setActiveTab("monitoring")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "monitoring"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-muted hover:bg-surface hover:text-on-surface"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Faculty Monitoring</span>
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "insights"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-muted hover:bg-surface hover:text-on-surface"
              }`}
            >
              <Lightbulb className="h-4.5 w-4.5" />
              <span>Insights & Interventions</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-muted hover:bg-surface hover:text-on-surface"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Instructor Profile</span>
            </button>
          </nav>
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

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub Header / Action bar */}
        <header className="h-16 bg-white border-b border-border-light px-6 flex items-center justify-between shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-on-surface capitalize">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "analytics" && "Cohort Analytics"}
              {activeTab === "monitoring" && "Faculty Monitoring"}
              {activeTab === "insights" && "Insights & Interventions"}
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

          {/* --- TAB: MONITORING --- */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              {/* Program Selector & Selector Card */}
              <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-on-surface">Faculty Monitoring Hub</h3>
                  <p className="text-2xs text-muted font-medium">Audit syllabus progress, assessment results, and proctoring logs.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-bold text-muted">Select Program:</span>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="rounded-xl border border-border-light bg-neutral-50 px-4 py-2 text-xs font-semibold outline-hidden focus:border-primary focus:bg-white transition-all"
                  >
                    {taughtPrograms.length === 0 ? (
                      <option value="">No programs available</option>
                    ) : (
                      taughtPrograms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.institutionName})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {loadingMonitoring ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <span className="text-xs font-semibold text-muted">Retrieving cohort monitor...</span>
                  </div>
                </div>
              ) : !selectedProgramId ? (
                <div className="bg-white border border-border-light rounded-2xl p-10 text-center text-muted shadow-sm">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <h3 className="text-sm font-bold text-on-surface">No Programs Found</h3>
                  <p className="text-xs text-muted mt-1">Create a program and enroll students to view metrics.</p>
                </div>
              ) : (
                <>
                  {/* Program Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Metric Card 1 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Total Enrolled</span>
                        <h2 className="text-xl font-black text-on-surface">{programAnalytics?.totalEnrollments ?? 0}</h2>
                        <span className="text-3xs text-muted font-medium">Students joined</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 2 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Active (30d)</span>
                        <h2 className="text-xl font-black text-on-surface">{programAnalytics?.activeLearners ?? 0}</h2>
                        <span className="text-3xs text-muted font-medium">Interacted recently</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 3 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Completion Rate</span>
                        <h2 className="text-xl font-black text-on-surface">{programAnalytics?.completionPercent ?? 0}%</h2>
                        <span className="text-3xs text-muted font-medium">Finished syllabus</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                        <Award className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 4 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Accumulated XP</span>
                        <h2 className="text-xl font-black text-on-surface">{(programAnalytics?.totalXp ?? 0).toLocaleString()}</h2>
                        <span className="text-3xs text-muted font-medium">All student tokens</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                        <Trophy className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Modules Progress list */}
                  {moduleStats.length > 0 && (
                    <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="h-4.5 w-4.5 text-primary" /> Module Syllabus Completion Rates
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {moduleStats.map((mod) => (
                          <div key={mod.moduleId} className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-2xs font-bold text-on-surface">
                              <span className="truncate pr-4">{mod.moduleTitle}</span>
                              <span className="shrink-0 text-primary">{mod.completionPercent}% Completed</span>
                            </div>
                            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${mod.completionPercent}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-3xs text-muted font-semibold">
                              <span>{mod.completedCount} of {mod.totalStudents} students completed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Table */}
                  <div className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border-light flex items-center justify-between">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Enrolled Cohort</h4>
                      <span className="bg-neutral-100 text-muted text-3xs font-extrabold px-2.5 py-0.5 rounded-full">
                        {cohortStudents.length} Students Total
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50/50 border-b border-neutral-100 text-3xs font-bold text-muted uppercase tracking-wider">
                            <th className="p-4 pl-6">Student Info</th>
                            <th className="p-4">Enrollment Date</th>
                            <th className="p-4">Syllabus Progress</th>
                            <th className="p-4">XP Score</th>
                            <th className="p-4">Last Activity</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-right">Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-2xs font-semibold text-on-surface/90">
                          {cohortStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-muted">
                                No students currently enrolled in this program.
                              </td>
                            </tr>
                          ) : (
                            cohortStudents.map((student) => {
                              const isCompleted = student.completedAt !== null;
                              return (
                                <tr key={student.userId} className="hover:bg-neutral-50/40 transition-colors group">
                                  <td className="p-4 pl-6">
                                    <div>
                                      <p className="font-extrabold text-on-surface group-hover:text-primary transition-colors">{student.name}</p>
                                      <p className="text-3xs text-muted font-medium mt-0.5">{student.email}</p>
                                    </div>
                                  </td>
                                  <td className="p-4 text-muted">
                                    {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </td>
                                  <td className="p-4 min-w-[150px]">
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 shrink-0 text-muted font-bold">{student.progress}%</span>
                                      <div className="w-24 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            isCompleted ? 'bg-success' : 'bg-primary'
                                          }`}
                                          style={{ width: `${student.progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-primary font-bold">
                                    {student.xp.toLocaleString()} XP
                                  </td>
                                  <td className="p-4 text-muted">
                                    {student.lastActiveAt ? (
                                      new Date(student.lastActiveAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    ) : (
                                      'Never'
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                                      isCompleted 
                                        ? 'bg-success/10 text-success' 
                                        : 'bg-primary/10 text-primary'
                                    }`}>
                                      {isCompleted ? 'Credentialed' : 'Learning'}
                                    </span>
                                  </td>
                                  <td className="p-4 pr-6 text-right">
                                    <button
                                      onClick={() => handleOpenStudentDrawer(student.userId)}
                                      className="px-3.5 py-1.5 border border-border-light hover:border-primary/30 hover:bg-primary/5 text-primary text-3xs font-bold rounded-xl transition-all"
                                    >
                                      Inspect Cohort Log
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- TAB: INSIGHTS & INTERVENTIONS --- */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              {/* Program Selector & Selector Card */}
              <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-on-surface">Cohort Insights & Interventions</h3>
                  <p className="text-2xs text-muted font-medium">Flag at-risk students, track cohort health score, and log direct interventions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-bold text-muted">Select Program:</span>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="rounded-xl border border-border-light bg-neutral-50 px-4 py-2 text-xs font-semibold outline-hidden focus:border-primary focus:bg-white transition-all"
                  >
                    {taughtPrograms.length === 0 ? (
                      <option value="">No programs available</option>
                    ) : (
                      taughtPrograms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.institutionName})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {loadingInsights ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <span className="text-xs font-semibold text-muted">Analyzing cohort health...</span>
                  </div>
                </div>
              ) : !selectedProgramId ? (
                <div className="bg-white border border-border-light rounded-2xl p-10 text-center text-muted shadow-sm">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <h3 className="text-sm font-bold text-on-surface">No Programs Found</h3>
                  <p className="text-xs text-muted mt-1">Select a program to check academic health insights.</p>
                </div>
              ) : (
                <>
                  {/* Insights metrics grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Metric Card 1 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">At-Risk Students</span>
                        <h2 className="text-xl font-black text-danger">{programInsights?.atRiskCount ?? 0}</h2>
                        <span className="text-3xs text-muted font-medium">Critical risk flagged</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 2 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Attention Needed</span>
                        <h2 className="text-xl font-black text-warning">{programInsights?.warningCount ?? 0}</h2>
                        <span className="text-3xs text-muted font-medium">Warning risk flagged</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 3 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Healthy Status</span>
                        <h2 className="text-xl font-black text-success">{programInsights?.healthyCount ?? 0}</h2>
                        <span className="text-3xs text-muted font-medium">Performing stably</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Metric Card 4 */}
                    <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold text-muted uppercase tracking-wider">Average Progress</span>
                        <h2 className="text-xl font-black text-primary">{programInsights?.averageProgress ?? 0}%</h2>
                        <span className="text-3xs text-muted font-medium">Cohort syllabus mean</span>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Flagged At-Risk List */}
                  <div className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border-light flex items-center justify-between">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Flagged At-Risk Students</h4>
                      <span className="bg-danger/10 text-danger text-3xs font-extrabold px-2.5 py-0.5 rounded-full">
                        {programInsights?.atRiskStudents?.length ?? 0} Students Flagged
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50/50 border-b border-neutral-100 text-3xs font-bold text-muted uppercase tracking-wider">
                            <th className="p-4 pl-6">Student Info</th>
                            <th className="p-4">Progress / XP</th>
                            <th className="p-4">Academic Health</th>
                            <th className="p-4">Triggered Risk Factors</th>
                            <th className="p-4 pr-6 text-right">Outreach Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-2xs font-semibold text-on-surface/90">
                          {!programInsights?.atRiskStudents || programInsights.atRiskStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted">
                                No students flagged for academic risk in this program. All cohorts performing stably!
                              </td>
                            </tr>
                          ) : (
                            programInsights.atRiskStudents.map((student: any) => (
                              <tr key={student.userId} className="hover:bg-neutral-50/40 transition-colors">
                                <td className="p-4 pl-6">
                                  <div>
                                    <p className="font-extrabold text-on-surface">{student.name}</p>
                                    <p className="text-3xs text-muted font-medium mt-0.5">{student.email}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="text-on-surface font-bold">{student.progress}% Syllabus progress</p>
                                  <p className="text-3xs text-primary font-bold mt-0.5">{student.xp} total XP</p>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                                    student.healthStatus === 'CRITICAL' 
                                      ? 'bg-danger/10 text-danger animate-pulse' 
                                      : 'bg-warning/10 text-warning'
                                  }`}>
                                    {student.healthStatus}
                                  </span>
                                </td>
                                <td className="p-4 min-w-[200px]">
                                  <div className="flex flex-wrap gap-1.5">
                                    {student.riskReasons.map((reason: string, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 text-3xs font-semibold rounded-md">
                                        {reason}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <button
                                    onClick={() => {
                                      setOutreachStudent({ id: student.userId, name: student.name });
                                      setOutreachMessage(`Hi ${student.name.split(' ')[0]}, I noticed some slowdown in your progress for "${programInsights.programTitle}". Let me know if you need help with any concepts!`);
                                      setShowInterventionModal(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-3xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1"
                                  >
                                    <Lightbulb className="h-3.5 w-3.5" /> Trigger Outreach
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Interventions Sent History */}
                  <div className="bg-white border border-border-light rounded-2xl shadow-sm p-5 space-y-4">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-primary" /> Outreach Intervention Logs
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {interventionsList.length === 0 ? (
                        <p className="text-2xs text-muted text-center py-6">No previous outreach reminders logged for this program.</p>
                      ) : (
                        interventionsList.map((item) => (
                          <div key={item.id} className="p-3.5 bg-neutral-50/50 border border-neutral-100 rounded-xl space-y-2 hover:bg-neutral-50 transition-all">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="text-2xs font-extrabold text-on-surface">Instructor Outreach to <span className="text-primary">{item.studentName}</span></p>
                                <span className="text-3xs text-muted font-medium">{item.studentEmail}</span>
                              </div>
                              <span className="text-3xs text-muted font-semibold">
                                {new Date(item.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-2xs text-on-surface/80 bg-white border border-neutral-100 p-2.5 rounded-lg font-medium italic">
                              "{item.message}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- TAB 3: INSTRUCTOR PROFILE & SETTINGS --- */}
          {activeTab === "profile" && (
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

      {/* --- STUDENT MONITORING AUDIT DRAWER --- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-4 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {detailedProgress?.student?.name ? detailedProgress.student.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-on-surface">Student Audit Console</h3>
                  <p className="text-3xs text-muted font-medium mt-0.5">Auditing student history & anti-cheat records</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingDetailedProgress ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <span className="text-xs font-semibold text-muted">Retrieving audit trace...</span>
                  </div>
                </div>
              ) : !detailedProgress ? (
                <p className="text-xs text-muted text-center py-10">Unable to load audit logs.</p>
              ) : (
                <>
                  {/* Student profile overview */}
                  <div className="p-4 bg-neutral-50/50 border border-neutral-100 rounded-xl grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-3xs text-muted font-bold uppercase tracking-wider">Student Name</p>
                      <p className="text-xs font-extrabold text-on-surface mt-0.5">{detailedProgress.student.name}</p>
                      <p className="text-3xs text-muted mt-0.5 truncate">{detailedProgress.student.email}</p>
                    </div>
                    <div>
                      <p className="text-3xs text-muted font-bold uppercase tracking-wider">Overall Progress</p>
                      <p className="text-xs font-extrabold text-on-surface mt-0.5">{detailedProgress.student.overallProgress}% Completed</p>
                      <span className="text-3xs text-muted font-semibold mt-0.5 block">
                        {detailedProgress.student.completedAt ? "Finished all modules" : "In Progress"}
                      </span>
                    </div>
                    <div>
                      <p className="text-3xs text-muted font-bold uppercase tracking-wider">Academic XP Score</p>
                      <p className="text-xs font-extrabold text-primary mt-0.5">{detailedProgress.student.xp} XP</p>
                      <span className="text-3xs text-muted font-semibold mt-0.5 block">Earned in system</span>
                    </div>
                  </div>

                  {/* 1. Syllabus Progress Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-primary" /> Syllabus Progress Checklist
                    </h4>
                    <div className="border border-border-light rounded-xl overflow-hidden divide-y divide-border-light">
                      {detailedProgress.syllabus.map((track: any) => (
                        <div key={track.trackId} className="p-4 bg-neutral-50/20">
                          <h5 className="text-xs font-extrabold text-on-surface flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-3xs font-extrabold uppercase">
                              {track.trackType}
                            </span>
                            {track.trackTitle || "Main Syllabus"}
                          </h5>
                          <div className="mt-3 space-y-4">
                            {track.modules.map((mod: any) => (
                              <div key={mod.moduleId} className="space-y-2">
                                <p className="text-2xs font-extrabold text-on-surface/80">{mod.moduleTitle}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                  {mod.lessons.map((les: any) => (
                                    <div 
                                      key={les.lessonId}
                                      className={`flex items-center gap-2.5 p-2 border rounded-lg ${
                                        les.completed 
                                          ? 'bg-success/5 border-success/15 text-success' 
                                          : 'bg-white border-neutral-100 text-muted'
                                      }`}
                                    >
                                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${les.completed ? 'text-success' : 'text-neutral-200'}`} />
                                      <div className="min-w-0">
                                        <p className="text-2xs font-bold truncate">{les.title}</p>
                                        {les.completedAt && (
                                          <p className="text-3xs text-success/75 font-semibold mt-0.5">
                                            Completed {new Date(les.completedAt).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Assessment Attempts Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <Award className="h-4.5 w-4.5 text-success" /> Assessment Attempts History
                    </h4>
                    <div className="border border-border-light rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-3xs font-bold text-muted uppercase tracking-wider">
                            <th className="p-3 pl-4">Assessment Title</th>
                            <th className="p-3 text-center">Score</th>
                            <th className="p-3 text-center">Result</th>
                            <th className="p-3">Completed At</th>
                            <th className="p-3 text-center pr-4">Anti-Cheat Alerts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-2xs font-semibold text-on-surface/90">
                          {detailedProgress.attempts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-muted">
                                No assessment attempts logged for this student.
                              </td>
                            </tr>
                          ) : (
                            detailedProgress.attempts.map((att: any) => (
                              <tr key={att.id} className="hover:bg-neutral-50/30">
                                <td className="p-3 pl-4 font-extrabold">{att.assessmentTitle}</td>
                                <td className="p-3 text-center font-extrabold text-on-surface">
                                  {att.score}% <span className="text-3xs text-muted font-normal">/ {att.passingScore}%</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                                    att.passed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                  }`}>
                                    {att.passed ? 'Pass' : 'Fail'}
                                  </span>
                                </td>
                                <td className="p-3 text-muted">
                                  {att.completedAt ? (
                                    new Date(att.completedAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  ) : (
                                    'In Progress'
                                  )}
                                </td>
                                <td className="p-3 text-center pr-4">
                                  {att.violationCount > 0 ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger text-3xs font-extrabold inline-flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" /> {att.violationCount} Violations
                                    </span>
                                  ) : (
                                    <span className="text-3xs text-success font-extrabold">Clean Session</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Anti-Cheat Violation logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-danger" /> Proctoring Violations Feed
                    </h4>
                    <div className="border border-border-light rounded-xl overflow-hidden divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                      {detailedProgress.violations.length === 0 ? (
                        <p className="p-6 text-center text-muted text-2xs">
                          No proctoring violations recorded for this student in this program.
                        </p>
                      ) : (
                        detailedProgress.violations.map((v: any) => (
                          <div key={v.id} className="p-3 bg-danger/5 hover:bg-danger/10 flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded-md bg-danger/15 text-danger text-3xs font-extrabold uppercase">
                                {v.type.replace('_', ' ')}
                              </span>
                              <p className="text-2xs font-bold text-on-surface mt-1">
                                Triggered during assessment: <span className="font-extrabold">{v.assessmentTitle}</span>
                              </p>
                            </div>
                            <span className="text-3xs text-muted font-semibold shrink-0">
                              {new Date(v.loggedAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- INTERVENTION OUTREACH MODAL --- */}
      {showInterventionModal && outreachStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => { setShowInterventionModal(false); setOutreachStudent(null); }} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-on-surface">Trigger Academic Outreach</h3>
              <button 
                onClick={() => { setShowInterventionModal(false); setOutreachStudent(null); }} 
                className="p-1 rounded-lg hover:bg-neutral-100 text-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIntervention} className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1">
                <span className="text-3xs text-muted uppercase font-bold">RECIPIENT</span>
                <p className="text-xs font-black text-on-surface">{outreachStudent.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-on-surface/85">Outreach Message</label>
                <textarea
                  required
                  rows={5}
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-xs outline-hidden focus:border-primary focus:bg-white transition-all resize-none"
                  placeholder="Draft your message here..."
                />
                <span className="text-3xs text-muted font-semibold block mt-1">
                  This message will appear in the student's notification center as an outreach alert reminder.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInterventionModal(false); setOutreachStudent(null); }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-on-surface font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntervention}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {submittingIntervention ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    "Send Intervention"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
