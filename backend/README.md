# Dezai Backend

> NestJS-based REST API for the **Dezai AI EdTech Platform** — powering learning, assessments, credentials, analytics, and enterprise academy management.

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Framework    | [NestJS](https://nestjs.com/) v11       |
| Language     | TypeScript 5                            |
| ORM          | [Prisma](https://www.prisma.io/) v6     |
| Database     | PostgreSQL                              |
| Cache        | In-memory (dev) / Redis (prod)          |
| Auth         | JWT via `jose`                          |
| Validation   | `class-validator` + `class-transformer` |
| Testing      | Jest + Supertest                        |

---

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts           # Root application module
│   ├── main.ts                 # Bootstrap & global config (CORS, pipes, filters)
│   │
│   ├── common/                 # Shared cross-cutting concerns
│   │   ├── constants/          # App-wide constants
│   │   ├── decorators/         # Custom NestJS decorators
│   │   ├── filters/            # Exception filters (HttpExceptionFilter)
│   │   ├── guards/             # Auth & role guards
│   │   ├── interceptors/       # Response / logging interceptors
│   │   ├── middleware/         # HTTP middleware
│   │   └── utils/              # Helper utilities
│   │
│   ├── config/                 # Configuration modules (@nestjs/config)
│   ├── database/               # Prisma service & DB connection
│   ├── jobs/                   # Background & scheduled tasks
│   ├── shared/                 # Shared services / DTOs used across modules
│   │
│   └── modules/                # Feature modules
│       ├── academy/            # Enterprise academy (orgs, departments, employees)
│       ├── achievements/       # Badges & achievement tracking
│       ├── admin/              # Admin management
│       ├── ai/                 # AI-powered features
│       ├── analytics/          # Usage & progress analytics
│       ├── assessments/        # Quizzes & assessments engine
│       ├── audit/              # Audit trail / activity logs
│       ├── auth/               # Authentication & session management
│       ├── certificates/       # Certificate generation & verification
│       ├── courses/            # Course catalogue & content
│       ├── credentials/        # User credentials / skill badges
│       ├── enterprise-credentials/ # Enterprise-issued credentials
│       ├── institutions/       # Educational institution management
│       ├── leaderboards/       # Gamification leaderboards
│       ├── learning/           # Learning paths & progress tracking
│       ├── notifications/      # In-app & push notifications
│       ├── programs/           # Program management
│       ├── projects/           # Project-based learning
│       ├── quizzes/            # Quiz builder & runner
│       ├── universities/       # University management
│       ├── uploads/            # File upload handling
│       └── users/              # User profiles & management
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Prisma migration history
│   ├── scripts/                # Utility DB scripts
│   └── seeders/                # Seed data (seed.ts, check-status.ts)
│
├── scripts/                    # Dev / ops helper scripts
├── tests/                      # Integration & e2e test suites
├── .env.example                # Environment variable template
├── jest.config.ts              # Jest configuration
├── nest-cli.json               # NestJS CLI config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** running locally (or connection string to a remote DB)
- **Redis** *(optional — only required when `CACHE_STORE=redis`)*

### 1 — Install dependencies

```bash
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dezai
PORT=3001
AUTH_SECRET=your-super-secret-key

# Cache layer
CACHE_STORE=memory        # use 'redis' in production
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=
```

### 3 — Set up the database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

### 4 — Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001/api`.

---

## Available Scripts

| Command               | Description                                 |
|-----------------------|---------------------------------------------|
| `npm run dev`         | Start dev server with hot-reload (watch)    |
| `npm run build`       | Compile TypeScript to `dist/`               |
| `npm run start`       | Start compiled app (no watch)               |
| `npm run start:prod`  | Run production build (`node dist/main`)     |
| `npm run lint`        | Lint `src/` and `test/` with ESLint         |
| `npm run test`        | Run unit tests with Jest                    |
| `npm run test:watch`  | Run Jest in watch mode                      |
| `npm run test:cov`    | Run tests with coverage report              |
| `npm run prisma:generate` | Re-generate Prisma client               |
| `npm run prisma:migrate`  | Apply pending migrations                |
| `npm run prisma:seed`     | Run database seeders                    |
| `npm run seed:status`     | Check seeder status                     |

---

## API Overview

All routes are prefixed with `/api`.

| Module               | Base Route                   |
|----------------------|------------------------------|
| Auth                 | `/api/auth`                  |
| Users                | `/api/users`                 |
| Courses              | `/api/courses`               |
| Programs             | `/api/programs`              |
| Assessments          | `/api/assessments`           |
| Quizzes              | `/api/quizzes`               |
| Learning             | `/api/learning`              |
| Academy (Enterprise) | `/api/academy`               |
| Credentials          | `/api/credentials`           |
| Certificates         | `/api/certificates`          |
| Analytics            | `/api/analytics`             |
| Leaderboards         | `/api/leaderboards`          |
| Achievements         | `/api/achievements`          |
| Notifications        | `/api/notifications`         |
| Admin                | `/api/admin`                 |
| Uploads              | `/api/uploads`               |

---

## Environment Variables Reference

| Variable          | Required | Default    | Description                              |
|-------------------|----------|------------|------------------------------------------|
| `DATABASE_URL`    | ✅        | —          | PostgreSQL connection string             |
| `PORT`            | ❌        | `3001`     | HTTP port the server listens on          |
| `AUTH_SECRET`     | ✅        | —          | Secret for JWT signing/verification      |
| `CACHE_STORE`     | ❌        | `memory`   | Cache driver: `memory` or `redis`        |
| `REDIS_HOST`      | ❌        | `localhost`| Redis host (when `CACHE_STORE=redis`)    |
| `REDIS_PORT`      | ❌        | `6379`     | Redis port                               |
| `REDIS_PASSWORD`  | ❌        | —          | Redis password (if auth enabled)         |

---

## Contributing

1. Branch off `main` using the convention `feat/<scope>` or `fix/<scope>`.
2. Keep modules self-contained — avoid cross-module imports outside of `shared/`.
3. All new endpoints must have a corresponding DTO with validation decorators.
4. Run `npm run lint` and `npm run test` before opening a PR.
