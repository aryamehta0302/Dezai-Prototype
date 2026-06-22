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
      const existing = await prisma.enrollment.findUnique({ where: { userId_programId: { userId: studentUser.id, programId: pid } } });
      if (existing) continue;

      await prisma.enrollment.create({
        data: { userId: studentUser.id, programId: pid, progress: pid === 'course-1' ? 45 : 10 },
      });

      // Mark first 2 ROOTS-track lessons as completed for course-1
      if (pid === 'course-1') {
        const rootsTrack = await prisma.programTrack.findFirst({ where: { programId: pid, type: TrackType.ROOTS } });
        if (rootsTrack) {
          const mods = await prisma.module.findMany({ where: { trackId: rootsTrack.id }, orderBy: { order: 'asc' }, take: 2 });
          for (const mod of mods) {
            const lessons = await prisma.lesson.findMany({ where: { moduleId: mod.id }, orderBy: { order: 'asc' } });
            if (lessons.length > 0) {
              // Mark first lesson of each module as completed
              await prisma.progress.upsert({
                where: { userId_lessonId: { userId: studentUser.id, lessonId: lessons[0].id } },
                update: {},
                create: { userId: studentUser.id, lessonId: lessons[0].id, completedAt: new Date(Date.now() - 86400000 * (mods.indexOf(mod) + 1)) },
              });
              // Mark second if available
              if (lessons.length > 1) {
                await prisma.progress.upsert({
                  where: { userId_lessonId: { userId: studentUser.id, lessonId: lessons[1].id } },
                  update: {},
                  create: { userId: studentUser.id, lessonId: lessons[1].id, completedAt: new Date(Date.now() - 86400000 * mods.indexOf(mod)) },
                });
              }
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

  // 7. Question Banks, Questions & Assessments
  console.log('\n--- Question Banks & Assessments ---');
  const stanfordInst = await prisma.institution.findUnique({ where: { id: 'inst-stanford' } });
  const stanfordFaculty = await prisma.facultyMember.findFirst({ where: { institutionId: 'inst-stanford' } });

  if (stanfordInst && stanfordFaculty) {
    const qbId = 'qb-genai-leaders';
    const existingQb = await prisma.questionBank.findUnique({ where: { id: qbId } });
    if (!existingQb) {
      const qb = await prisma.questionBank.create({
        data: { id: qbId, title: 'Generative AI for Leaders Exam Bank', description: 'Sample question bank for the GenAI program.', institutionId: stanfordInst.id, facultyId: stanfordFaculty.id },
      });
      console.log('  ✓ Created question bank');

      // Questions with options
      interface QDef { text: string; difficulty: Difficulty; tags: string[]; timerSeconds: number; options: { text: string; isCorrect: boolean }[] }
      const questions: QDef[] = [
        { text: 'What does "generative" mean in generative AI?', difficulty: Difficulty.EASY, tags: ['genai', 'fundamentals'], timerSeconds: 60, options: [
          { text: 'It generates new content rather than just analyzing existing data', isCorrect: true },
          { text: 'It generates reports from databases', isCorrect: false },
          { text: 'It generates electricity', isCorrect: false },
          { text: 'It generates random numbers', isCorrect: false },
        ]},
        { text: 'Which architecture is the foundation of most modern LLMs?', difficulty: Difficulty.EASY, tags: ['llm', 'architecture'], timerSeconds: 60, options: [
          { text: 'Recurrent Neural Networks', isCorrect: false },
          { text: 'Transformer', isCorrect: true },
          { text: 'Convolutional Neural Networks', isCorrect: false },
          { text: 'Long Short-Term Memory', isCorrect: false },
        ]},
        { text: 'What is prompt engineering?', difficulty: Difficulty.EASY, tags: ['prompt-engineering'], timerSeconds: 45, options: [
          { text: 'Writing code in Python', isCorrect: false },
          { text: 'The practice of crafting inputs to get desired outputs from AI models', isCorrect: true },
          { text: 'Building hardware for AI systems', isCorrect: false },
          { text: 'Training AI models from scratch', isCorrect: false },
        ]},
        { text: 'What is RAG in the context of LLMs?', difficulty: Difficulty.MEDIUM, tags: ['rag', 'architecture'], timerSeconds: 60, options: [
          { text: 'Retrieval-Augmented Generation — grounding responses in external knowledge', isCorrect: true },
          { text: 'Random Access Generator', isCorrect: false },
          { text: 'Recurrent Attention Grid', isCorrect: false },
          { text: 'Rapid AI Growth', isCorrect: false },
        ]},
        { text: 'Which of the following is a key consideration when choosing between building and buying AI solutions?', difficulty: Difficulty.MEDIUM, tags: ['strategy', 'build-vs-buy'], timerSeconds: 90, options: [
          { text: 'Total Cost of Ownership over 3 years', isCorrect: true },
          { text: 'Only the upfront license cost', isCorrect: false },
          { text: 'The number of employees in the company', isCorrect: false },
          { text: 'The CEO\'s preference for open-source software', isCorrect: false },
        ]},
        { text: 'What does the EU AI Act primarily regulate?', difficulty: Difficulty.MEDIUM, tags: ['ethics', 'regulation'], timerSeconds: 60, options: [
          { text: 'Only facial recognition technology', isCorrect: false },
          { text: 'All electronic devices', isCorrect: false },
          { text: 'AI systems based on their risk level to fundamental rights and safety', isCorrect: true },
          { text: 'Social media platforms exclusively', isCorrect: false },
        ]},
        { text: 'What is a key challenge when deploying AI in enterprise settings?', difficulty: Difficulty.HARD, tags: ['enterprise', 'deployment'], timerSeconds: 90, options: [
          { text: 'AI never makes mistakes', isCorrect: false },
          { text: 'Data silos and integration with legacy systems', isCorrect: true },
          { text: 'AI always reduces costs immediately', isCorrect: false },
          { text: 'Employees universally welcome AI without training', isCorrect: false },
        ]},
        { text: 'Which technique helps mitigate bias in AI models?', difficulty: Difficulty.HARD, tags: ['ethics', 'bias'], timerSeconds: 90, options: [
          { text: 'Using only data from one demographic group', isCorrect: false },
          { text: 'Diverse training data, fairness metrics, and regular auditing', isCorrect: true },
          { text: 'Removing all human oversight', isCorrect: false },
          { text: 'Training models without any validation', isCorrect: false },
        ]},
      ];

      for (const qDef of questions) {
        const q = await prisma.questionBankQuestion.create({
          data: { questionBankId: qb.id, text: qDef.text, difficulty: qDef.difficulty, tags: qDef.tags, timerSeconds: qDef.timerSeconds },
        });
        for (const opt of qDef.options) {
          await prisma.questionOption.create({
            data: { questionId: q.id, text: opt.text, isCorrect: opt.isCorrect },
          });
        }
      }
      console.log(`  ✓ Created ${questions.length} questions with options`);
    }

    // Create assessments for course-1 ROOTS modules
    const course1 = await prisma.program.findUnique({ where: { id: 'course-1' } });
    if (course1) {
      const rootsTrack = await prisma.programTrack.findFirst({ where: { programId: course1.id, type: TrackType.ROOTS } });
      if (rootsTrack) {
        const mods = await prisma.module.findMany({ where: { trackId: rootsTrack.id }, orderBy: { order: 'asc' } });
        for (const mod of mods) {
          const existingAssess = await prisma.assessment.findFirst({ where: { moduleId: mod.id } });
          if (!existingAssess) {
            await prisma.assessment.create({
              data: {
                moduleId: mod.id,
                questionBankId: qbId,
                title: `${mod.title} Assessment`,
                passingScore: 70,
                sampleSize: 4,
                timeLimit: 900, // 15 minutes
              },
            });
            console.log(`  ✓ Assessment for "${mod.title}"`);
          }
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

  console.log('\n=== Seeding completed successfully! ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
