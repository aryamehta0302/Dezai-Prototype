import { PrismaClient, UserRole, TrackType, XpType, Difficulty, AchievementCategory, AchievementRarity } from '@prisma/client';
import { hashPassword } from '../../src/modules/auth/utils/password.utils';

const prisma = new PrismaClient();

const VIDEOS = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];

function pick(i: number) { return VIDEOS[i % VIDEOS.length]; }
function md(title: string, body: string) { return `# ${title}\n\n${body}\n\n---\n\n*Lesson content from Dezai curriculum.*`; }
function thumbnailUrl(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/400/225`;
}

interface LessonDef { title: string; content: string; videoUrl: string }
interface ModuleDef { title: string; lessons: LessonDef[] }

const ROOTS_MODULES: ModuleDef[] = [
  {
    title: 'Getting Started',
    lessons: [
      { title: 'Introduction & Course Overview', content: md('Introduction', 'Welcome to the course! This lesson covers what to expect, the learning outcomes, and how to navigate the curriculum effectively.'), videoUrl: pick(0) },
      { title: 'Setting Up Your Learning Environment', content: md('Setting Up', 'Configure your tools and environment to get the most out of this course. Includes recommended resources and preparation materials.'), videoUrl: pick(1) },
      { title: 'Course Roadmap & Milestones', content: md('Course Roadmap', 'A detailed walkthrough of the entire curriculum structure, key milestones, and how to track your progress effectively.'), videoUrl: pick(2) },
    ],
  },
  {
    title: 'Core Concepts',
    lessons: [
      { title: 'Understanding the Fundamentals', content: md('Core Fundamentals', 'Build a solid foundation by exploring the key principles that underpin the subject matter with real-world examples.'), videoUrl: pick(3) },
      { title: 'Practical Applications', content: md('Practical Applications', 'See how these concepts are applied in real industry scenarios with step-by-step case study walkthroughs.'), videoUrl: pick(4) },
      { title: 'Common Pitfalls & Best Practices', content: md('Best Practices', 'Learn from common mistakes and establish best practices early with expert tips and tricks.'), videoUrl: pick(5) },
      { title: 'Tools & Resources Guide', content: md('Tools & Resources', 'A comprehensive overview of the tools, libraries, and resources you will use throughout the course.'), videoUrl: pick(6) },
    ],
  },
  {
    title: 'Hands-On Practice',
    lessons: [
      { title: 'Exercise: Apply What You Learned', content: md('Hands-On Exercise', 'A guided exercise to reinforce the concepts covered so far with downloadable resources and sample solutions.'), videoUrl: pick(7) },
      { title: 'Knowledge Check Quiz', content: md('Knowledge Check', 'Self-assessment with detailed explanations to validate your understanding before moving forward.'), videoUrl: pick(8) },
      { title: 'Mini Project: Build Your First Prototype', content: md('Mini Project', 'Apply everything you have learned in a guided mini project. Step-by-step instructions with code examples.'), videoUrl: pick(9) },
    ],
  },
  {
    title: 'Deep Dive',
    lessons: [
      { title: 'Advanced Theory & Techniques', content: md('Advanced Theory', 'Explore deeper theoretical concepts that power advanced applications in this field.'), videoUrl: pick(10) },
      { title: 'Case Study Analysis', content: md('Case Study', 'Analyze a real-world case study from industry. Understand the challenges, solutions, and outcomes.'), videoUrl: pick(11) },
      { title: 'Comparative Analysis: Different Approaches', content: md('Comparative Analysis', 'Compare different methodologies and approaches used in the industry with pros and cons of each.'), videoUrl: pick(0) },
    ],
  },
  {
    title: 'Assessment & Review',
    lessons: [
      { title: 'Module Review & Summary', content: md('Module Review', 'A comprehensive review of everything covered in the foundational track with key takeaways.'), videoUrl: pick(1) },
      { title: 'Practice Test', content: md('Practice Test', 'Test your knowledge with a comprehensive practice assessment covering all foundational topics.'), videoUrl: pick(2) },
      { title: 'Peer Discussion & Reflection', content: md('Peer Discussion', 'Engage with fellow learners in a guided discussion. Share insights and learn from different perspectives.'), videoUrl: pick(3) },
    ],
  },
];

const EDGE_MODULES: ModuleDef[] = [
  {
    title: 'Advanced Topics',
    lessons: [
      { title: 'Deep Dive into Advanced Techniques', content: md('Advanced Techniques', 'Take your skills to the next level with advanced methodologies used by industry professionals.'), videoUrl: pick(4) },
      { title: 'Performance Optimization Strategies', content: md('Performance Optimization', 'Learn to analyze, measure, and optimize your work. Profiling and benchmarking techniques included.'), videoUrl: pick(5) },
    ],
  },
  {
    title: 'Specialized Applications',
    lessons: [
      { title: 'Industry-Specific Applications', content: md('Industry Applications', 'Explore how these skills apply across different industries with specific examples and adaptations.'), videoUrl: pick(6) },
      { title: 'Integration with Existing Systems', content: md('Integration', 'Learn strategies for integrating new solutions with legacy systems and existing workflows.'), videoUrl: pick(7) },
      { title: 'Scaling Your Solutions', content: md('Scaling', 'Understand the challenges and best practices for scaling your solutions from prototype to production.'), videoUrl: pick(8) },
    ],
  },
  {
    title: 'Real-World Projects',
    lessons: [
      { title: 'Project Planning & Scoping', content: md('Project Planning', 'Define scope, objectives, and success criteria for your capstone project with provided templates.'), videoUrl: pick(9) },
      { title: 'Building the Solution', content: md('Building the Solution', 'Implement your project with guided milestones and code reviews throughout the process.'), videoUrl: pick(10) },
      { title: 'Testing & Deployment', content: md('Testing & Deployment', 'Ensure quality through comprehensive testing. Learn deployment strategies and monitoring.'), videoUrl: pick(11) },
    ],
  },
  {
    title: 'Industry Insights',
    lessons: [
      { title: 'Guest Lecture: Industry Expert', content: md('Guest Lecture', 'Industry practitioners share their experiences, challenges, and advice for building a successful career.'), videoUrl: pick(0) },
      { title: 'Current Trends & Future Directions', content: md('Current Trends', 'An overview of where the field is heading and what skills will be most valuable in the coming years.'), videoUrl: pick(1) },
      { title: 'Building Your Portfolio', content: md('Building Your Portfolio', 'Guidance on showcasing your work effectively to employers and clients.'), videoUrl: pick(2) },
    ],
  },
  {
    title: 'Capstone & Certification',
    lessons: [
      { title: 'Capstone Project: Full Implementation', content: md('Capstone Project', 'Your final project that synthesizes everything learned. Full requirements and evaluation criteria provided.'), videoUrl: pick(3) },
      { title: 'Final Assessment', content: md('Final Assessment', 'Comprehensive final assessment covering all material from both foundational and advanced tracks.'), videoUrl: pick(4) },
      { title: 'Next Steps & Resources', content: md('Next Steps', 'Actionable roadmap for continued learning with curated resources, communities, and certification paths.'), videoUrl: pick(5) },
    ],
  },
];

const CUSTOM_CURRICULUM: Record<string, { roots: ModuleDef[] }> = {
  'course-1': {
    roots: [
      {
        title: 'Foundations of Generative AI',
        lessons: [
          { title: 'What is Generative AI?', content: md('What is Generative AI?', 'Explore the fundamentals of generative AI, how it differs from traditional AI, and its core capabilities. Learn about transformer architectures and why 2023-2025 marks a tipping point for enterprise adoption.'), videoUrl: pick(0) },
          { title: 'Large Language Models Explained', content: md('Large Language Models Explained', 'Dive into how LLMs like GPT-4 work under the hood. Understand tokens, attention mechanisms, and the scaling laws that make modern AI so powerful.'), videoUrl: pick(1) },
          { title: 'Prompt Engineering Basics', content: md('Prompt Engineering', 'Learn the art of crafting effective prompts. Understand system prompts, few-shot learning, and chain-of-thought reasoning.'), videoUrl: pick(2) },
        ],
      },
      {
        title: 'Enterprise AI Strategy',
        lessons: [
          { title: 'Identifying High-Impact Use Cases', content: md('Identifying High-Impact Use Cases', 'Learn a framework for evaluating which business processes benefit most from generative AI with case studies.'), videoUrl: pick(3) },
          { title: 'Build vs. Buy Decision', content: md('Build vs. Buy', 'Evaluate when to use existing AI APIs vs. fine-tuning open-source models vs. training from scratch with TCO analysis.'), videoUrl: pick(4) },
          { title: 'Change Management for AI Adoption', content: md('Change Management', 'Strategies for organizational buy-in, upskilling teams, and managing the cultural shift that comes with AI transformation.'), videoUrl: pick(5) },
          { title: 'AI Roadmap Planning', content: md('AI Roadmap', 'Create a phased roadmap for AI adoption aligned with business goals and available resources.'), videoUrl: pick(6) },
        ],
      },
      {
        title: 'Responsible AI Leadership',
        lessons: [
          { title: 'Ethical AI Frameworks', content: md('Ethical AI', 'Overview of global AI ethics guidelines, bias detection, and fairness metrics every leader should know.'), videoUrl: pick(7) },
          { title: 'Regulatory Landscape', content: md('Regulatory Landscape', 'Understand EU AI Act, India\'s AI regulatory approach, and emerging compliance requirements for enterprise AI.'), videoUrl: pick(8) },
          { title: 'Building Trust in AI Systems', content: md('Building Trust', 'Strategies for transparency, explainability, and accountability in AI deployments.'), videoUrl: pick(9) },
        ],
      },
      {
        title: 'Technical Architecture',
        lessons: [
          { title: 'RAG Architecture Deep Dive', content: md('RAG Architecture', 'Implement Retrieval-Augmented Generation that grounds AI responses in your enterprise knowledge base.'), videoUrl: pick(10) },
          { title: 'Model Selection & Evaluation', content: md('Model Selection', 'Framework for evaluating and selecting the right models for different use cases. Benchmarking and testing strategies.'), videoUrl: pick(11) },
        ],
      },
      {
        title: 'AI Governance & Operations',
        lessons: [
          { title: 'AI Governance Frameworks', content: md('AI Governance', 'Set up guardrails, monitoring dashboards, and feedback loops to keep AI systems safe and aligned.'), videoUrl: pick(0) },
          { title: 'Measuring AI Impact & ROI', content: md('Measuring AI Impact', 'Build a business case with metrics: productivity gains, cost savings, revenue impact with real benchmarks.'), videoUrl: pick(1) },
          { title: 'Future-Proofing Your AI Stack', content: md('Future-Proofing', 'Emerging trends: multimodal models, AI agents, on-device AI. Hiring strategies and infrastructure decisions.'), videoUrl: pick(2) },
        ],
      },
    ],
  },
};

// ─── Curriculum seeding helpers (idempotent) ──────────────────────────────────

async function ensureTracks(programId: string) {
  const tracks = await prisma.programTrack.findMany({ where: { programId } });
  const types = tracks.map(t => t.type);

  if (!types.includes(TrackType.ROOTS)) {
    await prisma.programTrack.create({ data: { programId, type: TrackType.ROOTS, title: 'Foundation Track' } });
    console.log('    + Created ROOTS track');
  }
  if (!types.includes(TrackType.EDGE)) {
    await prisma.programTrack.create({ data: { programId, type: TrackType.EDGE, title: 'Advanced Track' } });
    console.log('    + Created EDGE track');
  }
}

async function addModules(trackId: string, modules: ModuleDef[], trackLabel: string) {
  let order = 1;
  for (const modDef of modules) {
    const existing = await prisma.module.findFirst({ where: { trackId, title: modDef.title } });
    if (existing) {
      console.log(`    - [${trackLabel}] "${modDef.title}" exists, skipped`);
      order++;
      continue;
    }

    const mod = await prisma.module.create({ data: { trackId, title: modDef.title, order } });
    let lOrder = 1;
    for (const l of modDef.lessons) {
      await prisma.lesson.create({ data: { moduleId: mod.id, title: l.title, content: l.content, videoUrl: l.videoUrl, order: lOrder } });
      lOrder++;
    }
    console.log(`    ✓ [${trackLabel}] Module ${order}: "${modDef.title}" (${modDef.lessons.length} lessons)`);
    order++;
  }
}

async function seedCurriculum() {
  console.log('\n--- Seeding Curriculum ---\n');

  const programs = await prisma.program.findMany({ orderBy: { title: 'asc' } });
  console.log(`Found ${programs.length} programs\n`);

  for (const program of programs) {
    console.log(`→ ${program.title}`);

    await ensureTracks(program.id);

    const tracks = await prisma.programTrack.findMany({
      where: { programId: program.id },
      orderBy: { createdAt: 'asc' },
    });

    const custom = CUSTOM_CURRICULUM[program.id];
    const rootsModules = custom?.roots ?? ROOTS_MODULES;

    for (const track of tracks) {
      if (track.type === TrackType.ROOTS) {
        await addModules(track.id, rootsModules, 'ROOTS');
      } else {
        await addModules(track.id, EDGE_MODULES, 'EDGE');
      }
    }

    console.log('');
  }

  console.log('Curriculum seeding complete!');
}

// ─── Main seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dezai Prototype Database Seed ===\n');

  const commonPasswordHash = hashPassword('password123');

  // 1. Institutions
  console.log('--- Institutions ---');
  const instDezai = await prisma.institution.upsert({
    where: { id: 'inst-1' },
    update: {},
    create: { id: 'inst-1', name: 'Dezai Institute of Technology', description: 'The future of decentralized education.' },
  });
  const instKPGU = await prisma.institution.upsert({
    where: { id: 'inst-kpgu' },
    update: {},
    create: { id: 'inst-kpgu', name: 'KPGU', description: 'Krishna Patel Gyansagar University, Vadodara.' },
  });
  const instParul = await prisma.institution.upsert({
    where: { id: 'inst-parul' },
    update: {},
    create: { id: 'inst-parul', name: 'Parul University', description: 'Parul University, Vadodara.' },
  });
  const instCharusat = await prisma.institution.upsert({
    where: { id: 'inst-charusat' },
    update: {},
    create: { id: 'inst-charusat', name: 'CHARUSAT', description: 'Charotar University of Science and Technology.' },
  });
  const instNavrachana = await prisma.institution.upsert({
    where: { id: 'inst-navrachana' },
    update: {},
    create: { id: 'inst-navrachana', name: 'Navrachana University', description: 'Navrachana University, Vadodara.' },
  });
  const instMSU = await prisma.institution.upsert({
    where: { id: 'inst-msu' },
    update: {},
    create: { id: 'inst-msu', name: 'MSU Baroda', description: 'Maharaja Sayajirao University of Baroda.' },
  });
  const instStanford = await prisma.institution.upsert({
    where: { id: 'inst-stanford' },
    update: {},
    create: { id: 'inst-stanford', name: 'Stanford Institute for AI', description: 'Stanford international partner.' },
  });
  console.log('Institutions created/up-to-date');

  // 2. Users
  console.log('\n--- Users ---');
  await prisma.user.upsert({
    where: { email: 'admin@dezai.edu' },
    update: { role: UserRole.DEZAI_ADMIN, onboarded: true, passwordHash: commonPasswordHash },
    create: { email: 'admin@dezai.edu', name: 'Platform Administrator', role: UserRole.DEZAI_ADMIN, passwordHash: commonPasswordHash, onboarded: true },
  });

  await prisma.user.upsert({
    where: { email: 'student@dezai.edu' },
    update: { role: UserRole.STUDENT, onboarded: true, passwordHash: commonPasswordHash },
    create: { email: 'student@dezai.edu', name: 'Ansh Dhanani', role: UserRole.STUDENT, passwordHash: commonPasswordHash, onboarded: true },
  });

  const facultyMap: Record<string, { email: string; name: string; instId: string }> = {
    'fac-stanford': { email: 'elena@stanford.edu', name: 'Dr. Elena Rostova', instId: instStanford.id },
    'fac-kpgu': { email: 'rajesh@kpgu.edu', name: 'Dr. Rajesh Patel', instId: instKPGU.id },
    'fac-navrachana': { email: 'ananya@navrachana.edu', name: 'Prof. Ananya Desai', instId: instNavrachana.id },
    'fac-msu': { email: 'vikram@msu.edu', name: 'Dr. Vikram Mehta', instId: instMSU.id },
    'fac-charusat': { email: 'kavita@charusat.edu', name: 'Dr. Kavita Joshi', instId: instCharusat.id },
    'fac-parul': { email: 'amit@parul.edu', name: 'Prof. Amit Shah', instId: instParul.id },
    'fac-kpgu2': { email: 'neel@kpgu.edu', name: 'Dr. Neel Trivedi', instId: instKPGU.id },
    'fac-msu2': { email: 'arjun@msu.edu', name: 'Dr. Arjun Nair', instId: instMSU.id },
    'fac-parul2': { email: 'sneha@parul.edu', name: 'Prof. Sneha Raval', instId: instParul.id },
    'fac-charusat2': { email: 'meera@charusat.edu', name: 'Dr. Meera Krishnan', instId: instCharusat.id },
  };

  for (const [, fac] of Object.entries(facultyMap)) {
    const user = await prisma.user.upsert({
      where: { email: fac.email },
      update: { role: UserRole.FACULTY, onboarded: true, passwordHash: commonPasswordHash },
      create: { email: fac.email, name: fac.name, role: UserRole.FACULTY, passwordHash: commonPasswordHash, onboarded: true },
    });
    await prisma.facultyMember.upsert({
      where: { userId: user.id },
      update: { institutionId: fac.instId },
      create: { userId: user.id, institutionId: fac.instId },
    });
  }

  const mainFacultyUser = await prisma.user.upsert({
    where: { email: 'faculty@dezai.edu' },
    update: { role: UserRole.FACULTY, onboarded: true, passwordHash: commonPasswordHash },
    create: { email: 'faculty@dezai.edu', name: 'Dr. Sarah Connor', role: UserRole.FACULTY, passwordHash: commonPasswordHash, onboarded: true },
  });
  await prisma.facultyMember.upsert({
    where: { userId: mainFacultyUser.id },
    update: { institutionId: instDezai.id },
    create: { userId: mainFacultyUser.id, institutionId: instDezai.id },
  });
  console.log('Users created/up-to-date');

  // 3. Programs (upsert — no inline tracks, curriculum is handled separately)
  console.log('\n--- Programs ---');
  interface ProgramSeed { id: string; title: string; description: string; institutionId: string; facultyId: string; thumbnail: string }
  const programs: ProgramSeed[] = [
    { id: 'course-1', title: 'Generative AI for Leaders: Strategic Implementation', description: 'Master the strategic implementation of generative AI technologies in enterprise settings.', institutionId: instStanford.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'elena@stanford.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-1') },
    { id: 'course-2', title: 'Machine Learning Fundamentals', description: 'Build a strong foundation in machine learning algorithms and practical applications.', institutionId: instKPGU.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'rajesh@kpgu.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-2') },
    { id: 'course-3', title: 'Deep Learning Masterclass', description: 'Advanced deep learning techniques including CNNs, RNNs, and GANs.', institutionId: instCharusat.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'kavita@charusat.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-3') },
    { id: 'course-4', title: 'AI Ethics & Governance', description: 'Navigate the ethical challenges and governance frameworks for AI systems.', institutionId: instKPGU.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'neel@kpgu.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-4') },
    { id: 'course-5', title: 'Digital Marketing Strategy', description: 'Master modern digital marketing channels and data-driven strategies.', institutionId: instMSU.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'vikram@msu.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-5') },
    { id: 'course-6', title: 'Financial Technology & Innovation', description: "Explore the intersection of finance and technology in India's digital economy.", institutionId: instParul.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'amit@parul.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-6') },
    { id: 'course-7', title: 'E-Commerce Operations & Management', description: 'Build and manage scalable e-commerce businesses for the Indian market.', institutionId: instCharusat.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'meera@charusat.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-7') },
    { id: 'course-8', title: 'Business Analytics & Decision Making', description: 'Transform data into actionable business insights.', institutionId: instParul.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'sneha@parul.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-8') },
    { id: 'course-9', title: 'UI/UX Design Principles', description: 'Master the fundamentals of user interface and user experience design.', institutionId: instNavrachana.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'ananya@navrachana.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-9') },
    { id: 'course-10', title: 'Design Thinking for Innovation', description: 'Apply design thinking methodology to solve complex business problems.', institutionId: instMSU.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'arjun@msu.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-10') },
    { id: 'course-11', title: 'Visual Communication & Storytelling', description: 'Create compelling visual narratives for digital and print media.', institutionId: instNavrachana.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'ananya@navrachana.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-11') },
    { id: 'course-12', title: 'Product Design: From Concept to Launch', description: 'End-to-end product design process for digital products.', institutionId: instMSU.id, facultyId: (await prisma.facultyMember.findFirst({ where: { userId: (await prisma.user.findUnique({ where: { email: 'arjun@msu.edu' } }))!.id } }))!.id, thumbnail: thumbnailUrl('course-12') },
  ];

  for (const p of programs) {
    await prisma.program.upsert({
      where: { id: p.id },
      update: { title: p.title, description: p.description, thumbnail: p.thumbnail, institutionId: p.institutionId, facultyId: p.facultyId },
      create: { id: p.id, title: p.title, description: p.description, thumbnail: p.thumbnail, institutionId: p.institutionId, facultyId: p.facultyId },
    });
    console.log(`  ✓ Program: ${p.id} - ${p.title}`);
  }

  // 4. Curriculum (tracks, modules, lessons)
  await seedCurriculum();

  // 5. Sample Enrollments & Progress
  console.log('\n--- Enrollments & Progress ---');
  const studentUser = await prisma.user.findUnique({ where: { email: 'student@dezai.edu' } });
  if (studentUser) {
    const enrollPrograms = ['course-1', 'course-2', 'course-3'];
    for (const pid of enrollPrograms) {
      const program = await prisma.program.findUnique({ where: { id: pid } });
      if (!program) continue;
      await prisma.enrollment.upsert({
        where: { userId_programId: { userId: studentUser.id, programId: pid } },
        update: {
          progress: pid === 'course-1' ? 100 : 10,
          completedAt: pid === 'course-1' ? new Date() : null,
        },
        create: {
          userId: studentUser.id,
          programId: pid,
          progress: pid === 'course-1' ? 100 : 10,
          completedAt: pid === 'course-1' ? new Date() : null,
        },
      });

      // Mark all lessons as completed for course-1 to ensure actual 100% completion
      if (pid === 'course-1') {
        const tracks = await prisma.programTrack.findMany({ where: { programId: pid } });
        for (const track of tracks) {
          const mods = await prisma.module.findMany({ where: { trackId: track.id } });
          for (const mod of mods) {
            const lessons = await prisma.lesson.findMany({ where: { moduleId: mod.id } });
            for (const lesson of lessons) {
              await prisma.progress.upsert({
                where: { userId_lessonId: { userId: studentUser.id, lessonId: lesson.id } },
                update: {},
                create: { userId: studentUser.id, lessonId: lesson.id, completedAt: new Date() },
              });
            }
          }
        }
      }
      console.log(`  ✓ Enrolled in ${program.title}`);
    }
  }

  // 6. XP Transactions
  console.log('\n--- XP Transactions ---');
  if (studentUser) {
    const existingXp = await prisma.xpTransaction.findFirst({ where: { userId: studentUser.id } });
    if (!existingXp) {
      const xpEntries: { amount: number; type: XpType; daysAgo: number }[] = [
        { amount: 50, type: XpType.MODULE_COMPLETION, daysAgo: 3 },
        { amount: 20, type: XpType.DAILY_STREAK, daysAgo: 2 },
        { amount: 20, type: XpType.DAILY_STREAK, daysAgo: 1 },
        { amount: 100, type: XpType.ASSESSMENT_PASS, daysAgo: 0 },
      ];
      for (const xp of xpEntries) {
        await prisma.xpTransaction.create({
          data: { userId: studentUser.id, amount: xp.amount, type: xp.type, createdAt: new Date(Date.now() - 86400000 * xp.daysAgo) },
        });
      }
      console.log('  ✓ Added XP transactions for student');
    }

    // Sync User.xp with actual transactions
    const totalXp = await prisma.xpTransaction.aggregate({
      where: { userId: studentUser.id },
      _sum: { amount: true },
    });
    await prisma.user.update({
      where: { id: studentUser.id },
      data: {
        xp: totalXp._sum.amount ?? 0,
        streakCount: 2,
        lastActiveAt: new Date(),
      },
    });
  }

  // 7. Question Banks, Questions & Assessments (all programs)
  console.log('\n--- Question Banks & Assessments ---');

  // ── Clean up stale attempts/sessions so we can safely repopulate banks ──
  const staleAttempts = await prisma.assessmentAttempt.findMany({ select: { id: true } });
  if (staleAttempts.length > 0) {
    // Cascade: assessment_attempts.deleted → attempt_answers + violation_logs
    await prisma.assessmentAttempt.deleteMany({});
    console.log(`  🧹 Deleted ${staleAttempts.length} stale attempts`);
  }
  const staleSessions = await prisma.examSession.findMany({ select: { id: true } });
  if (staleSessions.length > 0) {
    await prisma.examSession.deleteMany({});
    console.log(`  🧹 Deleted ${staleSessions.length} stale exam sessions`);
  }

  interface QSeedDef {
    text: string; difficulty: Difficulty; tags: string[]; timer: number;
    correct: string; wrong: string[];
  }

  function shuffleOptions(correct: string, wrong: string[]) {
    const opts = [
      { text: correct, isCorrect: true },
      ...wrong.map(w => ({ text: w, isCorrect: false })),
    ];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }

  // ── Question Pools ──────────────────────────────────────────────────────────
  const AI_POOL: QSeedDef[] = [
    { text: 'What does "generative" mean in generative AI?', difficulty: Difficulty.EASY, tags: ['genai', 'fundamentals'], timer: 60, correct: 'It generates new content rather than just analyzing existing data', wrong: ['It generates reports from databases', 'It generates electricity', 'It generates random numbers'] },
    { text: 'Which architecture is the foundation of most modern LLMs?', difficulty: Difficulty.EASY, tags: ['llm', 'architecture'], timer: 60, correct: 'Transformer', wrong: ['Recurrent Neural Networks', 'Convolutional Neural Networks', 'Long Short-Term Memory'] },
    { text: 'What is prompt engineering?', difficulty: Difficulty.EASY, tags: ['prompt-engineering'], timer: 45, correct: 'Crafting inputs to get desired outputs from AI models', wrong: ['Writing code in Python', 'Building hardware for AI systems', 'Training AI models from scratch'] },
    { text: 'What does RAG stand for in LLM contexts?', difficulty: Difficulty.MEDIUM, tags: ['rag', 'architecture'], timer: 60, correct: 'Retrieval-Augmented Generation', wrong: ['Random Access Generator', 'Recurrent Attention Grid', 'Rapid AI Growth'] },
    { text: 'Key factor in build-vs-buy AI decisions?', difficulty: Difficulty.MEDIUM, tags: ['strategy'], timer: 90, correct: 'Total Cost of Ownership over 3 years', wrong: ['Only the upfront license cost', 'Number of employees', "CEO's preference for open-source"] },
    { text: 'What does the EU AI Act regulate?', difficulty: Difficulty.MEDIUM, tags: ['ethics', 'regulation'], timer: 60, correct: 'AI systems based on risk level to rights and safety', wrong: ['Only facial recognition', 'All electronic devices', 'Social media exclusively'] },
    { text: 'What is overfitting in ML?', difficulty: Difficulty.EASY, tags: ['ml', 'fundamentals'], timer: 60, correct: 'Model performs well on training data but poorly on new data', wrong: ['Model performs poorly on everything', 'Model trains too slowly', 'Model uses too much memory'] },
    { text: 'What is a CNN primarily used for?', difficulty: Difficulty.MEDIUM, tags: ['deep-learning', 'cnn'], timer: 60, correct: 'Image recognition and computer vision tasks', wrong: ['Natural language processing', 'Time series forecasting', 'Database management'] },
    { text: 'What is backpropagation?', difficulty: Difficulty.MEDIUM, tags: ['deep-learning', 'training'], timer: 90, correct: 'Algorithm for computing gradients in neural networks', wrong: ['A data preprocessing technique', 'A type of activation function', 'A model deployment strategy'] },
    { text: 'Enterprise AI deployment challenge?', difficulty: Difficulty.HARD, tags: ['enterprise', 'deployment'], timer: 90, correct: 'Data silos and integration with legacy systems', wrong: ['AI never makes mistakes', 'AI always reduces costs immediately', 'Employees universally welcome AI'] },
    { text: 'Technique to mitigate AI bias?', difficulty: Difficulty.HARD, tags: ['ethics', 'bias'], timer: 90, correct: 'Diverse training data, fairness metrics, and regular auditing', wrong: ['Using data from one demographic', 'Removing all human oversight', 'Training without validation'] },
    { text: 'What is the vanishing gradient problem?', difficulty: Difficulty.HARD, tags: ['deep-learning', 'training'], timer: 90, correct: 'Gradients become too small for deep networks to learn effectively', wrong: ['Gradients become too large', 'The model architecture vanishes', 'Training data disappears'] },
  ];

  const BUSINESS_POOL: QSeedDef[] = [
    { text: 'What is SEO?', difficulty: Difficulty.EASY, tags: ['marketing', 'seo'], timer: 45, correct: 'Optimizing web content to rank higher in search engines', wrong: ['Social media posting schedule', 'Email marketing automation', 'Paid advertising budgeting'] },
    { text: 'What is a conversion rate?', difficulty: Difficulty.EASY, tags: ['analytics', 'metrics'], timer: 45, correct: 'Percentage of users who complete a desired action', wrong: ['Total number of website visitors', 'Average time spent on page', 'Number of pages indexed'] },
    { text: 'What is a KPI?', difficulty: Difficulty.EASY, tags: ['analytics', 'metrics'], timer: 45, correct: 'Measurable value that tracks progress toward a business objective', wrong: ['A type of financial statement', 'A marketing campaign tool', 'A database query language'] },
    { text: 'What is FinTech?', difficulty: Difficulty.EASY, tags: ['fintech', 'fundamentals'], timer: 45, correct: 'Technology used to improve and automate financial services', wrong: ['A type of cryptocurrency', 'An accounting software', 'A banking regulation'] },
    { text: 'What is a payment gateway?', difficulty: Difficulty.MEDIUM, tags: ['fintech', 'payments'], timer: 60, correct: 'Service that authorizes credit card payments for businesses', wrong: ['A physical door at a bank', 'A type of cryptocurrency wallet', 'An accounting method'] },
    { text: 'What is supply chain management?', difficulty: Difficulty.MEDIUM, tags: ['ecommerce', 'operations'], timer: 60, correct: 'Managing the flow of goods from suppliers to customers', wrong: ['Managing employee schedules', 'Tracking website analytics', 'Designing product packaging'] },
    { text: 'What is customer lifetime value (CLV)?', difficulty: Difficulty.MEDIUM, tags: ['analytics', 'strategy'], timer: 60, correct: 'Total revenue a business expects from a single customer account', wrong: ['Cost of acquiring a new customer', 'Monthly subscription fee', 'Average order value'] },
    { text: 'What is dropshipping?', difficulty: Difficulty.MEDIUM, tags: ['ecommerce', 'operations'], timer: 60, correct: 'Retail model where the store does not keep products in stock', wrong: ['Shipping products via drone', 'Bulk purchasing from wholesalers', 'Same-day delivery service'] },
    { text: 'What is A/B testing?', difficulty: Difficulty.EASY, tags: ['marketing', 'optimization'], timer: 60, correct: 'Comparing two versions of content to determine which performs better', wrong: ['Testing software for bugs', 'Comparing test results with a control group', 'Running security penetration tests'] },
    { text: 'What is a cash flow statement?', difficulty: Difficulty.HARD, tags: ['finance', 'accounting'], timer: 90, correct: 'Financial report showing inflows and outflows of cash', wrong: ['A list of company assets', 'A profit calculation method', 'An employee payroll record'] },
    { text: 'What is programmatic advertising?', difficulty: Difficulty.HARD, tags: ['marketing', 'advertising'], timer: 90, correct: 'Automated buying and selling of digital ad space using AI', wrong: ['Manually placing ads on websites', 'Creating TV commercial scripts', 'Designing print advertisements'] },
    { text: 'What is churn rate?', difficulty: Difficulty.MEDIUM, tags: ['analytics', 'metrics'], timer: 60, correct: 'Percentage of customers who stop using a product over a period', wrong: ['Rate of customer complaints', 'Employee turnover percentage', 'Website bounce rate'] },
  ];

  const DESIGN_POOL: QSeedDef[] = [
    { text: 'What is the difference between UI and UX?', difficulty: Difficulty.EASY, tags: ['ui-ux', 'fundamentals'], timer: 45, correct: 'UI is visual design; UX is overall user experience', wrong: ['They are the same thing', 'UX is visual, UI is functional', 'UI is backend, UX is frontend'] },
    { text: 'What is a wireframe?', difficulty: Difficulty.EASY, tags: ['ui-ux', 'prototyping'], timer: 45, correct: 'Low-fidelity layout that outlines structure and hierarchy', wrong: ['A fully designed high-fidelity mockup', 'A working code prototype', 'A user research document'] },
    { text: 'What is design thinking?', difficulty: Difficulty.EASY, tags: ['design-thinking', 'methodology'], timer: 60, correct: 'Human-centered approach to solving problems through empathy and iteration', wrong: ['A graphic design software', 'A coding framework', 'A project management tool'] },
    { text: 'What is a persona in UX?', difficulty: Difficulty.MEDIUM, tags: ['ux', 'research'], timer: 60, correct: 'Fictional representation of target users based on research data', wrong: ['A real customer interview transcript', 'A character in a video game', 'An employee profile in HR'] },
    { text: 'What is the golden ratio in design?', difficulty: Difficulty.MEDIUM, tags: ['visual-design', 'principles'], timer: 60, correct: 'Mathematical ratio (1:1.618) used for aesthetically pleasing compositions', wrong: ['A color theory principle', 'A typography rule for font sizes', 'A grid layout system'] },
    { text: 'What is a design system?', difficulty: Difficulty.MEDIUM, tags: ['ui-ux', 'systems'], timer: 60, correct: 'Collection of reusable components and standards for building products', wrong: ['A single UI component library', 'A design software application', 'A project management methodology'] },
    { text: 'What is the purpose of user testing?', difficulty: Difficulty.EASY, tags: ['ux', 'research'], timer: 60, correct: 'Observing real users to identify usability issues', wrong: ['Testing software code for bugs', 'Checking design file compatibility', 'Reviewing competitor products'] },
    { text: 'What is visual hierarchy?', difficulty: Difficulty.MEDIUM, tags: ['visual-design', 'principles'], timer: 60, correct: 'Arranging elements to show importance and guide the viewer\'s eye', wrong: ['A list of design team roles', 'A type of organizational chart', 'A color palette selection method'] },
    { text: 'What is an MVP?', difficulty: Difficulty.MEDIUM, tags: ['product-design', 'methodology'], timer: 60, correct: 'Minimum Viable Product — version with just enough features to validate learning', wrong: ['Most Valuable Player of the design team', 'Maximum Visual Prototype', 'Minimum Volume Production'] },
    { text: 'What is a design sprint?', difficulty: Difficulty.HARD, tags: ['product-design', 'methodology'], timer: 90, correct: 'Time-constrained 5-day process to solve critical design challenges', wrong: ['A rapid coding competition', 'A marketing campaign launch', 'A week-long design conference'] },
    { text: 'What is color theory?', difficulty: Difficulty.EASY, tags: ['visual-design', 'principles'], timer: 45, correct: 'Body of knowledge about color mixing, harmony, and psychological effects', wrong: ['A paint manufacturing process', 'The science of light refraction', 'A printer calibration method'] },
    { text: 'What is responsive design?', difficulty: Difficulty.MEDIUM, tags: ['ui-ux', 'development'], timer: 60, correct: 'Approach ensuring interfaces adapt to different screen sizes', wrong: ['A design that responds to user voice commands', 'A fixed-width desktop layout', 'Animated user interface elements'] },
  ];

  const programToCategory: Record<string, { pool: QSeedDef[]; qbId: string; title: string }> = {
    'course-1': { pool: AI_POOL, qbId: 'qb-genai-leaders', title: 'Generative AI for Leaders Exam Bank' },
    'course-2': { pool: AI_POOL, qbId: 'qb-ml-fundamentals', title: 'Machine Learning Fundamentals Exam Bank' },
    'course-3': { pool: AI_POOL, qbId: 'qb-dl-masterclass', title: 'Deep Learning Masterclass Exam Bank' },
    'course-4': { pool: AI_POOL, qbId: 'qb-ai-ethics', title: 'AI Ethics & Governance Exam Bank' },
    'course-5': { pool: BUSINESS_POOL, qbId: 'qb-digital-marketing', title: 'Digital Marketing Strategy Exam Bank' },
    'course-6': { pool: BUSINESS_POOL, qbId: 'qb-fintech', title: 'Financial Technology & Innovation Exam Bank' },
    'course-7': { pool: BUSINESS_POOL, qbId: 'qb-ecommerce', title: 'E-Commerce Operations Exam Bank' },
    'course-8': { pool: BUSINESS_POOL, qbId: 'qb-biz-analytics', title: 'Business Analytics Exam Bank' },
    'course-9': { pool: DESIGN_POOL, qbId: 'qb-uiux', title: 'UI/UX Design Principles Exam Bank' },
    'course-10': { pool: DESIGN_POOL, qbId: 'qb-design-thinking', title: 'Design Thinking Exam Bank' },
    'course-11': { pool: DESIGN_POOL, qbId: 'qb-visual-comm', title: 'Visual Communication & Storytelling Exam Bank' },
    'course-12': { pool: DESIGN_POOL, qbId: 'qb-product-design', title: 'Product Design Exam Bank' },
  };

  function getAssessmentConfig(moduleOrder: number) {
    if (moduleOrder <= 2) return { passingScore: 80, sampleSize: 5, timeLimit: 600, maxAttempts: 10, timeLimitEnabled: true, allowResume: true };
    if (moduleOrder <= 4) return { passingScore: 70, sampleSize: 8, timeLimit: 900, maxAttempts: 10, timeLimitEnabled: true, allowResume: true };
    if (moduleOrder <= 6) return { passingScore: 60, sampleSize: 10, timeLimit: 1800, maxAttempts: 10, timeLimitEnabled: false, allowResume: true };
    if (moduleOrder <= 8) return { passingScore: 85, sampleSize: 6, timeLimit: 1200, maxAttempts: 10, timeLimitEnabled: true, allowResume: true };
    return { passingScore: 50, sampleSize: 12, timeLimit: 3600, maxAttempts: 10, timeLimitEnabled: false, allowResume: true };
  }

  const allPrograms = await prisma.program.findMany({ orderBy: { id: 'asc' } });

  for (const prog of allPrograms) {
    const cat = programToCategory[prog.id];
    if (!cat) continue;

    // Find the faculty member who belongs to the program's institution
    const programInst = await prisma.program.findUnique({
      where: { id: prog.id },
      select: { institutionId: true },
    });
    if (!programInst) continue;

    const facultyMember = await prisma.facultyMember.findFirst({
      where: { institutionId: programInst.institutionId },
    });
    if (!facultyMember) continue;

    // ── Create or repopulate question bank ─────────────────────────────────
    let qb = await prisma.questionBank.findUnique({ where: { id: cat.qbId } });
    if (!qb) {
      qb = await prisma.questionBank.create({
        data: {
          id: cat.qbId,
          title: cat.title,
          description: `Question bank for ${prog.title}.`,
          institutionId: programInst.institutionId,
          facultyId: facultyMember.id,
        },
      });
      console.log(`  ✓ Created bank "${cat.title}"`);
    }

    const existingCount = await prisma.questionBankQuestion.count({ where: { questionBankId: qb.id } });
    if (existingCount !== cat.pool.length) {
      if (existingCount > 0) {
        const oldQuestions = await prisma.questionBankQuestion.findMany({ where: { questionBankId: qb.id }, select: { id: true } });
        await prisma.questionOption.deleteMany({ where: { questionId: { in: oldQuestions.map(q => q.id) } } });
        await prisma.questionBankQuestion.deleteMany({ where: { questionBankId: qb.id } });
        console.log(`  🗑 Deleted ${existingCount} old questions`);
      }

      for (const qDef of cat.pool) {
        const q = await prisma.questionBankQuestion.create({
          data: {
            questionBankId: qb.id,
            text: qDef.text,
            difficulty: qDef.difficulty,
            tags: qDef.tags,
            timerSeconds: qDef.timer,
          },
        });
        const options = shuffleOptions(qDef.correct, qDef.wrong);
        for (const opt of options) {
          await prisma.questionOption.create({
            data: { questionId: q.id, text: opt.text, isCorrect: opt.isCorrect },
          });
        }
      }
      const label = existingCount === 0 ? 'Created' : 'Repopulated';
      console.log(`  ✓ ${label} bank "${cat.title}" (${cat.pool.length} questions)`);
    } else {
      console.log(`  ✓ Bank "${cat.title}" up-to-date (${existingCount} questions)`);
    }

    // ── Create assessments for ALL modules (ROOTS + EDGE) ──────────────────
    const tracks = await prisma.programTrack.findMany({
      where: { programId: prog.id },
      orderBy: { createdAt: 'asc' },
    });

    for (const track of tracks) {
      const modules = await prisma.module.findMany({
        where: { trackId: track.id },
        orderBy: { order: 'asc' },
      });

      for (const mod of modules) {
        const cfg = getAssessmentConfig(mod.order);
        const existing = await prisma.assessment.findFirst({ where: { moduleId: mod.id } });
        if (existing) {
          // Update existing assessment with latest config
          await prisma.assessment.update({
            where: { id: existing.id },
            data: {
              questionBankId: cat.qbId,
              passingScore: cfg.passingScore,
              sampleSize: cfg.sampleSize,
              timeLimit: cfg.timeLimit,
              maxAttempts: cfg.maxAttempts,
              timeLimitEnabled: cfg.timeLimitEnabled,
              allowResume: cfg.allowResume,
            },
          });
          continue;
        }

        await prisma.assessment.create({
          data: {
            moduleId: mod.id,
            questionBankId: cat.qbId,
            title: `${mod.title} Assessment`,
            passingScore: cfg.passingScore,
            sampleSize: cfg.sampleSize,
            timeLimit: cfg.timeLimit,
            maxAttempts: cfg.maxAttempts,
            timeLimitEnabled: cfg.timeLimitEnabled,
            allowResume: cfg.allowResume,
          },
        });
        console.log(`  ✓ Assessment "${mod.title}" (${prog.id}/${track.type === 'ROOTS' ? 'R' : 'E'}${mod.order}) — pass=${cfg.passingScore}%, attempts=${cfg.maxAttempts}, timed=${cfg.timeLimitEnabled}, resume=${cfg.allowResume}`);
      }
    }

    // Seed passed assessment attempts for the student for course-1
    if (studentUser) {
      const course1Assessments = await prisma.assessment.findMany({
        where: { module: { track: { programId: 'course-1' } } }
      });
      for (const assessment of course1Assessments) {
        const existingAttempt = await prisma.assessmentAttempt.findFirst({
          where: { userId: studentUser.id, assessmentId: assessment.id, passed: true }
        });
        if (!existingAttempt) {
          await prisma.assessmentAttempt.create({
            data: {
              userId: studentUser.id,
              assessmentId: assessment.id,
              score: 90,
              passed: true,
              completedAt: new Date(),
            }
          });
          console.log(`  ✓ Passed AssessmentAttempt seeded for "${assessment.title}"`);
        }
      }
    }
  }

  // 8. Achievement Definitions
  console.log('\n--- Achievement Definitions ---');
  const achievementDefs: {
    key: string; title: string; description: string; category: AchievementCategory;
    rarity: AchievementRarity; icon: string; xpReward: number; criteria: { type: string; target: number };
  }[] = [
    { key: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', category: AchievementCategory.COMPLETION, rarity: AchievementRarity.COMMON, icon: 'BookOpen', xpReward: 50, criteria: { type: 'lessons_completed', target: 1 } },
    { key: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', category: AchievementCategory.COMPLETION, rarity: AchievementRarity.RARE, icon: 'BookOpen', xpReward: 100, criteria: { type: 'lessons_completed', target: 10 } },
    { key: 'fifty-lessons', title: 'Knowledge Seeker', description: 'Complete 50 lessons', category: AchievementCategory.COMPLETION, rarity: AchievementRarity.EPIC, icon: 'BookOpen', xpReward: 500, criteria: { type: 'lessons_completed', target: 50 } },
    { key: 'module-master', title: 'Module Master', description: 'Complete 5 modules fully', category: AchievementCategory.COMPLETION, rarity: AchievementRarity.RARE, icon: 'Layers', xpReward: 200, criteria: { type: 'modules_completed', target: 5 } },
    { key: 'first-program', title: 'Program Graduate', description: 'Complete your first program', category: AchievementCategory.COMPLETION, rarity: AchievementRarity.EPIC, icon: 'GraduationCap', xpReward: 1000, criteria: { type: 'programs_completed', target: 1 } },
    { key: 'streak-3', title: 'Consistency is Key', description: 'Maintain a 3-day streak', category: AchievementCategory.STREAK, rarity: AchievementRarity.COMMON, icon: 'Flame', xpReward: 50, criteria: { type: 'streak_days', target: 3 } },
    { key: 'streak-7', title: 'Unstoppable', description: 'Maintain a 7-day streak', category: AchievementCategory.STREAK, rarity: AchievementRarity.RARE, icon: 'Zap', xpReward: 200, criteria: { type: 'streak_days', target: 7 } },
    { key: 'streak-30', title: 'Monthly Warrior', description: 'Maintain a 30-day streak', category: AchievementCategory.STREAK, rarity: AchievementRarity.EPIC, icon: 'Flame', xpReward: 1000, criteria: { type: 'streak_days', target: 30 } },
    { key: 'xp-100', title: 'Getting Started', description: 'Earn 100 total XP', category: AchievementCategory.XP, rarity: AchievementRarity.COMMON, icon: 'Star', xpReward: 50, criteria: { type: 'xp_earned', target: 100 } },
    { key: 'xp-500', title: 'Rising Star', description: 'Earn 500 total XP', category: AchievementCategory.XP, rarity: AchievementRarity.RARE, icon: 'Star', xpReward: 200, criteria: { type: 'xp_earned', target: 500 } },
    { key: 'xp-1000', title: 'XP Hunter', description: 'Earn 1000 total XP', category: AchievementCategory.XP, rarity: AchievementRarity.EPIC, icon: 'Trophy', xpReward: 500, criteria: { type: 'xp_earned', target: 1000 } },
    { key: 'xp-5000', title: 'Legendary Learner', description: 'Earn 5000 total XP', category: AchievementCategory.XP, rarity: AchievementRarity.LEGENDARY, icon: 'Trophy', xpReward: 2000, criteria: { type: 'xp_earned', target: 5000 } },
    { key: 'first-assessment', title: 'Test Taker', description: 'Complete your first assessment', category: AchievementCategory.ASSESSMENT, rarity: AchievementRarity.COMMON, icon: 'ClipboardCheck', xpReward: 50, criteria: { type: 'assessments_passed', target: 1 } },
    { key: 'five-assessments', title: 'Assessment Veteran', description: 'Pass 5 assessments', category: AchievementCategory.ASSESSMENT, rarity: AchievementRarity.RARE, icon: 'ClipboardCheck', xpReward: 200, criteria: { type: 'assessments_passed', target: 5 } },
    { key: 'perfect-score', title: 'Perfect Score', description: 'Get 100% on any assessment', category: AchievementCategory.ASSESSMENT, rarity: AchievementRarity.EPIC, icon: 'Award', xpReward: 500, criteria: { type: 'perfect_scores', target: 1 } },
    { key: 'note-taker', title: 'Note Taker', description: 'Create your first note', category: AchievementCategory.ENGAGEMENT, rarity: AchievementRarity.COMMON, icon: 'StickyNote', xpReward: 25, criteria: { type: 'notes_created', target: 1 } },
    { key: 'prolific-note-taker', title: 'Prolific Note Taker', description: 'Create 25 notes', category: AchievementCategory.ENGAGEMENT, rarity: AchievementRarity.RARE, icon: 'StickyNote', xpReward: 150, criteria: { type: 'notes_created', target: 25 } },
    { key: 'bookmarker', title: 'Bookmarker', description: 'Bookmark your first lesson', category: AchievementCategory.ENGAGEMENT, rarity: AchievementRarity.COMMON, icon: 'Bookmark', xpReward: 25, criteria: { type: 'bookmarks_added', target: 1 } },
    { key: 'curator', title: 'Curator', description: 'Bookmark 10 lessons', category: AchievementCategory.ENGAGEMENT, rarity: AchievementRarity.RARE, icon: 'Bookmark', xpReward: 100, criteria: { type: 'bookmarks_added', target: 10 } },
  ];

  const existingAchievement = await prisma.achievement.findFirst();
  if (!existingAchievement) {
    for (const def of achievementDefs) {
      await prisma.achievement.create({ data: def as any });
    }
    console.log(`  ✓ Created ${achievementDefs.length} achievement definitions`);
  } else {
    console.log('  Achievement definitions already exist, skipped');
  }

  // Seed Enterprise Platform Additions
  await seedEnterprise();

  console.log('\n=== Seeding completed successfully! ===');
}

async function seedEnterprise() {
  console.log('\n--- Seeding Enterprise Compliance & Training Platform ---');

  const passwordHash = hashPassword('password123');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'org-allianz' },
    update: {},
    create: {
      id: 'org-allianz',
      name: 'Allianz Corp',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      industry: 'Financial Services',
      size: 'ENTERPRISE',
      billingEmail: 'billing@allianz.com',
    },
  });
  console.log(`  ✓ Seeding organization: ${org.name}`);

  // 2. Create User and Org Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'orgadmin@allianz.com' },
    update: { role: 'ORGANIZATION_ADMIN' },
    create: {
      id: 'user-orgadmin',
      email: 'orgadmin@allianz.com',
      name: 'Arya Risk Manager',
      passwordHash,
      role: 'ORGANIZATION_ADMIN',
      onboarded: true,
    },
  });

  await prisma.organizationAdmin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      id: 'orgadmin-1',
      userId: adminUser.id,
      organizationId: org.id,
      role: 'ADMIN',
    },
  });
  console.log(`  ✓ Seeding Org Admin: ${adminUser.email}`);

  // 3. Create User and Employee
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@allianz.com' },
    update: { role: 'EMPLOYEE' },
    create: {
      id: 'user-employee',
      email: 'employee@allianz.com',
      name: 'Tirth Employee',
      passwordHash,
      role: 'EMPLOYEE',
      onboarded: true,
    },
  });

  // 4. Create Department
  const dept = await prisma.department.upsert({
    where: { id: 'dept-grc' },
    update: {},
    create: {
      id: 'dept-grc',
      organizationId: org.id,
      name: 'Global Risk & Compliance',
      description: 'Responsible for regulatory oversight, auditing, and cybersecurity compliance training.',
    },
  });
  console.log(`  ✓ Seeding Department: ${dept.name}`);

  // 5. Create Employee entry
  const employee = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: { departmentId: dept.id },
    create: {
      id: 'emp-tirth',
      userId: employeeUser.id,
      organizationId: org.id,
      departmentId: dept.id,
      title: 'Compliance Associate',
      employmentStatus: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  console.log(`  ✓ Seeding Employee: ${employeeUser.email}`);

  // Set manager
  await prisma.department.update({
    where: { id: dept.id },
    data: { managerId: employee.id },
  });

  // 6. Create Enterprise Question Bank for Cybersecurity
  const eqb = await prisma.enterpriseQuestionBank.upsert({
    where: { id: 'eqb-cybersecurity' },
    update: {},
    create: {
      id: 'eqb-cybersecurity',
      title: 'Cybersecurity Threat Mitigation Bank',
      description: 'Core questions for evaluating threat landscape, phishing, and password compliance.',
      organizationId: org.id,
      departmentId: dept.id,
      complianceTrack: 'CYBER_SECURITY',
      sourceType: 'SEEDED_DEMO',
    },
  });
  console.log(`  ✓ Seeding Question Bank: ${eqb.title}`);

  // Seed questions if empty
  const qCount = await prisma.enterpriseQuestion.count({
    where: { questionBankId: eqb.id },
  });
  if (qCount === 0) {
    const q1 = await prisma.enterpriseQuestion.create({
      data: {
        id: 'eq-cyber-1',
        questionBankId: eqb.id,
        text: 'Which of the following describes a spear-phishing attack?',
        difficulty: 'MEDIUM',
        explanation: 'Spear phishing targets specific individuals with personalized communications to steal credentials.',
        timerSeconds: 45,
      },
    });
    await prisma.enterpriseQuestionOption.createMany({
      data: [
        { questionId: q1.id, text: 'A personalized email target aiming at a specific individual', isCorrect: true },
        { questionId: q1.id, text: 'A broad attack targeting all users on a server', isCorrect: false },
        { questionId: q1.id, text: 'A physical security breach at the office building', isCorrect: false },
        { questionId: q1.id, text: 'A brute-force attempt to guess admin passwords', isCorrect: false },
      ],
    });

    const q2 = await prisma.enterpriseQuestion.create({
      data: {
        id: 'eq-cyber-2',
        questionBankId: eqb.id,
        text: 'What is the recommended character minimum for corporate master passwords under NIST guidelines?',
        difficulty: 'EASY',
        explanation: 'NIST SP 800-63B recommends memorized secrets (passwords) be at least 8 characters in length, but 12-16 is preferred for enterprise security.',
        timerSeconds: 45,
      },
    });
    await prisma.enterpriseQuestionOption.createMany({
      data: [
        { questionId: q2.id, text: 'At least 12 characters', isCorrect: true },
        { questionId: q2.id, text: '6 characters', isCorrect: false },
        { questionId: q2.id, text: 'Any length is fine as long as there is an uppercase character', isCorrect: false },
        { questionId: q2.id, text: 'NIST does not recommend length rules', isCorrect: false },
      ],
    });
    console.log('    ✓ Seeded threat mitigation questions');
  }

  // 7. Seed Compliance Assessment
  const assessment = await prisma.complianceAssessment.upsert({
    where: { id: 'assess-cyber-1' },
    update: {},
    create: {
      id: 'assess-cyber-1',
      organizationId: org.id,
      departmentId: dept.id,
      questionBankId: eqb.id,
      title: 'Cybersecurity Threat & Mitigation Exam',
      complianceTrack: 'CYBER_SECURITY',
      passingScore: 80,
      sampleSize: 2,
      timeLimit: 900,
      timeLimitEnabled: true,
      maxAttempts: 3,
      allowResume: true,
    },
  });
  console.log(`  ✓ Seeding Compliance Assessment: ${assessment.title}`);

  // 8. Seed Compliance Attempt
  const attempt = await prisma.complianceAssessmentAttempt.upsert({
    where: { id: 'attempt-cyber-1' },
    update: {},
    create: {
      id: 'attempt-cyber-1',
      userId: employeeUser.id,
      employeeId: employee.id,
      assessmentId: assessment.id,
      score: 2,
      percentage: 100.0,
      passed: true,
      startedAt: new Date(),
      completedAt: new Date(),
      timeTakenSeconds: 120,
    },
  });

  // 9. Seed Enterprise Credential Template
  const template = await prisma.enterpriseCredentialTemplate.upsert({
    where: { id: 'template-cyber-1' },
    update: {},
    create: {
      id: 'template-cyber-1',
      name: 'Allianz Security Threat Specialist Certificate',
      complianceTrack: 'CYBER_SECURITY',
      organizationId: org.id,
      designUrl: '/designs/enterprise-dark.png',
    },
  });
  console.log(`  ✓ Seeding Credential Template: ${template.name}`);

  // 10. Seed Enterprise Credential
  const credential = await prisma.enterpriseCredential.upsert({
    where: { id: 'cred-cyber-1' },
    update: {},
    create: {
      id: 'cred-cyber-1',
      employeeId: employee.id,
      organizationId: org.id,
      complianceAssessmentId: assessment.id,
      complianceTrack: 'CYBER_SECURITY',
      verificationCode: 'ALLIANZCYBER202611',
      qrCodeUrl: '/qr/allianzcyber202611.png',
      verificationUrl: 'http://localhost:3000/verify/ALLIANZCYBER202611',
      verificationStatus: 'ACTIVE',
      issuedAt: new Date(),
      templateId: template.id,
    },
  });
  console.log(`  ✓ Seeding Enterprise Credential: ${credential.verificationCode}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
