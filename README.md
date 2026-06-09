# 🌟 Dezai AI — Micro-Credentials & Proctored EdTech SaaS

Dezai AI is a modern, university-grade EdTech SaaS platform designed for accredited digital micro-credentials, live-proctored online assessments, and multi-tier certification verification. 

This repository bridges the design prototype specifications with a fully responsive React and Next.js implementation.

---

## 📂 Repository Structure

The project is split into different folders reflecting various phases of development:

```text
Dezai-Prototype/
├── frontend/                          # Next.js 16 Application (Primary runnable codebase)
│   ├── src/
│   │   ├── app/                       # Routing layer (thin wrapper)
│   │   ├── features/                  # Domain-specific business logic & components
│   │   ├── shared/                    # Reusable UI primitives, helpers & hooks
│   │   └── lib/                       # Global store wrappers, mock data & providers
│   ├── package.json                   # Dependency tree & NPM scripts
│   └── tsconfig.json                  # TypeScript config
│
├── backend/                           # API & Microservices Scaffold (Future extension)
│   └── src/
│       ├── modules/                   # Module routing, services, controllers
│       └── shared/                    # Shared database models, middleware, config
│
├── project-docs/                      # Comprehensive analyses and planning docs
│   ├── 00_PROJECT_OVERVIEW.md         # Product vision & repository audit
│   ├── 01_EXISTING_ASSETS.md          # Design system, variables, logo specs
│   ├── 02_ROUTE_MANIFEST.md           # Page routing manifest
│   ├── 03_COMPONENT_MANIFEST.md       # Component checklist & UX specifications
│   ├── 04_GAP_ANALYSIS.md             # Integration checklists (auth, proctoring, payment)
│   └── 05_IMPLEMENTATION_PLAN.md      # Phased development roadmap
│
└── stitch_dezai_ai_edtech_platform/   # Original Google Stitch static HTML exports
```

---

## 🛠️ Technology Stack (Frontend)

The runnable client app is located in the `/frontend` directory and utilizes:

| Layer | Technology Used | Description |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Serving layout optimizations and routing. |
| **Language** | **TypeScript** | For strict typing, readability, and safe refactoring. |
| **Styling** | **Tailwind CSS v4 + Shadcn UI** | High-fidelity UI styling with harmonious HSL dark/light modes. |
| **State Management** | **Zustand** | Multi-store architecture for client states (Auth, Quiz, Enrollment, etc.). |
| **Data Validation** | **Zod + React Hook Form** | Rigid validation schemas for auth and quiz submissions. |
| **Utilities** | **Recharts, jsPDF, qrcode.react** | Dashboard data-visualizations, certificate downloads, and QR codes. |

---

## 🧑‍💻 Personas & Role-Based Access Control (RBAC)

Dezai AI targets three separate user roles with specialized dashboards:

1. **Student Dashboard**: Discover courses in the catalog, enroll, access the lesson player, write notes, undergo webcam-proctored quizzes, check notifications, and download/share certificates.
2. **University Admin**: Manage courses, edit syllabus content, monitor instructor registries, audit certification tiers, and view institutional analytics.
3. **Dezai Global Admin**: Track system-wide revenue, manage partner universities, audit transactions, and adjust system configs.

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your machine:
* **Node.js** (v18.x or v20.x or higher)
* **npm** or **yarn** / **pnpm** / **bun**

### 🔧 Installation

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) on your browser to view the application.

---

## 📦 Build & Deployment

To build the project for a production environment:

1. Build the production application bundle:
   ```bash
   npm run build
   ```

2. Start the optimized Next.js server:
   ```bash
   npm run start
   ```

3. (Optional) Run the ESLint linter to verify code boundaries and rules:
   ```bash
   npm run lint
   ```

---

## 📐 Architecture Guidelines

Dezai AI follows a strict **Feature-Based Architecture**. All custom components, hooks, services, schemas, and types must be placed inside their respective domain directory within `frontend/src/features/`.

Refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) file at the root of the project to understand the import boundaries and folder standards before adding new features.
