# Dezai AI — Micro-Credentials & Proctored EdTech SaaS

Dezai AI is a university-grade EdTech platform with a **Next.js 16 frontend** and a **NestJS API backend**.

---

## Architecture

```
Dezai-Prototype/
├── frontend/                     # Next.js 16 (App Router) — port 3000
│   ├── src/app/                  # Routing layer
│   ├── src/features/             # Domain modules (catalog, learning, auth, etc.)
│   ├── src/shared/               # Reusable UI, hooks, utils
│   └── src/lib/                  # Stores, providers
│
├── backend/                      # NestJS API — port 3001
│   ├── src/modules/              # Feature modules (auth, programs, learning, etc.)
│   ├── src/common/               # Guards, decorators, filters
│   └── prisma/                   # Schema, migrations, seeders
│
├── project-docs/                 # Planning docs, route/component manifests
└── ARCHITECTURE.md               # Import rules & folder conventions
```

---

## Prerequisites

- **Node.js** v18+
- A **Neon PostgreSQL** database (or any Postgres)

---

## Setup

### 1. Environment files

Both `frontend/` and `backend/` need a `.env` file. Copy the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in the values. At minimum:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — any random string (use `openssl rand -base64 32`)

---

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed        # seed institutions, users, 12 programs with full curriculum
npm run dev                # starts API on http://127.0.0.1:3001
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # starts app on http://127.0.0.1:3000
```

---

## Test Accounts

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Student | student@dezai.edu  | password123   |
| Faculty | faculty@dezai.edu  | password123   |
| Admin   | admin@dezai.edu    | password123   |

---

## Useful Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `frontend/` | Start Next.js dev server |
| `npm run dev` | `backend/` | Start NestJS dev server (watch mode) |
| `npm run build` | `frontend/` | Build frontend for production |
| `npm run build` | `backend/` | Build backend for production |
| `npm run lint` | `frontend/` | ESLint frontend |
| `npm run lint` | `backend/` | ESLint backend |
| `npx prisma migrate dev` | `backend/` | Apply pending Prisma migrations |
| `npx prisma generate` | `backend/` | Regenerate Prisma client |
| `npm run prisma:seed` | `backend/` | Seed DB (idempotent — safe to re-run) |
| `npm run seed:status` | `backend/` | Audit: verify all programs have full curriculum |

---

## Seed Details

The combined seed (`npm run prisma:seed`) creates everything in one pass:

- **7 institutions** (Dezai, KPGU, Parul, CHARUSAT, Navrachana, MSU Baroda, Stanford)
- **Users**: admin, student, 10 faculty members
- **12 programs** with IDs `course-1` through `course-12`
- **Full curriculum** — each program has:
  - 2 tracks: ROOTS (Foundation) and EDGE (Advanced)
  - 5 modules per track (10 total, ~28 lessons)
  - Real Google sample video URLs + markdown lesson content
  - Custom AI curriculum for course-1 ("Generative AI for Leaders")

Idempotent: re-running the seed only fills in missing data — it won't duplicate existing modules or lessons.

---

## Tech Stack

### Frontend
Next.js 16, TypeScript, Tailwind CSS v4, Shadcn UI, Zustand, Zod, React Hook Form, NextAuth v5

### Backend
NestJS 11, Prisma 6, PostgreSQL (Neon), JWT (jose)

---

## Roles

- **Student**: Browse catalog, enroll, watch lessons, take notes, bookmarks, XP
- **Faculty**: Course management (future)
- **Admin**: Platform administration (future)

---

## Architecture Rules

The project follows **Feature-Based Architecture**. See `ARCHITECTURE.md` for import boundaries:
- `app/` → `features/` → `shared/` (no reverse imports)
- Each feature has its own components, hooks, services, types, store
