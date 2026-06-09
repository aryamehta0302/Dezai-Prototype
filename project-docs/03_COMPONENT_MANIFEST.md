# Component Manifest

Components are extracted from Stitch HTML exports and the Academic Intelligence design system. None exist as reusable React modules yet — this manifest defines the **component library to build** during implementation.

Naming convention for implementation: PascalCase React components under `components/`.

---

## Layout & Shell Components

| Component | Description | Used On | Props / Variants |
|-----------|-------------|---------|------------------|
| `TopAppBar` | Sticky header with logo, nav, search, notifications, avatar | All pages except quiz | `variant: default \| quiz-focus \| admin` |
| `NavigationDrawer` | Fixed left sidebar (320px), logo, nav items, user footer | University dashboard | `items[]`, `activeItem`, `collapsible` |
| `Footer` | Brand, copyright, legal links | All pages | `variant: minimal \| full` |
| `MobileBottomNav` | Fixed bottom tab bar | Course player | `tabs[]`, `activeTab` |
| `PageContainer` | `max-w-container-max` centered wrapper | All main content | `padding: mobile \| desktop` |
| `MarketingHeader` | Fixed top nav with Sign In CTA | Landing page | — |
| `QuizFocusHeader` | Minimal header: brand, module title, timer, fullscreen | Active quiz | No main menu |
| `GlobalProgressBar` | Thin 1px progress strip below header | Active quiz | `percent` |
| `EnrollmentFAB` | Fixed mobile cart button | Course details | `price`, `onEnroll` |

---

## Navigation Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `NavLink` | Label-md nav item with hover/active states | TopAppBar |
| `SidebarNavItem` | Icon + label, rounded-xl, active pill style | University drawer |
| `AdminTopNav` | Horizontal nav: Dashboard, Revenue, Partners, Settings | Dezai admin |
| `BreadcrumbDivider` | Vertical pipe between brand and context title | Quiz, player |
| `CourseModuleSidebar` | Collapsible module/lesson tree with completion icons | Course player |
| `QuestionNavigator` | 5-column grid of question number buttons | Active quiz |
| `SettingsNavList` | Chevron-right linked settings rows | Student profile |
| `FooterLinkGroup` | Partner Directory, Privacy, Standards, Support | Footer |

---

## Data Display — Cards & Stats

| Component | Description | Used On |
|-----------|-------------|---------|
| `StatCard` | Icon, label, large number, trend indicator | All dashboards |
| `BentoCard` | White card, Level 1 shadow, hover lift | University dashboard |
| `CardElevation` | Revenue admin card with hover shadow | Dezai admin |
| `FinancialSummaryCard` | 4-col metric: icon, label, value, trend | Revenue analytics |
| `AcademicStatCard` | Border-top accent, display number | Student profile |
| `GlassCard` | Backdrop blur translucent card | Landing, course details |
| `InfoCallout` | Icon + insight text in tinted container | Revenue analytics |
| `InstitutionalStatusCard` | Network latency, system health rows | Active quiz |

### StatCard Variants Observed

| Metric | Page |
|--------|------|
| Active Students (14,802) | University dashboard |
| Course Completions (8,291) | University dashboard |
| Net Revenue Share ($1.24M) | University dashboard |
| Avg. Quiz Score (88.4%) | University dashboard |
| Gross Revenue ($2,840,922) | Revenue analytics |
| Platform Fee 30% ($852,276) | Revenue analytics |
| University Payouts ($1,988,646) | Revenue analytics |
| Avg. Order Value ($142.50) | Revenue analytics |
| Courses Completed (24) | Student profile |
| Total Credits (112/140) | Student profile |
| Current GPA (3.92) | Student profile |

---

## Data Display — Tables

| Component | Description | Used On |
|-----------|-------------|---------|
| `DataTable` | Zebra-striped rows, hover highlight | University, revenue |
| `CoursePerformanceTable` | Course thumb, name, enrolled, rating, sparkline | University dashboard |
| `CertificationsTable` | Student, title, date, status chip, view action | University dashboard |
| `TransactionLedger` | Search, filter, paginated payment rows | Revenue analytics |
| `TablePagination` | Previous/Next + page numbers | Transaction ledger |
| `StatusChip` | Pill badge: Success, Pending, Failed, Verified | Tables |
| `AvatarCell` | Initials circle + name | Transaction ledger |
| `StarRating` | Filled star + numeric rating | Course performance |

---

## Data Display — Charts & Visualizations

| Component | Description | Used On |
|-----------|-------------|---------|
| `BarChart` | Custom CSS bar chart, university revenue | Revenue analytics |
| `ProgressBar` | Horizontal fill bar | Player, quiz, profile GPA |
| `AllocationBreakdown` | Labeled progress bars (45/30/15/10%) | Revenue analytics |
| `SparklineTrend` | Mini bar chart in table cell | University courses |
| `CircularProgress` | Design spec (not in HTML) | Student dashboard (planned) |

**Implementation note:** Replace CSS mock charts with Recharts or Chart.js for live data.

---

## Course & Learning Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `CourseHero` | Badge, title, description, CTAs, video thumbnail | Course details |
| `CourseCard` | Image, category, title, duration, price | Landing, related courses |
| `CategoryCard` | Large image card with discipline label | Landing |
| `InstructorCard` | Photo, name, title, bio | Course details |
| `UniversityPartnerCard` | Icon, name, accreditation text | Course details |
| `SyllabusAccordion` | Numbered modules, expandable lessons | Course details |
| `LessonRow` | Icon (play/article), title, duration | Syllabus |
| `CertificateTierCard` | Sticky sidebar: tier info, benefits, mockup | Course details |
| `VideoPlayer` | Poster, play overlay, control bar, scrubber | Course player |
| `LessonContent` | Module label, title, prose article, blockquote | Course player |
| `PersonalNotesPanel` | Textarea, autosave label, view all link | Course player |
| `UpcomingAssignmentCard` | Assignment due CTA | Course player |
| `MarkCompleteButton` | Primary CTA with completion toast + XP | Course player |
| `CourseProgressPill` | Inline progress bar + percentage | Player header |
| `RelatedCoursesCarousel` | 3-col grid with prev/next buttons | Course details |
| `EnrollmentCTA` | Price button + view curriculum secondary | Course details |

---

## Quiz & Assessment Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `QuizTimer` | Countdown with warning state at 5 min | Active quiz |
| `QuestionCard` | Number, points badge, question text | Active quiz |
| `RadioOption` | Custom radio with peer-checked styling | Active quiz |
| `QuizNavigationBar` | Previous, Flag, Next buttons | Active quiz |
| `QuestionGridButton` | Numbered cell: answered/current/flagged | Active quiz |
| `QuestionLegend` | Color key for grid states | Active quiz |
| `ProctoringFeed` | Webcam visualization with live indicator | Active quiz |
| `SecurityToast` | Tab-switch warning overlay | Active quiz |
| `FullscreenToggle` | Enter/exit fullscreen | Active quiz |

### Quiz Client Behaviors (to port to React)

- Countdown timer with pulse at ≤5 minutes
- `window.blur` → security toast
- Context menu disabled
- Fullscreen API toggle
- Question flag state (tertiary color)

---

## Profile & Certificate Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `ProfileHeaderCard` | Photo, verified badge, name, university, tags | Student profile |
| `ProfileStatBento` | 3-column academic stats | Student profile |
| `CertificateGalleryCard` | Thumbnail, title, grade, view/share | Student profile |
| `ActivityTimeline` | Vertical timeline with icon nodes | Student profile |
| `AccountSettingsPanel` | Linked settings rows + logout | Student profile |
| `EditProfileButton` | Primary with edit icon | Student profile |
| `VerifiedBadge` | Primary container check icon overlay | Profile photo |

---

## Marketing & Landing Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `HeroSection` | Badge, headline, CTAs, stats counter | Landing |
| `HeroVisualGrid` | Asymmetric image grid with float animation | Landing |
| `PartnerLogoStrip` | Grayscale university name marquee | Landing |
| `HowItWorksStep` | Icon box, title, description | Landing |
| `CertificationTierList` | Numbered tier explanations | Landing |
| `TierVisualStack` | Layered floating icon cards | Landing |
| `TestimonialCard` | Quote, avatar, name, role | Landing |
| `FAQAccordion` | Expandable Q&A | Landing, course details |
| `FinalCTASection` | Primary bg, dual CTA buttons | Landing |
| `AnimatedCounter` | IntersectionObserver number animation | Landing stats |
| `SocialIconRow` | public, mail, forum icons | Landing footer |

---

## Admin — University Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `DashboardIntro` | Welcome message, date filter, export | University dashboard |
| `DateRangeButton` | "Last 30 Days" calendar button | Dashboards |
| `ExportReportButton` | Download icon primary/secondary | Dashboards |
| `SearchInput` | Rounded pill search with icon | University header |
| `NotificationBell` | Bell with unread dot | All admin/student headers |
| `InstructorListItem` | Avatar, name, role, chevron | University dashboard |
| `ManageDirectoryButton` | Dashed border add/manage CTA | Instructor section |
| `TierFilterChips` | Tier 2 / Tier 3 filter pills | Certifications section |
| `UserSidebarFooter` | Avatar, name, tier label, version | University drawer |

---

## Admin — Dezai Revenue Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `AdminPageHeader` | "ADMINISTRATIVE PORTAL" label + title | Revenue page |
| `RevenueChartCard` | Bar chart + top performer callout | Revenue analytics |
| `AssetAllocationCard` | Multi-segment progress breakdown | Revenue analytics |
| `LedgerSearchFilter` | Search input + filter button | Transaction ledger |
| `TransactionRow` | Student, course, university, date, amount, status | Ledger table |

---

## Form & Input Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `SearchField` | Icon prefix, transparent bg, focus ring | Multiple |
| `TextInput` | Border, rounded-lg, Inter font | Ledger search |
| `Textarea` | Notes panel, resize-none, focus ring | Course player |
| `FilterButton` | Icon button with border | Ledger |
| `DateFilterButton` | Calendar icon + label | Dashboards |

**Design spec additions (not in HTML):** Select, Checkbox, Switch, FileUpload — needed for admin CRUD.

---

## Feedback & Overlay Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `Toast` | Fixed bottom notification | Quiz security, player XP |
| `CompletionToast` | Trophy icon + "Lesson complete! +50 XP" | Course player |
| `Modal` | Level 3 blur backdrop (design spec) | Not in HTML |
| `LoadingSkeleton` | Not designed | Needed for data fetch |
| `EmptyState` | Not designed | Needed for lists |

---

## Badge & Chip Components

| Component | Description | Used On |
|-----------|-------------|---------|
| `TierBadge` | "Professional Certificate", "Tier 2 Accredited" | Course details |
| `CategoryBadge` | Uppercase discipline label on cards | Landing, related |
| `PointsBadge` | "4 Points" on quiz questions | Active quiz |
| `StatusChip` | Success / Pending / Failed / Verified | Tables |
| `TrendBadge` | +/- percentage with arrow icon | Stat cards |
| `ProfileTag` | Rounded pill: year, semester, major | Student profile |
| `CountBadge` | "12 TOTAL" instructor count | University dashboard |

---

## Button Components

| Component | Variants | Used On |
|-----------|----------|---------|
| `Button` | primary, secondary, outline, ghost, destructive | All pages |
| `IconButton` | circular, rounded-full | Search, notifications, menu |
| `FAB` | Fixed position, shadow-lg | Course details mobile |
| `CarouselButton` | Chevron prev/next circle | Related courses |
| `PaginationButton` | Numbered, active state | Ledger |
| `CTAButton` | Large xl padding, shadow | Hero, enrollment |

---

## Shared / Cross-Cutting Components (Planned per Architecture)

From `dezai_ai_technical_implementation_plan.md` — **not yet in HTML**:

| Component | Path | Purpose |
|-----------|------|---------|
| Shadcn `Button`, `Card`, `Input`, etc. | `components/ui/` | Base primitives |
| `StatsCards` | `components/dashboard/` | Reusable metric grid |
| `Charts` | `components/dashboard/` | Analytics visualizations |
| `QuizEngine` | `components/quiz/` | Composed quiz flow |
| `TopAppBar` | `components/shared/` | Unified header |
| `NavigationDrawer` | `components/shared/` | Sidebar shell |
| `Footer` | `components/shared/` | Site footer |

---

## Design Token Utilities (Tailwind Preset)

Each HTML file duplicates this config — extract to shared preset:

| Category | Keys |
|----------|------|
| Colors | 40+ semantic Material tokens |
| fontFamily | 12 typography role aliases |
| fontSize | 12 size+lineHeight+weight tuples |
| spacing | xs through xl + layout margins |
| borderRadius | sm, DEFAULT, lg, xl, full |

### Custom CSS Classes to Port

| Class | Behavior |
|-------|----------|
| `fade-in-staggered` | Children animate in sequence |
| `bento-card` / `card-elevation` | Card shadow + hover |
| `glass-card` / `glass-panel` | Backdrop blur panels |
| `custom-scrollbar` | 4px thin scrollbar |
| `animate-float` | 6s vertical float keyframes |
| `shadow-level-1` / `shadow-level-2` | Elevation tokens |
| `active-nav` | Admin nav active state |
| `no-select` | user-select: none (quiz) |
| `video-gradient-overlay` | Player control gradient |

---

## Component Count Summary

| Category | Count |
|----------|-------|
| Layout & Shell | 9 |
| Navigation | 8 |
| Cards & Stats | 11 |
| Tables | 8 |
| Charts | 5 |
| Course & Learning | 16 |
| Quiz & Assessment | 9 |
| Profile & Certificate | 7 |
| Marketing & Landing | 11 |
| University Admin | 9 |
| Dezai Revenue Admin | 5 |
| Forms & Inputs | 5 |
| Feedback & Overlays | 5 |
| Badges & Chips | 7 |
| Buttons | 6 |
| Planned (architecture) | 6 |
| **Total unique components** | **~127** |

---

## Component Implementation Priority

### P0 — MVP Blockers
`TopAppBar`, `Footer`, `PageContainer`, `Button`, `StatCard`, `DataTable`, `CourseCard`, `CourseHero`, `SyllabusAccordion`, `VideoPlayer`, `EnrollmentCTA`, `StatusChip`, `SearchField`

### P1 — Core Learning
`NavigationDrawer`, `CourseModuleSidebar`, `PersonalNotesPanel`, `MarkCompleteButton`, `QuizTimer`, `QuestionCard`, `RadioOption`, `QuestionNavigator`, `ProfileHeaderCard`, `CertificateGalleryCard`

### P2 — Admin & Analytics
`BarChart`, `TransactionLedger`, `InstructorListItem`, `ExportReportButton`, `FinancialSummaryCard`, `ProctoringFeed`, `SecurityToast`

### P3 — Marketing Polish
`HeroSection`, `TestimonialCard`, `AnimatedCounter`, `FAQAccordion`, `PartnerLogoStrip`, `EnrollmentFAB`
