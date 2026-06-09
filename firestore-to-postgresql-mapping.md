# Firestore → PostgreSQL Mapping

## Document Counts

| Firestore Collection | Docs | PostgreSQL Table | Est. Rows |
|---------------------|------|-----------------|-----------|
| `appusers` | 952 | `users` | ~800-900 |
| `appusermemberships` | 958 | — (replaced by subscriptions) | — |
| `appusermembershippurchases` | 1,285 | `payments` + `user_subscriptions` | ~1,200 |
| `parameters` | 13 | `parameters` → removed (i18n now in `translations`) | 13 |
| `appuserexams` | 32 | `exam_attempts` + `exam_answers` | ~32 |
| `categorys` | 22 | → replaced by `exams` / `specialties` / `topics` / `subtopics` | — |
| `memberships` | 5 | `subscription_plans` | ~5 |
| `questions` | 1,109 | `questions` + `question_options` + `question_images` | ~1,100 |
| `appuserflashcardexams` | 1,132 | `exam_attempts` (flashcard variant) + `user_flashcard_reviews` | ~1,100 |
| `flashcardcategorys` | 21 | → replaced by topic hierarchy | — |
| `flashcardquestions` | 40 | `flashcards` | ~40 |
| `videocategorys` | 8 | `video_modules` | ~8 |
| `videos` | 23 | `video_lessons` | ~23 |

---

## Collection-by-Collection Mapping

### 1. `appusers` → `users`

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `username` | string | `email` | lowercased, unique |
| `name` | string | `name` | — |
| `lastName` | string | — | Combine with `name` → full name |
| `isAdministrator` | boolean | `role` | `true` → `'admin'`, `false` → `'student'` |
| `isCustomer` | boolean | — | Redundant (all non-admin = customer) |
| `enabled` | boolean | `deleted_at` | `false` → `deleted_at = now()` |
| `canListUsers` | boolean | — | Internal permission, not needed |
| `phone` | string? | — | Add to user profile if needed |

**Missing in Firestore → new in PostgreSQL:**
- `password_hash` (OAuth was used in old app)
- `google_id`
- `email_verified_at`
- `avatar_url`
- `preferred_locale` (default `'en'`)
- `created_at`, `updated_at`, `deleted_at`

---

### 2. `appusermemberships` → (no direct table — replaced by `user_subscriptions`)

This collection stored a **snapshot of what membership a user had** at document creation. It is a per-user copy of membership data, not a relational design.

| Firestore Field | Type | Destination | Notes |
|----------------|------|-------------|-------|
| `username` | string | `user_subscriptions.user_id` | Join via `users.email` |
| `title` | string | `subscription_plans.name` | Translated name |
| `detail` | string | `subscription_plans.description` | Translated |
| `price` | number | `subscription_plans.price` | — |
| `maxDays` | number | `subscription_plans.interval` + `user_subscriptions.current_period_end` | Duration-based billing |
| `maxQuestions` | number | — | Feature flag / plan config |
| `maxFlashcards` | number | — | Feature flag / plan config |
| `maxUses` | number | — | Not migrating (usage caps removed) |
| `maxUsesFlashcards` | number | — | Not migrating |
| `isVisible` | boolean | `subscription_plans.is_visible` | — |
| `isDefault` | boolean | — | Default plan concept |
| `order` | number | `subscription_plans.sort_order` | — |
| `creationTime` | timestamp | `user_subscriptions.current_period_start` | — |

**Migration approach:** This collection had 958 docs (many stale copies per user as memberships changed). Only the **latest** per user should be migrated, and the plan references should resolve to a `subscription_plan.id` or be created on-the-fly.

---

### 3. `appusermembershippurchases` → `payments` + `user_subscriptions`

Each document = a payment transaction with membership upgrade details.

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `paymentNumber` | string | `payments.id` (as text) | Unique transaction ID |
| `username` | string | `payments.user_id` → `users.id` | — |
| `creationTime` | timestamp | `payments.created_at` | — |
| `currentMembership` | object | — | Plan snapshot before change (not migrated) |
| `toMembership` | object | `subscription_plans` + `user_subscriptions.plan_id` | Plan they upgraded to |
| `userMembershipPurchaseStatusModel` | object | `payments.status` | Map `id`/`title` to status enum |

**toMembership fields mapped:**
| Nested Field | Destination |
|-------------|-------------|
| `title` | `subscription_plans.name` |
| `price` | `payments.amount` |
| `maxDays` | `user_subscriptions.current_period_end` (calculated) |
| `maxQuestions`, `maxFlashcards`, etc. | Plan feature config |

---

### 4. `parameters` → `translations` (replaced entirely)

`parameters` was a flat key-value config store. The new system uses `translations` for i18n and `landing_page_config` for site config.

| Firestore Field | Type | Destination | Notes |
|----------------|------|-------------|-------|
| `key2` | string | `translations.key` | Translation key |
| `title` | string | `translations.value` | For locale `'es'` (default) |
| `titleEn` | string | `translations.value` | For locale `'en'` |
| `additional` | string | `translations.value` or `landing_page_config.config` | Context-dependent |
| `additionalEn` | string | `translations.value` | For locale `'en'` |

These 13 documents are quasi-translations — they held config text and TOS/privacy content in Spanish with optional English. Should be migrated to `translations` table with appropriate keys and locales.

---

### 5. `appuserexams` → `exam_attempts` + `exam_answers`

Each document = one exam attempt by a user, with all answers embedded.

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | `exam_attempts.id` | — |
| `username` | string | `exam_attempts.user_id` | → `users.id` |
| `creationTime` | timestamp | `exam_attempts.started_at` | — |
| `endTime` | timestamp | `exam_attempts.completed_at` | — |
| `maxTime` | number | `exam_attempts.time_limit` | Minutes |
| `maxQuestions` | number | `exam_attempts.question_count` | — |
| `customTitle` | string | — | Exam naming (log only) |
| `isShowTimeCounter` | boolean | — | UI preference |
| `isOpen` | boolean | `exam_attempts.status` | `true` → `'in_progress'`, `false` → `'completed'` |
| `categorys` | array | `exam_attempts.exam_id` | Resolve category → exam/specialty/topic |
| `questionAnswers` | array | `exam_answers` | See below |

**questionAnswers → exam_answers mapping:**

| Nested Field | PostgreSQL Field | Notes |
|-------------|-----------------|-------|
| `question.title` | `exam_answers.question_id` | Match question by text or ID |
| `question.explanation` | — | Already in `questions` table |
| `question.answers[].title` | `question_options.text` | — |
| `question.answers[].isCorrect` | `question_options.is_correct` | — |
| `answer.title` | `exam_answers.selected_option_id` | Selected option |
| `answer.isCorrect` | `exam_answers.is_correct` | — |

**Important:** The question + answer data is **embedded** in the exam attempt document. During migration, each embedded question must be matched to an existing `questions.id` or created as a new question. The `categorys` array tells us which categories were used — these resolve to the new exam/specialty/topic hierarchy.

---

### 6. `categorys` → `exams` + `specialties` + `topics` + `subtopics`

The old app used a **flat** category list. The new app uses a **4-level hierarchy**.

| Firestore Field | Type | Destination | Notes |
|----------------|------|-------------|-------|
| `id` | string | — | Used as reference in questions |
| `title` | string | `exams.name` or `specialties.name` or `topics.name` or `subtopics.name` | Determined during migration |
| `maxQuestions` | number | — | Per-category limit (not in new schema) |
| `creationTime` | timestamp | `created_at` | — |

**22 Firestore categories** need manual mapping to the hierarchy:
- `examType` field on `questions` and `memberships` (values like `'ENARM'`, `'MIR'`) determine which exam level a category belongs to
- Each flat category becomes either an exam, specialty, topic, or subtopic in the new structure

---

### 7. `memberships` → `subscription_plans`

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | — | Old ID (not migrated) |
| `title` | string | `subscription_plans.name` | Translated |
| `detail` | string | `subscription_plans.description` | Translated |
| `price` | number | `subscription_plans.price` | — |
| `maxDays` | number | `subscription_plans.interval` | `30` → `'month'`, `365` → `'annual'` |
| `maxQuestions` | number | — | Feature flag |
| `maxFlashcards` | number | — | Feature flag |
| `maxVideos` | number | — | Feature flag |
| `maxUses` | number | — | Removed (no usage caps) |
| `maxUsesFlashcards` | number | — | Removed |
| `isVisible` | boolean | `subscription_plans.is_visible` | — |
| `isDefault` | boolean | — | Default plan concept |
| `order` | number | `subscription_plans.sort_order` | — |
| `examType` | string | `subscription_plans.exam_id` | → `exams.id` |
| `isCourseOnly` | boolean | — | Plan type flag |
| `creationTime` | timestamp | `subscription_plans.created_at` | — |

**Missing in Firestore → new in PostgreSQL:**
- `stripe_price_id` (new payment system)
- `currency` (default `'USD'`)
- Full jsonb translation support (name, description)

---

### 8. `questions` → `questions` + `question_options` + `question_images`

The largest and most complex collection (1,109 docs).

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | — | Old ID format `{categoryKey}_{N}` |
| `title` | string | `questions.text` | Rich HTML |
| `explanation` | string | `questions.explanation` | Rich HTML |
| `reference` | string | — | Citation (not in schema but could be stored) |
| `isEnabled` | boolean | `questions.is_active` | — |
| `examType` | string | `questions.exam_id` | → `exams.id` |
| `creationTime` | timestamp | `questions.created_at` | — |
| `category` | object | `questions.specialty_id` / `questions.topic_id` | Resolve to hierarchy |
| `answers` | array | `question_options` | 5 options (1 correct) |
| `arraySearch` | array of strings | — | Search index (not needed with PostgreSQL full-text) |
| `storageReference01-03` | strings | `question_images.url` | Firebase Storage refs |
| `urlReference01-03` | strings | `question_images.url` | Public URLs for images |
| `storageExplanation01-03` | strings | — | Explanation images |
| `urlExplanation01-03` | strings | — | Explanation images |
| `storageTitle01-03` | strings | — | Title images |
| `urlTitle01-03` | strings | — | Title images |

**answers → question_options mapping:**

| Index | Firestore Field | PostgreSQL Field |
|-------|----------------|-----------------|
| 0-4 | `answers[i].title` | `question_options.text` |
| — | `answers[i].isCorrect` | `question_options.is_correct` |
| — | — | `question_options.sort_order` (0-4) |

**Storage fields → question_images:**

| Firestore Field | PostgreSQL Field |
|----------------|-----------------|
| `urlTitle01` | `question_images.url` where `sort_order = 0` and purpose = title |
| `urlExplanation01` | `question_images.url` where sort_order = 0 and purpose = explanation |
| `urlReference01` | `question_images.url` where sort_order = 0 and purpose = reference |

**Missing in Firestore → new in PostgreSQL:**
- `difficulty` (default `'medium'`)
- `created_by` (default to admin user)
- `subtopic_id`
- `updated_at`

---

### 9. `appuserflashcardexams` → `exam_attempts` + `user_flashcard_reviews`

Structurally identical to `appuserexams` but for flashcards. Same `questionAnswers` embedded pattern.

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | `exam_attempts.id` | — |
| `username` | string | `exam_attempts.user_id` | → `users.id` |
| `questionAnswers` | array | `user_flashcard_reviews` | Each answer = one review |

**questionAnswers → user_flashcard_reviews:**

| Nested Field | PostgreSQL Field |
|-------------|-----------------|
| `question.title` | → `flashcards.front` (match by text) |
| `question.explanation` | → `flashcards.back` |
| `answer.isCorrect` | → accuracy metric (not same as SM-2 algorithm) |

---

### 10. `flashcardcategorys` → `exams` / `specialties` / `topics`

Same structure as `categorys` but for flashcards. 21 docs, flat categories.

| Firestore Field | PostgreSQL Field |
|----------------|-----------------|
| `title` | `exams.name` or `specialties.name` or `topics.name` |
| `id` | — (old ID, used as reference) |
| `maxQuestions` | — |
| `creationTime` | `created_at` |

---

### 11. `flashcardquestions` → `flashcards`

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | — | Old ID |
| `title` | string | `flashcards.front` | Card front |
| `explanation` | string | `flashcards.back` | Card back |
| `reference` | string | — | Citation |
| `isEnabled` | boolean | `flashcards.is_active` | — |
| `category` | object | `flashcards.specialty_id` / `flashcards.topic_id` | Resolve to hierarchy |
| `answers` | array | — | Only 1 answer per flashcard (redundant — answer is on back) |
| `arraySearch` | array | — | Not needed |
| `creationTime` | timestamp | `flashcards.created_at` | — |

**Missing in Firestore → new:**
- `exam_id`
- `created_by` (default admin)

---

### 12. `videocategorys` → `video_modules`

| Firestore Field | Type | PostgreSQL Field | Notes |
|----------------|------|-----------------|-------|
| `id` | string | — | Old ID |
| `title` | string | `video_modules.title` | Translated |
| `maxWatching` | number | — | Limit not in new schema |
| `creationTime` | timestamp | `video_modules.created_at` | — |

**Missing in Firestore → new:**
- `exam_id` (module belongs to an exam)
- `description`
- `sort_order`
- `is_active`

---

### 13. `videos` → `video_lessons`

| Firestore Field | PostgreSQL Field | Notes |
|----------------|-----------------|-------|
| `title` | `video_lessons.title` | Translated |
| `url` | `video_lessons.video_url` | Google Drive embed URL → needs migration to Cloudflare Stream |
| `urlPreview` | — | Thumbnail URL |
| `storagePreview` | — | Firebase Storage thumbnail ref |
| `isEnabled` | `video_lessons.is_active` | — |
| `category` | `video_lessons.module_id` | → `video_modules.id` |
| `arraySearch` | — | Not needed |
| `creationTime` | `video_lessons.created_at` | — |

**Missing in Firestore → new:**
- `description`
- `duration` (needs to be calculated)
- `sort_order`

---

## New PostgreSQL Features (No Firestore Equivalent)

These tables have **no source data** in Firestore:

| Table | Purpose |
|-------|---------|
| `subtopics` | 4th level in category hierarchy |
| `user_question_progress` | Per-user question stats |
| `user_video_progress` | Per-user video watching progress |
| `courses` | Paid course bundles |
| `course_modules` | Course module groupings |
| `course_lessons` | Course lesson content (video, PDF, text) |
| `course_quizzes` | Course-attached quizzes |
| `user_course_enrollments` | Paid course enrollment |
| `user_course_progress` | Per-user course lesson completion |
| `course_comments` | Course lesson discussion |
| `certificate_templates` | Certificate design templates |
| `certificates` | Issued certificates |
| `article_categories` | Blog/article categories |
| `article_tags` | Blog/article tags |
| `articles` | Blog/article content |
| `article_tags_mapping` | Article ↔ tag join table |
| `translations` | i18n translation strings |
| `landing_page_config` | Landing page editor data |
| `audit_logs` | Admin action audit trail |
| `calendar_events` | Study schedule / calendar |

---

## Data Migration Strategy Notes

### Embedded Arrays → Normalized Tables

The biggest structural change: Firestore stores nested data (answers, categories, questionAnswers) **inside** documents. PostgreSQL normalizes these into separate tables.

**Pattern for questions migration:**
1. Create question → get `question.id` UUID
2. Create 5 `question_options` rows referencing that UUID
3. Create 0-9 `question_images` rows (from the 18 storage/url fields)

**Pattern for exam attempt migration:**
1. Create `exam_attempt` → get `attempt.id`
2. For each embedded `questionAnswer`:
   - Match question text to existing `questions` table (or create stub question)
   - Create `exam_answer` row

### Flat Categories → 4-Level Hierarchy

Manual mapping required. Use the `examType` field on questions and memberships as hints:
- `examType` = exam name (e.g., `'ENARM'`, `'MIR'`)
- `category.title` likely maps to `specialty.name` or `topic.name`

### Firebase Storage → Cloudflare R2

All `url*` and `storageReference*` fields reference Firebase Storage paths or Google Drive. These files need to be:
1. Downloaded from Firebase Storage
2. Uploaded to Cloudflare R2
3. URLs updated in the new `question_images.url`, `video_lessons.video_url`, etc.

63 files found in Firebase Storage (question images, video thumbnails, calendar PDFs).