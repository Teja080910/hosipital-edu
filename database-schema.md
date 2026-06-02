# Database Schema — MD Exam

## Conventions
- All tables use `uuid` primary keys
- Timestamps: `created_at`, `updated_at` on all tables
- Soft delete: `deleted_at` nullable timestamp
- Plural table names (snake_case)

---

## Core Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | varchar(255) | unique, not null |
| password_hash | varchar(255) | nullable (OAuth users) |
| name | varchar(255) | |
| role | enum | `student`, `admin`, `superadmin` |
| avatar_url | text | nullable |
| email_verified_at | timestamp | nullable |
| google_id | varchar(255) | nullable, unique |
| preferred_locale | varchar(5) | default `en` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | nullable |

### exams
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | varchar(50) | unique, e.g. `enarm`, `mir`, `usmle-step-1`, `enurm` |
| name | jsonb | `{ "en": "ENARM", "es": "ENARM" }` |
| description | jsonb | translated description |
| is_active | boolean | default true |
| sort_order | int | |
| created_at | timestamp | |

### specialties
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams |
| name | jsonb | translated |
| slug | varchar(255) | |
| sort_order | int | |
| created_at | timestamp | |

### topics
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| specialty_id | uuid | FK → specialties |
| name | jsonb | translated |
| slug | varchar(255) | |
| sort_order | int | |
| created_at | timestamp | |

### subtopics
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| topic_id | uuid | FK → topics |
| name | jsonb | translated |
| slug | varchar(255) | |
| sort_order | int | |
| created_at | timestamp | |

---

## Question Bank

### questions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams (nullable, for exam-specific questions) |
| specialty_id | uuid | FK → specialties |
| topic_id | uuid | FK → topics |
| subtopic_id | uuid | FK → subtopics (nullable) |
| text | text | rich HTML (with bold, images) |
| explanation | text | rich HTML |
| difficulty | enum | `easy`, `medium`, `hard` |
| is_active | boolean | default true |
| created_by | uuid | FK → users (admin) |
| created_at | timestamp | |
| updated_at | timestamp | |

### question_options
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| question_id | uuid | FK → questions |
| text | text | rich HTML |
| is_correct | boolean | |
| sort_order | int | |
| created_at | timestamp | |

### question_images
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| question_id | uuid | FK → questions |
| url | text | Cloudflare R2 URL |
| caption | text | nullable |
| sort_order | int | |

---

## User Progress & History

### exam_attempts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| exam_id | uuid | FK → exams (which exam they were practicing) |
| mode | enum | `study`, `exam` |
| status | enum | `in_progress`, `completed` |
| question_count | int | total questions in this attempt |
| answered_count | int | |
| correct_count | int | |
| time_limit | int | minutes (null for study mode) |
| time_spent | int | seconds |
| started_at | timestamp | |
| completed_at | timestamp | nullable |
| created_at | timestamp | |

### exam_answers
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| attempt_id | uuid | FK → exam_attempts |
| question_id | uuid | FK → questions |
| selected_option_id | uuid | FK → question_options (nullable) |
| is_correct | boolean | |
| time_spent | int | seconds |
| is_flagged | boolean | default false |
| answered_at | timestamp | |

### user_question_progress
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| question_id | uuid | FK → questions |
| times_answered | int | default 0 |
| times_correct | int | default 0 |
| last_answered_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

Unique constraint: `(user_id, question_id)`

---

## Flashcards

### flashcards
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams (nullable) |
| specialty_id | uuid | FK → specialties |
| topic_id | uuid | FK → topics |
| front | text | rich text |
| back | text | rich text |
| is_active | boolean | default true |
| created_by | uuid | FK → users (admin) |
| created_at | timestamp | |
| updated_at | timestamp | |

### user_flashcard_reviews
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| flashcard_id | uuid | FK → flashcards |
| ease_factor | float | SM-2 algorithm: default 2.5 |
| interval | int | days |
| repetitions | int | |
| next_review_at | timestamp | |
| last_reviewed_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

Unique constraint: `(user_id, flashcard_id)`

---

## Video Classes

### video_modules
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams (nullable) |
| title | jsonb | translated |
| description | jsonb | translated |
| sort_order | int | |
| is_active | boolean | |
| created_at | timestamp | |

### video_lessons
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| module_id | uuid | FK → video_modules |
| title | jsonb | translated |
| description | jsonb | translated |
| video_url | text | Cloudflare Stream ID or URL |
| duration | int | seconds |
| sort_order | int | |
| is_active | boolean | |
| created_at | timestamp | |

### user_video_progress
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| lesson_id | uuid | FK → video_lessons |
| watched_seconds | int | default 0 |
| is_completed | boolean | default false |
| last_watched_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

Unique constraint: `(user_id, lesson_id)`

---

## Courses (Asynchronous)

### courses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams (nullable, course can be cross-exam) |
| slug | varchar(255) | unique |
| title | jsonb | translated |
| description | jsonb | translated |
| short_description | jsonb | translated |
| cover_image | text | R2 URL |
| price | decimal(10,2) | |
| stripe_price_id | varchar(255) | nullable |
| duration_days | int | access duration after purchase |
| has_certificate | boolean | default true |
| certificate_template_id | uuid | FK → certificate_templates (nullable) |
| sort_order | int | |
| is_active | boolean | |
| created_by | uuid | FK → users |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_modules
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| course_id | uuid | FK → courses |
| title | jsonb | translated |
| description | jsonb | translated |
| sort_order | int | |
| created_at | timestamp | |

### course_lessons
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| module_id | uuid | FK → course_modules |
| title | jsonb | translated |
| content_type | enum | `video`, `pdf`, `quiz`, `text` |
| video_url | text | nullable (Cloudflare Stream) |
| pdf_url | text | nullable (R2 URL) |
| content | text | nullable (rich text for text lessons) |
| duration | int | seconds |
| sort_order | int | |
| is_free_preview | boolean | default false |
| created_at | timestamp | |

### course_quizzes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| lesson_id | uuid | FK → course_lessons (nullable — standalone quiz) |
| course_id | uuid | FK → courses |
| type | enum | `pre_test`, `post_test`, `lesson_quiz` |
| title | jsonb | |
| passing_score | int | percentage, e.g. 70 |
| questions | jsonb | array of question IDs with order |
| created_at | timestamp | |

### user_course_enrollments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| course_id | uuid | FK → courses |
| stripe_payment_id | varchar(255) | nullable |
| access_expires_at | timestamp | |
| status | enum | `active`, `expired`, `refunded` |
| created_at | timestamp | |
| updated_at | timestamp | |

### user_course_progress
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| course_id | uuid | FK → courses |
| module_id | uuid | FK → course_modules |
| lesson_id | uuid | FK → course_lessons |
| is_completed | boolean | |
| quiz_score | int | nullable |
| quiz_passed | boolean | nullable |
| completed_at | timestamp | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### course_comments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| course_id | uuid | FK → courses |
| lesson_id | uuid | FK → course_lessons (nullable) |
| parent_id | uuid | FK → course_comments (nullable, for replies) |
| body | text | rich text |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | nullable |

---

## Certificates

### certificate_templates
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | varchar(255) | |
| background_url | text | R2 URL (PDF background) |
| font_family | varchar(255) | |
| text_color | varchar(7) | hex |
| layout_config | jsonb | positions of name, date, course title, QR |
| is_default | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### certificates
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| course_id | uuid | FK → courses |
| template_id | uuid | FK → certificate_templates |
| certificate_number | varchar(50) | unique, e.g. `CERT-2025-00001` |
| student_name | varchar(255) | |
| course_name | jsonb | snapshot at time of generation |
| completion_date | date | |
| qr_code_url | text | R2 URL |
| pdf_url | text | R2 URL (generated PDF) |
| verification_hash | varchar(64) | unique, for online verification |
| created_at | timestamp | |

---

## Subscriptions & Payments

### subscription_plans
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| exam_id | uuid | FK → exams (nullable — plan can be exam-specific) |
| stripe_price_id | varchar(255) | unique |
| name | jsonb | translated |
| description | jsonb | translated |
| interval | enum | `monthly`, `quarterly`, `annual` |
| price | decimal(10,2) | |
| currency | varchar(3) | default `USD` |
| is_visible | boolean | admin toggle to show/hide |
| sort_order | int | |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### user_subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| plan_id | uuid | FK → subscription_plans |
| stripe_subscription_id | varchar(255) | unique |
| stripe_customer_id | varchar(255) | |
| status | enum | `active`, `canceled`, `past_due`, `expired` |
| current_period_start | timestamp | |
| current_period_end | timestamp | |
| canceled_at | timestamp | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### payments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| stripe_payment_intent_id | varchar(255) | unique |
| amount | decimal(10,2) | |
| currency | varchar(3) | |
| status | enum | `succeeded`, `failed`, `refunded` |
| description | text | e.g. "Course: ECG" or "Subscription: Monthly" |
| payable_type | varchar(50) | `subscription`, `course` |
| payable_id | uuid | FK to subscription or course enrollment |
| created_at | timestamp | |

---

## Calendar

### calendar_events
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users (nullable — admin-created events) |
| title | jsonb | translated |
| description | jsonb | translated |
| event_date | date | |
| event_time | time | nullable |
| event_type | enum | `study_schedule`, `personal`, `exam` |
| pdf_url | text | nullable (R2 — admin uploads PDF schedule) |
| is_all_day | boolean | default false |
| created_by | uuid | FK → users (admin) |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## CMS / Blog

### article_categories
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | varchar(255) | unique |
| name | jsonb | translated |
| sort_order | int | |
| created_at | timestamp | |

### article_tags
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | varchar(255) | unique |
| name | jsonb | translated |
| created_at | timestamp | |

### articles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| category_id | uuid | FK → article_categories |
| author_id | uuid | FK → users |
| slug | varchar(255) | unique |
| title | jsonb | translated |
| excerpt | jsonb | translated |
| content | jsonb | translated (rich HTML via TipTap) |
| cover_image | text | R2 URL |
| is_published | boolean | |
| published_at | timestamp | nullable (scheduled) |
| is_subscriber_only | boolean | default false |
| video_url | text | nullable (Cloudflare Stream) |
| seo_title | varchar(255) | nullable |
| seo_description | text | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | nullable |

### article_tags_mapping
| Column | Type | Notes |
|--------|------|-------|
| article_id | uuid | FK → articles |
| tag_id | uuid | FK → article_tags |

Primary key: `(article_id, tag_id)`

---

## i18n / Translations

### translations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| key | varchar(255) | e.g. `nav.home`, `landing.hero_title` |
| locale | varchar(5) | `en`, `es`, `pt`, `fr`, `de` |
| value | text | translated string |
| namespace | varchar(50) | `nav`, `landing`, `questions`, `courses`, etc. |
| updated_by | uuid | FK → users (nullable) |
| created_at | timestamp | |
| updated_at | timestamp | |

Unique constraint: `(key, locale)`

---

## System / Config

### landing_page_config
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| section | varchar(50) | `hero`, `features`, `testimonials`, `faq`, `cta` |
| config | jsonb | flexible JSON per section |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users (nullable) |
| action | varchar(100) | e.g. `question.created`, `user.suspended` |
| entity_type | varchar(50) | |
| entity_id | uuid | |
| metadata | jsonb | old/new values, IP, user agent |
| created_at | timestamp | |

---

## Entity Relationship Summary

```
users
 ├── exam_attempts (user progress)
 ├── exam_answers (via attempts)
 ├── user_question_progress
 ├── user_flashcard_reviews
 ├── user_video_progress
 ├── user_course_enrollments
 ├── user_course_progress
 ├── course_comments
 ├── certificates
 ├── user_subscriptions
 ├── payments
 ├── calendar_events
 └── articles (as author)

exams
 ├── specialties → topics → subtopics
 ├── questions → question_options → question_images
 ├── flashcards
 ├── video_modules → video_lessons
 ├── courses → course_modules → course_lessons
 ├── course_quizzes
 └── subscription_plans

courses
 ├── course_modules → course_lessons
 ├── course_quizzes
 ├── user_course_enrollments
 ├── user_course_progress
 ├── course_comments
 └── certificates

articles
 ├── article_categories
 └── article_tags (via article_tags_mapping)
```
