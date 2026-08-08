import { PrismaClient, NotificationType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

interface SampleNotification {
  type: NotificationType;
  title: string;
  message: string;
  hoursAgo: number;
  actionUrl?: string;
  read?: boolean;
  archived?: boolean;
}

/**
 * Role-appropriate sample notifications.
 *
 * Every role only gets the notification types its defaults enable — a faculty
 * account never sees student-only reminders, and a platform admin only sees
 * SYSTEM + ANNOUNCEMENT. The seed clears existing rows first so stale,
 * role-agnostic samples from earlier sprints are removed.
 */
const ROLE_SAMPLES: Record<UserRole, SampleNotification[]> = {
  [UserRole.STUDENT]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your account is active and ready. Complete your profile to unlock personalised course recommendations.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'New courses from your institution',
      message:
        'Your institution just published 2 new programs. Browse the catalog to explore them before seats fill up.',
      hoursAgo: 72,
      read: true,
      actionUrl: '/catalog',
    },
    {
      type: 'CREDENTIAL',
      title: 'Credential issued',
      message:
        'Congratulations! Your credential has been issued and is now verifiable with a unique shareable link.',
      hoursAgo: 48,
      actionUrl: '/credentials',
    },
    {
      type: 'UPDATE',
      title: 'New course from a faculty you follow',
      message:
        'Dr. Mehta published a new course: "Applied Machine Learning". Tap to explore it before it fills up.',
      hoursAgo: 30,
      actionUrl: '/programs/applied-machine-learning',
    },
    {
      type: 'REMINDER',
      title: 'You have an uncompleted lesson',
      message:
        'Pick up where you left off — "Core Concepts" is 40% complete. A 10-minute session keeps your streak alive.',
      hoursAgo: 24,
    },
    {
      type: 'UPDATE',
      title: 'New lesson added',
      message:
        'The "Hands-On Practice" module gained a new lesson: "Mini Project: Build Your First Prototype".',
      hoursAgo: 6,
    },
    {
      type: 'REMINDER',
      title: 'Assessment window closing soon',
      message:
        'Your current assessment attempt expires in 48 hours. Submit before the deadline to keep your progress.',
      hoursAgo: 1,
    },
  ],

  [UserRole.EMPLOYEE]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your compliance workspace is ready. Complete your profile to unlock your assigned compliance tracks.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'CREDENTIAL',
      title: 'New compliance credential issued',
      message:
        'Congratulations! You have been issued a credential for your Data Privacy compliance track.',
      hoursAgo: 72,
      actionUrl: '/enterprise/credentials',
    },
    {
      type: 'REMINDER',
      title: 'Compliance deadline approaching',
      message:
        'Your annual compliance re-certification is due in 2 weeks. Start the refresh assessment now.',
      hoursAgo: 24,
    },
    {
      type: 'UPDATE',
      title: 'Compliance track updated',
      message:
        'Your organization updated the "Security Awareness" track with new required modules.',
      hoursAgo: 8,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Platform update',
      message:
        'The notification center is live — view, filter and archive every important update right from one place.',
      hoursAgo: 2,
      actionUrl: '/notifications',
    },
  ],

  [UserRole.FACULTY]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your faculty workspace is ready. Upload course content and invite students to your programs.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'UPDATE',
      title: 'New student enrolled in your course',
      message:
        'A new student enrolled in "Applied Machine Learning". Open the analytics dashboard for the latest cohort metrics.',
      hoursAgo: 48,
      actionUrl: '/dashboard',
    },
    {
      type: 'UPDATE',
      title: 'Course published to followers',
      message:
        '"Applied Machine Learning" is live. 24 students following you were notified about this release.',
      hoursAgo: 30,
    },
    {
      type: 'SYSTEM',
      title: 'Faculty profile approved',
      message:
        'Your faculty profile was verified by your institution. You can now publish programs to the catalog.',
      hoursAgo: 26,
      read: true,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Institution announcement',
      message:
        'The spring catalog submission deadline is next Friday. Publish your programs before the cut-off.',
      hoursAgo: 6,
    },
  ],

  [UserRole.UNIVERSITY_ADMIN]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your institution workspace is ready. Approve faculty, publish programs and monitor student progress.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'UPDATE',
      title: 'Faculty verification approved',
      message:
        'The faculty profile for Dr. Mehta was approved and their programs are now live on the catalog.',
      hoursAgo: 48,
    },
    {
      type: 'UPDATE',
      title: 'New program published',
      message:
        'A faculty member published "Applied Machine Learning" under your institution.',
      hoursAgo: 30,
    },
    {
      type: 'UPDATE',
      title: 'Student enrollment report ready',
      message:
        'This week 12 students enrolled across your programs. View the university dashboard for the full breakdown.',
      hoursAgo: 12,
      actionUrl: '/university/dashboard',
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Institution announcement',
      message:
        'Reminder: submit your department heads list by the end of the month to keep program approvals on track.',
      hoursAgo: 4,
    },
  ],

  [UserRole.DEZAI_ADMIN]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your platform console is ready. Monitor institutions, approve requests and keep the platform healthy.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Platform update',
      message:
        'Notification preferences and faculty follows shipped. Institutions can now control their inbox defaults.',
      hoursAgo: 48,
    },
    {
      type: 'SYSTEM',
      title: 'Security audit completed',
      message:
        'Routine platform security audit finished with no critical findings. Review the full report in the console.',
      hoursAgo: 24,
      read: true,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Upcoming maintenance window',
      message:
        'Platform maintenance is scheduled this Sunday 02:00–04:00 UTC. No action is required from you.',
      hoursAgo: 6,
    },
  ],

  [UserRole.ORGANIZATION_ADMIN]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your organization workspace is ready. Assign compliance tracks and track your team\'s credentials.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'UPDATE',
      title: 'Compliance credential issued to your team',
      message:
        'A team member completed their Data Privacy track and received a compliance credential.',
      hoursAgo: 48,
      actionUrl: '/enterprise/dashboard',
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Platform update',
      message:
        'Notification preferences are here — choose exactly which updates your organization receives.',
      hoursAgo: 24,
    },
    {
      type: 'SYSTEM',
      title: 'Team member added',
      message:
        'A new employee was added to your organization and assigned a compliance track.',
      hoursAgo: 8,
    },
  ],

  [UserRole.ORGANIZATION_MANAGER]: [
    {
      type: 'SYSTEM',
      title: 'Welcome to Dezai',
      message:
        'Your manager workspace is ready. Review your team\'s compliance progress and intervene when needed.',
      hoursAgo: 120,
      read: true,
    },
    {
      type: 'REMINDER',
      title: 'Team compliance review',
      message:
        '3 members of your team have compliance deadlines in the next 7 days. Review their progress.',
      hoursAgo: 72,
      actionUrl: '/enterprise/dashboard',
    },
    {
      type: 'UPDATE',
      title: 'Compliance track updated',
      message:
        'The "Security Awareness" track was updated with new required modules for your team.',
      hoursAgo: 24,
    },
    {
      type: 'ANNOUNCEMENT',
      title: 'Platform update',
      message:
        'Notification preferences are here — choose exactly which updates your organization receives.',
      hoursAgo: 6,
    },
  ],
};

async function seedNotifications() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  if (users.length === 0) {
    console.log('No users found — nothing to seed. Run the main seed first.');
    return;
  }

  // Remove stale role-agnostic samples from previous sprints
  const cleared = await prisma.notification.deleteMany({});
  console.log(`Cleared ${cleared.count} existing notification(s).`);

  let created = 0;
  for (const user of users) {
    const samples = ROLE_SAMPLES[user.role] ?? ROLE_SAMPLES[UserRole.STUDENT];
    for (const sample of samples) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: sample.title,
          message: sample.message,
          type: sample.type,
          actionUrl: sample.actionUrl ?? null,
          read: sample.read ?? false,
          archived: sample.archived ?? false,
          createdAt: new Date(Date.now() - sample.hoursAgo * 3600_000),
        },
      });
      created += 1;
    }
  }

  console.log(
    `Seeded ${created} role-appropriate notifications across ${users.length} user(s).`,
  );
}

seedNotifications()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
