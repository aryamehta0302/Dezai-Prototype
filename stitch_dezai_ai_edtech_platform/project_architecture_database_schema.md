# Dezai AI | Technical Architecture & Schema

## Database Schema (Prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  STUDENT
  UNIVERSITY_ADMIN
  DEZAI_ADMIN
}

enum Tier {
  FOUNDATIONAL // Dezai
  ACADEMIC     // University
  PROFESSIONAL // University + Industry
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(STUDENT)
  image         String?
  studentProfile StudentProfile?
  universityId  String?
  university    University? @relation(fields: [universityId], references: [id])
  enrollments   Enrollment[]
  certificates  Certificate[]
  payments      Payment[]
  createdAt     DateTime  @default(now())
}

model StudentProfile {
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id])
  university  String
  year        Int
  semester    Int
  bio         String?
}

model University {
  id          String @id @default(cuid())
  name        String @unique
  logo        String
  status      String @default("ACTIVE")
  users       User[]
  courses     Course[]
  revenueShare Float  @default(0.7) // 70% to university
}

model Course {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  instructor    String
  universityId  String
  university    University @relation(fields: [universityId], references: [id])
  tier          Tier
  price         Float
  duration      String
  modules       CourseModule[]
  enrollments   Enrollment[]
  quizzes       Quiz[]
}

model CourseModule {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  title     String
  order     Int
  lessons   Lesson[]
}

model Lesson {
  id        String @id @default(cuid())
  moduleId  String
  module    CourseModule @relation(fields: [moduleId], references: [id])
  title     String
  content   String? // MDX or JSON
  videoUrl  String?
  order     Int
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  progress  Float    @default(0)
  completed Boolean  @default(false)
  enrolledAt DateTime @default(now())
}

model Quiz {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  title       String
  timeLimit   Int      // in minutes
  questions   Question[]
  attempts    QuizAttempt[]
}

model Question {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id])
  text      String
  options   Json     // Array of options
  answer    Int      // Index of correct option
}

model QuizAttempt {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id])
  userId    String
  score     Float
  passed    Boolean
  createdAt DateTime @default(now())
}

model Certificate {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  courseId      String
  tier          Tier
  issueDate     DateTime @default(now())
  verifyUrl     String   @unique
  pdfUrl        String?
}

model Payment {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  amount        Float
  currency      String   @default("INR")
  razorpayId    String   @unique
  status        String
  createdAt     DateTime @default(now())
}
```

## API Architecture
- `GET /api/courses` - Search & Filter courses
- `GET /api/courses/[slug]` - Course details
- `POST /api/enroll` - Process enrollment (Razorpay)
- `POST /api/quiz/submit` - Validate answers and log attempt
- `GET /api/verify/[certId]` - Public verification endpoint
- `GET /api/admin/analytics` - Revenue and student trends

## RBAC System
- **Student**: View courses, enroll, learn, take quizzes, view certificates.
- **University Admin**: Manage their university's courses, view revenue share, monitor their students.
- **Dezai Admin**: Manage all universities, global courses, users, and global revenue.
