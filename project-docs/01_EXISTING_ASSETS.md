# Existing Assets Inventory

All assets are sourced from `stitch_dezai_ai_edtech_platform/`. No local image binaries exist in the repository — prototypes reference **remote CDN URLs** and **Google Fonts**.

---

## Design System

### File: `academic_intelligence_system/DESIGN.md`

**Name:** Academic Intelligence System

**Brand personality:** Academic, Intelligent, Systematic — university-grade aesthetic (not playful consumer EdTech).

### Color Tokens (Material 3–inspired)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0057cd` | Core brand, CTAs |
| `primary-container` | `#0d6efd` | Filled buttons, badges |
| `secondary` | `#0051d5` | Hover states, nav active |
| `secondary-container` | `#316bf3` | Active nav pills |
| `tertiary` | `#a63b00` | Accent, flagged quiz items |
| `tertiary-container` | `#cf4b00` | Tertiary badges |
| `background` / `surface` | `#faf8ff` | Page canvas |
| `surface-container-low` | `#f2f3ff` | Subtle sections |
| `surface-container-lowest` | `#ffffff` | Cards |
| `on-surface` | `#191b24` | Primary text |
| `on-surface-variant` | `#424655` | Secondary text |
| `outline` | `#727787` | Borders, metadata |
| `outline-variant` | `#c2c6d8` | Light borders |
| `error` | `#ba1a1a` | Errors, timer warning |
| `error-container` | `#ffdad6` | Timer background |

Additional semantic colors referenced in prose: `#F8FAFC` (canvas alt), `#0F172A` (slate text), `#38BDF8` (sky blue progress), `#2563EB` (deep blue hover).

### Typography Scale

| Token | Family | Size | Weight | Use |
|-------|--------|------|--------|-----|
| `display-lg` | Geist | 48px | 700 | Hero headlines |
| `display-sm` | Geist | 36px | 700 | Page titles |
| `headline-lg` | Geist | 30px | 600 | Section headers |
| `headline-md` | Geist | 24px | 600 | Card titles |
| `headline-sm` | Geist | 20px | 600 | Subsections |
| `body-lg` | Inter | 18px | 400 | Lead paragraphs |
| `body-md` | Inter | 16px | 400 | Default body |
| `body-sm` | Inter | 14px | 400 | Captions |
| `label-md` | Geist | 14px | 500 | Buttons, nav |
| `label-sm` | Geist | 12px | 600 | Uppercase metadata |

### Spacing Tokens

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `base` | 8px |
| `sm` | 12px |
| `md` | 24px |
| `lg` | 40px |
| `xl` | 64px |
| `gutter` | 24px |
| `container-max` | 1440px |
| `margin-desktop` | 48px |
| `margin-mobile` | 16px |

### Border Radius

| Token | Value |
|-------|-------|
| `sm` | 0.25rem |
| `DEFAULT` | 0.5rem |
| `lg` | 0.75rem |
| `xl` | 1.5rem (cards/modals per design notes) |
| `full` | 9999px (pills/chips) |

### Elevation (Shadow Levels)

| Level | Shadow |
|-------|--------|
| Level 1 (cards) | `0 4px 6px -1px rgba(15,23,42,0.05), 0 2px 4px -2px rgba(15,23,42,0.03)` |
| Level 2 (hover) | `0 10px 15px -3px rgba(15,23,42,0.08)` |
| Level 3 (modals) | `backdrop-filter: blur(8px)` + 20% slate overlay |

### Layout Grid

- **Desktop:** 12 columns, 24px gutters, 48px margins
- **Tablet:** 8 columns, 20px gutters, 32px margins
- **Mobile:** 4 columns, 16px gutters, 16px margins

### Component Patterns (Design Spec)

- **Buttons:** Primary blue, 200ms hover to secondary, `scale(0.98)` on click
- **Cards:** White bg, no border, Level 1 shadow, `headline-sm` headers
- **Inputs:** 1px `#E2E8F0` border, primary focus ring, Inter text
- **Status chips:** 10% opacity background, full-opacity text
- **Transitions:** Framer Motion staggered entrance (y: 20→0, 20ms delay)

---

## External Font Assets

Loaded via Google Fonts in every HTML export:

| Font | Weights Used |
|------|--------------|
| [Geist](https://fonts.googleapis.com/css2?family=Geist) | 400–900 |
| [Inter](https://fonts.googleapis.com/css2?family=Inter) | 400–700 |
| [Material Symbols Outlined](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined) | FILL 0–1, wght 100–700 |

**Action required for production:** Self-host or use `next/font` to avoid CDN dependency and improve LCP.

---

## Logo Assets (Remote)

Canonical Dezai logo URL (used in multiple pages):

```
https://lh3.googleusercontent.com/aida-public/AB6AXuAOfcTW4wZHpCZQJ-5vaXrTE1_sqFbfe67UIZOIeLJygbRR72IzPJykW-tuPZ4C_9_XGdkOZHz13CRRyhRiZPzHKBEK4zUSuKno8B6oTrQUMe0DApQT7OaAg0jTiVHiOAb48HtxgqCerzmzM_ReW9dkx7kWTlokkTLjjaoD11Iti_bxitaCbJ05c43wCFZglGmK6g_-OUJWFwxQFlyFRkebQ_kAXQH0NbY1laana4a3krLKql56i9V4AziXpR6HDJy0bcvk5KrWJvuj
```

Alternate admin logo variant:

```
https://lh3.googleusercontent.com/aida-public/AB6AXuCxH3DrvKJdzdzB8dn77AkMgwq5VVjkvIMd1vcNTaxKJmjcFSQXh_jk1-HqNYAZToLjogNSME0B6opcEEf_uykZj2W_Kpx_igxa0EOrS6z7Dao44JGKQ3BTn5AzXIwowYQ4u2Ehzouwqw0tSWWArLQDnUUWYpKi5bqWwAuDt2OiDNKnz6HHJTitPXxnlZPQ_bpT_-5Ks9fmxTdkeN8nI4TfAJI2kFR9agTP1cCanbm_wi4cXOKBwGyA7VIer9ojbBH421XTGUhculx5
```

**Known defect:** `dezai_ai_micro_credentials_platform/code.html` header and footer contain raw URL strings instead of `<img>` elements.

**Recommendation:** Export SVG/PNG logo to `public/brand/` and replace all remote references.

---

## Image Assets by Page

All images are AI-generated placeholders on `lh3.googleusercontent.com`. Grouped by page export:

### Landing (`dezai_ai_micro_credentials_platform`)

| Asset | Context |
|-------|---------|
| Hero collaborative workspace | Main hero grid |
| AI dashboard tablet close-up | Hero secondary tile |
| AI Engineering category card | Course category |
| Commerce workspace | Category card |
| Design studio monitor | Category card |
| 3× testimonial headshots | Success stories |

### Course Details (`course_details_dezai_ai*`)

| Asset | Context |
|-------|---------|
| Boardroom neural network hologram | Course hero video thumbnail |
| Dr. Elena Rostova headshot | Instructor card |
| Certificate mockup (gold seal) | Tier 2 accreditation sidebar |
| 3× related course thumbnails | Carousel |
| User avatar | TopAppBar profile |

### Course Player (`course_player_dezai_ai_2`)

| Asset | Context |
|-------|---------|
| Neural network visualization | Video player poster |
| Student headshot | Profile avatar |

### Active Quiz (`active_quiz_dezai_ai`)

| Asset | Context |
|-------|---------|
| Proctoring dashboard visualization | Live proctoring feed panel |

### Student Profile (`student_profile_dezai_ai`)

| Asset | Context |
|-------|---------|
| John Doe portrait (large + nav) | Profile header |
| 2× certificate images | Certificates gallery |

### University Dashboard (`university_dashboard_dezai_ai`)

| Asset | Context |
|-------|---------|
| Dezai logo | Sidebar |
| Admin headshot | TopAppBar |
| 2× course thumbnail abstracts | Performance table |
| 3× instructor portraits | Instructor directory |

### Revenue Analytics (`revenue_analytics_dezai_admin`)

| Asset | Context |
|-------|---------|
| Dezai logo (header + footer) | Branding |
| Executive headshot | Admin profile |

**Total unique remote image references:** ~49 across 8 HTML files

---

## Page Export Files (Design Artifacts)

| Folder | File | Title | Lines (approx) |
|--------|------|-------|----------------|
| `dezai_ai_micro_credentials_platform` | `code.html` | University-Grade Micro-Credentials | 535 |
| `course_details_dezai_ai_updated_logo` | `code.html` | Generative AI for Leaders (logo) | 429 |
| `course_details_dezai_ai` | `code.html` | Generative AI for Leaders (text logo) | 434 |
| `course_player_dezai_ai_2` | `code.html` | Course Player | 366 |
| `active_quiz_dezai_ai` | `code.html` | Quiz Module | 358 |
| `student_profile_dezai_ai` | `code.html` | Student Profile | 362 |
| `university_dashboard_dezai_ai` | `code.html` | University Admin Dashboard | 508 |
| `revenue_analytics_dezai_admin` | `code.html` | Global Revenue Analytics | 478 |

Each export includes:
- Inline Tailwind config mirroring design tokens
- Custom CSS utility classes (`bento-card`, `card-elevation`, `glass-card`, etc.)
- Vanilla JS micro-interactions (timers, toasts, animations, sidebar toggle)

---

## Architecture Documentation Assets

### `project_architecture_database_schema.md`

- Complete Prisma schema (11 models, 3 enums)
- API endpoint list (6 routes)
- RBAC role definitions

### `dezai_ai_technical_implementation_plan.md`

- Planned Next.js 15 directory structure
- 4-phase implementation sequence (A–D)
- References Notification model as future addition

---

## Assets NOT Present

| Missing Asset | Impact |
|---------------|--------|
| Local logo files (SVG/PNG) | Brand consistency, offline dev |
| Favicon / app icons | PWA, browser tab |
| Certificate PDF template | Issuance flow |
| Email templates | Auth, enrollment, cert delivery |
| Video hosting integration | Course player is static image |
| Proctoring SDK assets | Quiz security is simulated |
| Razorpay checkout UI | Payment flow |
| Login / signup screen designs | Auth UX gap |
| Student dashboard design | Core student home missing |
| Certificate verification page | Public trust layer missing |
| Error / empty / loading states | Production UX |
| Dark mode complete audit | `dark:` classes partial |
| `package.json` / lockfile | No dependency manifest |
| Environment variable templates | No `.env.example` |

---

## Asset Migration Checklist (Pre-Production)

1. Download and optimize all `lh3.googleusercontent.com` images → `public/images/`
2. Add official Dezai logo SVG to `public/brand/dezai-logo.svg`
3. Configure `next/font` for Geist + Inter
4. Self-host Material Symbols or use `@mui/icons-material` / Lucide mapping
5. Create Tailwind preset from `DESIGN.md` tokens → `tailwind.preset.ts`
6. Archive Stitch HTML exports as reference; do not ship to production
