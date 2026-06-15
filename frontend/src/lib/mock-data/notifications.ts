export interface MockNotification {
  id: string;
  userId: string;
  type: "enrollment" | "quiz" | "certificate" | "system" | "reminder" | "achievement";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export const mockNotifications: MockNotification[] = [
  // Aarav Patel (demo student)
  { id: "notif-1", userId: "user-student-1", type: "enrollment", title: "Enrollment Confirmed", message: "You've been enrolled in 'Generative AI for Leaders'. Start learning today!", read: false, createdAt: "2026-06-07T10:30:00Z", actionUrl: "/programs/generative-ai-for-leaders" },
  { id: "notif-2", userId: "user-student-1", type: "certificate", title: "Certificate Earned! 🎉", message: "Congratulations! Your certificate for 'AI Ethics & Governance' is ready.", read: false, createdAt: "2026-06-06T14:20:00Z", actionUrl: "/certificates/cert-1" },
  { id: "notif-3", userId: "user-student-1", type: "quiz", title: "Quiz Reminder", message: "You have a pending assessment for 'Machine Learning Fundamentals'. Complete it before the deadline.", read: false, createdAt: "2026-06-05T09:00:00Z", actionUrl: "/programs/machine-learning-fundamentals" },
  { id: "notif-4", userId: "user-student-1", type: "reminder", title: "Continue Learning", message: "You're 65% through 'Machine Learning Fundamentals'. Keep up the momentum!", read: true, createdAt: "2026-06-04T16:00:00Z", actionUrl: "/dashboard" },
  { id: "notif-5", userId: "user-student-1", type: "achievement", title: "Learning Streak! 🔥", message: "7-day learning streak! You're on fire. Keep it up!", read: true, createdAt: "2026-06-03T08:00:00Z" },
  { id: "notif-6", userId: "user-student-1", type: "system", title: "New Course Available", message: "A new course 'Advanced NLP with Transformers' has been added to the AI category.", read: true, createdAt: "2026-06-02T11:00:00Z", actionUrl: "/catalog" },
  { id: "notif-7", userId: "user-student-1", type: "enrollment", title: "Enrollment Confirmed", message: "You've been enrolled in 'UI/UX Design Principles'. Start Module 1 now!", read: true, createdAt: "2026-05-28T12:30:00Z", actionUrl: "/programs/ui-ux-design-principles" },
  { id: "notif-8", userId: "user-student-1", type: "system", title: "Platform Update", message: "We've improved the learning player with new note-taking features. Try it out!", read: true, createdAt: "2026-05-25T10:00:00Z" },
  { id: "notif-9", userId: "user-student-1", type: "quiz", title: "Quiz Results", message: "You scored 95% on 'AI Ethics & Governance' assessment. Excellent work!", read: true, createdAt: "2026-02-14T15:30:00Z" },
  { id: "notif-10", userId: "user-student-1", type: "certificate", title: "Certificate Earned!", message: "Your certificate for 'Design Thinking for Innovation' is ready for download.", read: true, createdAt: "2026-03-19T14:00:00Z", actionUrl: "/certificates/cert-2" },
  // Other students
  { id: "notif-11", userId: "user-student-2", type: "enrollment", title: "Welcome!", message: "Welcome to Dezai! Start exploring courses in our catalog.", read: false, createdAt: "2026-06-06T09:00:00Z", actionUrl: "/catalog" },
  { id: "notif-12", userId: "user-student-3", type: "certificate", title: "Certificate Ready", message: "Your certificate for 'Business Analytics' is ready.", read: false, createdAt: "2026-06-05T11:00:00Z" },
  { id: "notif-13", userId: "user-student-4", type: "quiz", title: "Quiz Available", message: "New assessment available for 'Deep Learning Masterclass'.", read: false, createdAt: "2026-06-04T10:00:00Z" },
  { id: "notif-14", userId: "user-student-5", type: "achievement", title: "Course Complete! 🎓", message: "You've completed 'Visual Communication & Storytelling'. Check your certificate!", read: false, createdAt: "2026-06-03T16:00:00Z" },
  // University Admin notifications
  { id: "notif-20", userId: "user-admin-uni", type: "system", title: "Monthly Report Ready", message: "KPGU's June 2026 analytics report is available.", read: false, createdAt: "2026-06-07T08:00:00Z" },
  { id: "notif-21", userId: "user-admin-uni", type: "enrollment", title: "New Enrollment Milestone", message: "KPGU has crossed 4,000 total enrollments on Dezai!", read: false, createdAt: "2026-06-05T12:00:00Z" },
  // Dezai Admin notifications
  { id: "notif-30", userId: "user-admin-dezai", type: "system", title: "New University Application", message: "Gujarat Technological University has applied for partnership.", read: false, createdAt: "2026-06-07T09:00:00Z" },
  { id: "notif-31", userId: "user-admin-dezai", type: "system", title: "Revenue Milestone", message: "Platform revenue has crossed ₹50L this quarter!", read: false, createdAt: "2026-06-06T10:00:00Z" },
];

export function getNotificationsByUser(userId: string): MockNotification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
}
