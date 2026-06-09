# Dezai AI | Production SaaS Architecture

## 1. Directory Structure (Next.js 15 App Router)
```text
/
├── app/
│   ├── (auth)/                 # Authentication Routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (student)/              # Student Portal (RBAC: STUDENT)
│   │   ├── dashboard/page.tsx
│   │   └── courses/[slug]/...
│   ├── (admin)/                # Dezai Admin (RBAC: DEZAI_ADMIN)
│   │   ├── admin/dashboard/page.tsx
│   │   ├── admin/universities/page.tsx
│   │   └── admin/revenue/page.tsx
│   ├── (university)/           # University Admin (RBAC: UNIVERSITY_ADMIN)
│   │   ├── university/dashboard/page.tsx
│   │   └── university/courses/page.tsx
│   ├── api/                    # API Layer
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── payments/razorpay/route.ts
│   │   ├── quiz/submit/route.ts
│   │   └── certificates/generate/route.ts
│   └── verify/[id]/page.tsx    # Public Verification
├── components/
│   ├── ui/                     # Shadcn / Base Components
│   ├── shared/                 # TopAppBar, NavigationDrawer, Footer
│   ├── dashboard/              # Stats cards, Charts
│   └── quiz/                   # Quiz Engine components
├── lib/
│   ├── prisma.ts               # Database Client
│   ├── razorpay.ts             # Payment Logic
│   └── auth-options.ts         # NextAuth Config
├── prisma/
│   └── schema.prisma           # Complete Schema
└── store/                      # Zustand State Management
```

## 2. Expanded Database Schema
The schema (already in {{DATA:DOCUMENT:DOCUMENT_7}}) is now fully utilized for:
- **RBAC**: `UserRole` enum controls access to `(admin)`, `(university)`, and `(student)` route groups.
- **Quiz Engine**: `Quiz`, `Question`, and `QuizAttempt` models handle the examination flow.
- **Revenue Sharing**: `University.revenueShare` (default 0.7) and `Payment` records drive the `Revenue Analytics` module.
- **Notification Center**: `Notification` model (to be added) for real-time alerts.

## 3. Implementation Plan
- **Phase A**: Build the **University Admin Panel** (Dashboard & Course Oversight).
- **Phase B**: Build the **Admin Management** suite (University Registry & Global Revenue).
- **Phase C**: Implement the **Quiz Engine** & **Certificate Verification** screens.
- **Phase D**: Integrate **Razorpay** checkout flows within the Course Details.