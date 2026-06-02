# Implementation Plan

## Phase 0: Foundation & Setup

### 0.1 Project Scaffolding
- [ ] Initialize Next.js project (App Router, TypeScript)
- [ ] Set up ESLint, Prettier, Husky, lint-staged
- [ ] Configure path aliases (`@/components`, `@/lib`, etc.)
- [ ] Set up Tailwind CSS v4 with design tokens (colors, spacing, typography via CSS variables)
- [ ] Install and configure shadcn/ui (button, card, dialog, form, table, dropdown, etc.) + custom theme
- [ ] Set up Framer Motion / Motion for page transitions, staggered list animations, micro-interactions
- [ ] Configure Tailwind CSS animations (fade, slide, scale) + `tailwindcss-animate` for reusable keyframes
- [ ] Define shadow design tokens (subtle, medium, heavy) with `drop-shadow` utilities
- [ ] Create base layout components (Shell, Sidebar, Topbar, Mobile nav) with smooth transitions
- [ ] Implement global page transition wrapper using Framer Motion's `AnimatePresence`

### 0.2 Database & Storage
- [ ] **Database**: PostgreSQL self-hosted (Docker container on server or VPS) — handles all application data (users, questions, exams, flashcards, courses, subscriptions, articles, progress, certificates)
- [ ] **ORM**: Drizzle — type-safe schema, migrations, and queries
- [ ] **File Storage**: Cloudflare R2 for images, PDFs (certificates, study materials) + Cloudflare Stream for video hosting/transcoding
- [ ] Set up Drizzle schema (users, questions, exams, flashcards, courses, subscriptions, articles, progress, certificates)
- [ ] Run `drizzle-kit generate` + `drizzle-kit migrate` for initial migrations
- [ ] Create seed scripts for test data
- [ ] Set up automated PostgreSQL backups (pg_dump cron job)

### 0.3 NestJS Backend — Project Setup
- [ ] Initialize NestJS project with Fastify adapter + SWC compiler
- [ ] Set up monorepo structure: `apps/web` (Next.js), `apps/api` (NestJS) + `packages/shared` (types, DTOs)
- [ ] Configure Drizzle shared package
- [ ] Set up ConfigModule (`@nestjs/config`) with env validation
- [ ] Set up global exception filter, validation pipe, logger (Pino)
- [ ] Set up Swagger (`@nestjs/swagger`) with bearer auth
- [ ] Set up `@nestjs/throttler` (rate limiting)
- [ ] Set up `@nestjs/schedule` (cron jobs: subscription renewals, backups)

### 0.4 Authentication (NestJS AuthModule)

**Roles:**
| Role | Access |
|------|--------|
| **Student** | Study, exams, flashcards, videos, courses, certificates, personal stats |
| **Admin** | All student + manage questions, courses, videos, users, articles, subscriptions, landing page, view analytics |
| **Superadmin** | All admin + platform-level config, admin user management, billing oversight, system settings |

- [ ] Install `@nestjs/passport` + `@nestjs/jwt` + `passport` + `bcrypt`
- [ ] Build LocalStrategy (email/password), JwtStrategy, JwtRefreshStrategy, GoogleStrategy
- [ ] Build `@CurrentUser()` decorator, `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator
- [ ] Build auth endpoints: register, login, refresh, logout, me, google OAuth callback
- [ ] Build email verification flow (send via Resend, verify endpoint)
- [ ] Build login/register pages in Next.js
- [ ] Build axios interceptor for auto token refresh on 401
- [ ] Build protected route middleware + auth context provider in Next.js

### 0.5 Internationalization (i18n) — Frontend

**Approach**: DB-backed translation management with file-based runtime delivery
- All translation strings stored in a `translations` table (key, locale, value) — source of truth
- Admin panel has a translation management UI to view/add/edit all keys per locale
- On save, translations are exported to JSON files (`messages/{locale}.json`) and committed via admin action or CI
- `next-intl` reads from the JSON files at runtime (no DB query per request)
- When adding a new language, AI auto-translate all existing keys, save to DB, then export to JSON

- [ ] Set up `translations` table in Drizzle: `(key, locale, value, namespace, updatedAt)`
- [ ] Build admin panel translation management UI (list keys, filter by namespace/locale, edit inline, search)
- [ ] Build export script: DB → `messages/{locale}.json` files
- [ ] Build import script: JSON files → DB (for initial seed)
- [ ] Set up next-intl with JSON files from `messages/` folder
- [ ] Configure initial locales: `en` (English), `es` (Spanish)
- [ ] Use `next-intl` routing for multilanguage SEO (`/en/...`, `/es/...`)
- [ ] Implement language switcher UI component (dropdown in header)
- [ ] Handle SEO hreflang tags for all active locales
- [ ] Future languages: Portuguese (pt), French (fr), German (de) — added via admin panel + AI translation

### 0.6 Backend Architecture

**Approach**: Monorepo — Next.js (frontend-only) + NestJS (separate backend API)

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | Next.js (App Router, RSC) | UI, SSR/SSG for SEO, routing, i18n — deployed on Vercel |
| **Backend** | NestJS (Fastify adapter) | All API logic, business rules, auth, webhooks — deployed on Railway / Render / AWS |
| **ORM** | Drizzle | Type-safe schema, migrations, query builder (Drizzle ORM with Postgres driver) |
| **Validation** | `class-validator` + `class-transformer` | DTO validation via NestJS pipes |
| **Auth** | `@nestjs/passport` + JWT | Access/refresh tokens, OAuth, role-based guards (`@Roles()` decorator) |
| **Payments** | Stripe SDK + `@nestjs/stripe` or custom module | Subscriptions, checkout, auto-renewal, refunds, webhooks |
| **Background Jobs** | `@nestjs/bull` + Valkey | Certificate generation, email sending, analytics aggregation, migration tasks |
| **Real-time** | `@nestjs/websockets` (Socket.io Gateway) | Live exam sessions, collaborative features, notifications |
| **File Uploads** | Presigned URLs via Cloudflare R2 SDK | Secure client-to-R2 upload for images, PDFs, video files |
| **Video** | Cloudflare Stream API | Upload, transcoding, adaptive-bitrate streaming, player |
| **Email** | Resend SDK via `@nestjs/email` or custom service | Transactional emails (welcome, receipts, certificates, reminders) |
| **AI/LLM** | OpenAI SDK (streaming via NestJS SSE) | AI explanations, tutor chat, flashcard generation |
| **Queue/Cache** | Valkey (self-hosted) | Caching (DB queries, session store), Bull queue backend, rate limiting |
| **CMS/Editor** | TipTap (frontend) + NestJS REST API | Blog articles, question explanations, course content |
| **API Docs** | Swagger (`@nestjs/swagger`) | Auto-generated OpenAPI docs for frontend team |

### 0.7 Deployment Infrastructure
- [ ] Set up Vercel project (or Cloudflare Pages)
- [ ] Configure staging and production environments
- [ ] Set up GitHub Actions CI: lint → typecheck → test → build
- [ ] Configure custom domain + Cloudflare CDN
- [ ] Set up Sentry for error tracking
- [ ] Set up automated DB backups

---

## Phase 1: Data Migration (Firebase → PostgreSQL)

### 1.1 Audit & Mapping
- [ ] Document all Firebase collections and document structures
- [ ] Map each collection to PostgreSQL tables
- [ ] Identify data transformations needed (Firebase timestamps, nested objects, arrays)

### 1.2 Migration Script
- [ ] Write Node.js ETL script that reads from Firebase Admin SDK and writes to Postgres via Drizzle
- [ ] Users migration (auth UID mapping, profile data)
- [ ] Questions bank migration (questions, options, explanations, specialty/topic relations)
- [ ] User progress & statistics migration
- [ ] Exam history migration
- [ ] Flashcards migration (cards, review schedule if exists)
- [ ] Video classes migration (metadata, module structure, progress)
- [ ] Subscriptions migration (plans, user subscriptions, Stripe IDs)
- [ ] Run migration in staging first, verify data integrity
- [ ] Run production migration during maintenance window

---

## Phase 2: Core Features (Replace Existing Firebase Functionality)

### 2.1 Question Bank
- [ ] Build database schema: `Specialty`, `Topic`, `Subtopic`, `Question`, `Option`, `Explanation`
- [ ] Build question filtering UI (specialty → topic → subtopic, question count, time limit)
- [ ] Build Study Mode UI (one question at a time, show answer + explanation immediately)
- [ ] Build Exam Mode UI (timed, all questions shown sequentially or paginated, results at end)
- [ ] Build exam timer component
- [ ] Build answer explanation panel (rich text supporting images, references)
- [ ] Build question navigation (flag for review, go back, skip)
- [ ] Build exam results screen (score, time taken, per-topic breakdown)
- [ ] Build performance statistics dashboard (accuracy by specialty/topic, trends over time)
- [ ] Build exam history page with ability to re-review past exams

### 2.2 Flashcards
- [ ] Build flashcard CRUD (create/edit by specialty/topic)
- [ ] Build flashcard review UI (front/back flip, rate difficulty)
- [ ] Implement spaced repetition algorithm (SM-2 or FSRS)
- [ ] Build review queue and scheduling system
- [ ] Build flashcard statistics (cards due, mastered, etc.)

### 2.3 Video Classes
- [ ] Build video module structure (courses → modules → videos)
- [ ] Integrate video player (Mux, Cloudflare Stream, or YouTube Embedded)
- [ ] Build video progress tracking (mark watched, resume position)
- [ ] Build student progress dashboard per module
- [ ] Build "Continue Watching" section on home dashboard

### 2.4 Calendar
- [ ] Build calendar view component
- [ ] Allow admin to upload PDF study schedules
- [ ] Allow students to view/download attached PDFs
- [ ] Allow students to add personal study events

### 2.5 Subscriptions & Payments
- [ ] Build Stripe product/price sync (monthly, quarterly, annual)
- [ ] Build subscription plan comparison UI (with show/hide per plan toggle in admin)
- [ ] Build checkout flow (Stripe Checkout or embedded Elements)
- [ ] Build subscription management page (cancel, change plan, view history)
- [ ] Implement Stripe webhooks (checkout completed, subscription renewal, cancellation)
- [ ] Implement auto-renewal logic
- [ ] Build subscription-gated content middleware

---

## Phase 3: New Features

### 3.1 Professional Landing Page
- [ ] Design hero section with clear value proposition and CTA
- [ ] Build features/benefits section
- [ ] Build testimonial carousel
- [ ] Build plan comparison table
- [ ] Build FAQ accordion section
- [ ] Build lead capture form (email signup)
- [ ] Integrate email marketing (Resend / SendGrid / Mailchimp)
- [ ] Add promotional video embed
- [ ] Add blog/article preview section
- [ ] SEO: meta tags, Open Graph, structured data, sitemap
- [ ] Mobile-first responsive design throughout

### 3.2 Academic Expansion — New Question Banks
- [ ] Extend question schema to support exam categories (ENARM, MIR, USMLE Step 1, Step 2 CK)
- [ ] Build admin UI to create/manage exam categories
- [ ] Allow filtering by exam category in question bank

### 3.3 Course Platform (Asynchronous Courses)
- [ ] Build course CRUD in admin panel (title, description, image, modules, videos, PDFs)
- [ ] Build course structure: Modules → Lessons (video + downloadable PDF)
- [ ] Build pre-test and post-test for each course (reuse question bank system)
- [ ] Build quiz system within lessons
- [ ] Build course progress tracking (per-module, per-lesson)
- [ ] Build course dashboard for students (enrolled courses, progress %)
- [ ] Build comments/discussion section per lesson
- [ ] Implement certificate generation logic (PDF with student name, course name, date)
- [ ] Implement QR code on certificate for online verification
- [ ] Build certificate download and verification page
- [ ] Build certificate gallery in user profile

### 3.4 CMS / Blog
- [ ] Build article schema in database (title, slug, content, excerpt, cover image, category, tags, author, publishedAt, status)
- [ ] Build rich text editor (TipTap/Plate.js — Notion-like experience)
- [ ] Build article CRUD in admin panel with scheduled publishing
- [ ] Build public blog listing page (paginated, filterable by category/tag)
- [ ] Build individual article page (SEO optimized, social sharing)
- [ ] Build sitemap integration for blog posts
- [ ] Build RSS feed

### 3.5 Admin Panel
- [ ] Build admin dashboard (stats overview: users, revenue, questions, courses)
- [ ] Build user management (list, search, suspend, edit, view progress)
- [ ] Build question management (create/edit with rich text, images, multiple choice options)
- [ ] Build video management (upload, organize by module, transcript)
- [ ] Build course management (create/edit courses, modules, lessons)
- [ ] Build subscription management (view/cancel/refund, plan configuration)
- [ ] Build article management (create/edit/schedule blog posts)
- [ ] Build landing page editor (hero text, features, testimonials, CTAs)
- [ ] Build analytics dashboard (active users, retention, study time, topic performance)

### 3.6 Analytics
- [ ] Track user events (question answered, exam completed, video watched, flashcard reviewed)
- [ ] Build user-facing analytics dashboard (personal performance, streaks, time studied)
- [ ] Build admin-facing analytics (platform-wide metrics, retention cohorts, popular content)

---

## Phase 4: Mobile & Performance Optimization

### 4.1 Mobile Experience
- [ ] Audit all pages for mobile responsiveness
- [ ] Build bottom navigation bar for mobile
- [ ] Optimize touch targets, font sizes, spacing
- [ ] Implement infinite scroll or pagination for question banks
- [ ] Test on actual iOS and Android devices (Chrome DevTools emulation + BrowserStack)

### 4.2 Performance
- [ ] Implement React Server Components where possible
- [ ] Add loading skeletons and progressive enhancement
- [ ] Optimize images (next/image, WebP, lazy loading)
- [ ] Implement CDN caching strategy for static content
- [ ] Add service worker for offline support (basic)
- [ ] Lighthouse audit: target 90+ on all metrics

### 4.3 PWA (Optional)
- [ ] Add manifest.json
- [ ] Add service worker for offline fallback
- [ ] Enable install prompt on mobile

---

## Phase 5: AI Features (Architecture Preparation)

### 5.1 Foundation
- [ ] Set up AI/LLM integration layer (OpenAI API, Anthropic, or local model)
- [ ] Build prompt templates for medical explanations
- [ ] Implement streaming responses for AI tutor chat

### 5.2 Features (Future)
- [ ] AI-powered question explanations (generate detailed breakdowns)
- [ ] Intelligent tutoring chatbot (conversational, context-aware)
- [ ] Automatic flashcard generation from question explanations or course content
- [ ] Personalized study recommendations based on weak areas
- [ ] AI-generated practice exams based on user performance

---

## Phase 6: Testing & QA

### 6.1 Testing Strategy
- [ ] Unit tests for utility functions, hooks, API routes (Vitest)
- [ ] Component tests for critical UI (Testing Library)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows: signup, exam mode, subscription checkout (Playwright)

### 6.2 QA Checklist
- [ ] All current Firebase features work identically in new platform
- [ ] Data migration verified row-by-row on staging
- [ ] Stripe integration tested end-to-end (test mode)
- [ ] i18n verified: all UI strings translated, no hardcoded text
- [ ] Mobile: all flows work on iPhone SE, iPhone 14, Samsung Galaxy S22
- [ ] Performance: question bank loads under 2s, exam mode smooth at 60fps
- [ ] Security: no exposed API keys, rate limiting active, RLS enabled
- [ ] SEO: each page has proper meta, sitemap valid, structured data test passes

---

## Phase 7: Launch

### 7.1 Pre-Launch
- [ ] Final staging deployment + full QA sign-off
- [ ] DNS cutover planning
- [ ] Rollback plan documented
- [ ] Monitoring (Sentry + uptime) verified working
- [ ] Stripe webhooks configured in production
- [ ] Email templates finalized (welcome, payment confirmation, certificate)

### 7.2 Launch
- [ ] Deploy to production
- [ ] Run final migration (Firebase → Postgres) with downtime minimized
- [ ] Verify all Firebase data is present in Postgres
- [ ] Smoke test all critical user flows
- [ ] Monitor error logs and performance for first 48 hours

### 7.3 Post-Launch
- [ ] Set up recurring DB backups
- [ ] Document architecture and runbooks
- [ ] Create maintenance guide for content editors
- [ ] Plan iteration cycle for AI features and new question banks
