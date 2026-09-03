# API Test Cases — Hospital EDU

This document lists test cases for every API call in the backend server (`/var/www/hosipital-edu/server`). All 90 tests pass against `http://localhost:4000/api` on the `dev` branch.

## Test Account

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | `apitest@mdexam.com` | `TestPass123!` | Created for testing, `role=admin`, email verified |
| Student | `<timestamp>@yopmail.com` | `TestPass123!` | Created dynamically per run, `role=student` |

## Authentication & Throttling

- `POST /auth/login` and `POST /auth/register` are throttled to **5 requests/minute** each (`auth.controller.ts`).
- Global throttle default: 100 req/minute (`app.module.ts` `ThrottlerModule`).
- NestJS `POST` endpoints return **201 Created** when a body is returned.

---

## 1. Auth APIs

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| POST | `/auth/register` | Public | `{email,password,name}` | 201 | Register new user | ✅ PASS |
| POST | `/auth/login` | Public | valid creds | 201 (token) | Admin login | ✅ PASS |
| POST | `/auth/login` | Public | valid creds | 201 (token) | Student login | ✅ PASS |
| POST | `/auth/login` | Public | wrong password | 401 | Login wrong password | ✅ PASS |
| POST | `/auth/login` | Public | `{}` | 400 | Login empty body | ✅ PASS |
| GET | `/auth/me` | None | — | 401 | Get me no token | ✅ PASS |
| GET | `/auth/me` | Admin | — | 200 | Get me admin | ✅ PASS |
| GET | `/auth/me` | Student | — | 200 | Get me student | ✅ PASS |
| POST | `/auth/forgot-password` | Public | `{email}` | 201 | Forgot password | ✅ PASS |

---

## 2. Subscription Plans

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/subscription-plans` | Public | — | 200 | List plans | ✅ PASS |
| GET | `/subscription-plans` | Admin | — | 200 | List plans admin | ✅ PASS |
| POST | `/subscription-plans` | Admin | `{name:{en},description:{en},price,interval,currency}` | 201 | Create plan | ✅ PASS |
| PATCH | `/subscription-plans/:id` | Admin | `{price}` | 200 | Update plan | ✅ PASS |
| DELETE | `/subscription-plans/:id` | Admin | — | 200 | Delete plan | ✅ PASS |

---

## 3. Courses

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/courses` | None | — | 401 | List courses no auth | ✅ PASS |
| GET | `/courses` | Student | — | 200 | List courses student | ✅ PASS |
| GET | `/courses?all=true` | Admin | — | 200 | List all courses | ✅ PASS |
| POST | `/courses` | Admin | `{title,description,slug,price,durationDays,hasCertificate}` | 201 | Create course | ✅ PASS |
| GET | `/courses/:slug` | Student | — | 200 | Get course by slug | ✅ PASS |
| GET | `/courses/check-enrollment/:slug` | Student | — | 200 | Check enrollment | ✅ PASS |
| GET | `/courses/check-access/:slug` | Student | — | 200 | Check access | ✅ PASS |
| GET | `/courses/:slug/progress` | Student | — | 200 | Get progress | ✅ PASS |
| GET | `/courses/:slug/comments` | Student | — | 200 | Get comments | ✅ PASS |
| POST | `/courses/:slug/comments` | Student | `{body}` | 201 | Add comment | ✅ PASS |
| GET | `/courses/:slug/pre-test` | Student | — | 200 | Get pre-test | ✅ PASS |
| GET | `/courses/:slug/post-test` | Student | — | 200 | Get post-test | ✅ PASS |
| GET | `/courses/:slug/test-results` | Student | — | 200 | Get test results | ✅ PASS |
| POST | `/courses/:slug/enroll` | Student | `{}` | 201 | Enroll in course | ✅ PASS |
| POST | `/courses/:courseId/modules` | Admin | `{title}` | 201 | Create module | ✅ PASS |
| PATCH | `/courses/modules/:moduleId` | Admin | `{title}` | 200 | Update module | ✅ PASS |
| POST | `/courses/modules/:moduleId/lessons` | Admin | `{title,contentType,content,duration}` | 201 | Create lesson | ✅ PASS |
| PATCH | `/courses/lessons/:lessonId` | Admin | `{title}` | 200 | Update lesson | ✅ PASS |
| POST | `/courses/:slug/lessons/:lessonId/complete` | Student | `{}` | 201 | Complete lesson | ✅ PASS |
| POST | `/courses/:slug/lessons/:lessonId/incomplete` | Student | `{}` | 201 | Incomplete lesson | ✅ PASS |
| DELETE | `/courses/lessons/:lessonId` | Admin | — | 200 | Delete lesson | ✅ PASS |
| DELETE | `/courses/modules/:moduleId` | Admin | — | 200 | Delete module | ✅ PASS |
| DELETE | `/courses/:id` | Admin | — | 200 | Delete course | ✅ PASS |

---

## 4. Exams

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/exams` | Public | — | 200 | List exams public | ✅ PASS |
| GET | `/exams` | Admin | — | 200 | List exams admin | ✅ PASS |
| GET | `/exams/:id` | Admin | — | 200 | Get exam | ✅ PASS |
| POST | `/exams` | Admin | — | 201 | Create exam | ✅ PASS |

---

## 5. Exam Attempts

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/exam-attempts` | Admin | — | 200 | List attempts admin | ✅ PASS |
| GET | `/exam-attempts` | Student | — | 200 | List attempts user | ✅ PASS |

---

## 6. Flashcards

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/flashcards` | None | — | 401 | List no auth | ✅ PASS |
| GET | `/flashcards` | Admin | — | 200 | List flashcards | ✅ PASS |
| GET | `/flashcards/specialties` | Admin | — | 200 | List specialties | ✅ PASS |
| GET | `/flashcards/due` | Admin | — | 200 | Due flashcards | ✅ PASS |
| GET | `/flashcards/exam-history` | Admin | — | 200 | Exam history | ✅ PASS |

---

## 7. Questions

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/questions` | None | — | 401 | List no auth | ✅ PASS |
| GET | `/questions` | Admin | — | 200 | List questions | ✅ PASS |

---

## 8. Users

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/users` | None | — | 401 | List users no auth | ✅ PASS |
| GET | `/users` | Admin | — | 200 | List users | ✅ PASS |
| GET | `/users/:id` | Admin | — | 200 | Get user by id | ✅ PASS |
| PATCH | `/users/:id` | Admin | `{name}` | 200 | Update user | ✅ PASS |

---

## 9. Articles

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/articles` | Public | — | 200 | List articles | ✅ PASS |
| POST | `/articles` | Admin | `{title:{en},content:{en},slug}` | 201 | Create article | ✅ PASS |
| GET | `/articles/:slug` | Public | — | 200 | Get article | ✅ PASS |
| PATCH | `/articles/:id` | Admin | `{title:{en}}` | 200 | Update article | ✅ PASS |
| DELETE | `/articles/:id` | Admin | — | 200 | Delete article | ✅ PASS |

---

## 10. Certificates

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/certificates` | Admin | — | 200 | List certificates | ✅ PASS |

---

## 11. Testimonials

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/testimonials` | Public | — | 200 | List public | ✅ PASS |
| GET | `/testimonials/admin` | Admin | — | 200 | List admin | ✅ PASS |
| POST | `/testimonials` | Admin | `{name:{en},role:{en},text:{en}}` | 201 | Create | ✅ PASS |
| PATCH | `/testimonials/:id` | Admin | `{content}` | 200 | Update | ✅ PASS |
| DELETE | `/testimonials/:id` | Admin | — | 200 | Delete | ✅ PASS |

---

## 12. Landing

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/landing` | Public | — | 200 | Get landing | ✅ PASS |
| GET | `/landing-data` | Public | — | 200 | Get landing data | ✅ PASS |

---

## 13. Parameters

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/public/parameters` | Public | — | 200 | Public params | ✅ PASS |
| GET | `/parameters` | Admin | — | 200 | All params | ✅ PASS |
| POST | `/parameters` | Admin | `{key,value}` | 201 | Create param | ✅ PASS |

---

## 14. Translations

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/translations` | None | — | 401 | No auth | ✅ PASS |
| GET | `/translations` | Admin | — | 200 | Admin | ✅ PASS |

---

## 15. Leads

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| POST | `/leads` | Public | `{name,email}` | 201 | Create lead | ✅ PASS |
| GET | `/leads` | Admin | — | 200 | List leads | ✅ PASS |

---

## 16. Upload

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| POST | `/upload/presigned-url` | Admin | `{key,contentType}` | 201 | Presigned URL | ✅ PASS |

---

## 17. Calendar

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/calendar` | Admin | — | 200 | List events | ✅ PASS |
| POST | `/calendar` | Admin | `{title:{en},description:{en},eventDate,eventType}` | 201 | Create event | ✅ PASS |
| PATCH | `/calendar/:id` | Admin | `{title:{en}}` | 200 | Update event | ✅ PASS |
| DELETE | `/calendar/:id` | Admin | — | 200 | Delete event | ✅ PASS |

---

## 18. Analytics

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/analytics/user-stats` | Admin | — | 200 | User stats | ✅ PASS |
| GET | `/analytics/progress` | Admin | — | 200 | Progress | ✅ PASS |
| GET | `/analytics/admin` | Admin | — | 200 | Admin analytics | ✅ PASS |
| GET | `/analytics/admin/dau` | Admin | — | 200 | DAU | ✅ PASS |
| GET | `/analytics/admin/mau` | Admin | — | 200 | MAU | ✅ PASS |

---

## 19. Subscriptions

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/subscriptions/my` | Admin | — | 200 | My subscription | ✅ PASS |
| GET | `/subscriptions/my` | Student | — | 200 | My subscription | ✅ PASS |
| GET | `/subscriptions/upgrade-plans` | Student | — | 200 | Upgrade plans | ✅ PASS |

---

## 20. Videos

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/videos` | Admin | — | 200 | List videos | ✅ PASS |

---

## 21. Stream

| Method | Endpoint | Auth | Payload | Expected | Test | Status |
|--------|----------|------|---------|----------|------|--------|
| GET | `/stream/videos` | Admin | — | 200 | Stream videos | ✅ PASS |
| GET | `/stream/modules` | Admin | — | 200 | Stream modules | ✅ PASS |

---

## Summary

- **Total tests:** 90
- **Passed:** 90
- **Failed:** 0

The only real issue found during testing was a **local DB out of sync with the schema** — the local database was missing three columns that exist on the VPS (`subscription_plans.has_videos`, `subscription_plans.has_calendar`, `articles.content_image`). Added locally:

```sql
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_videos boolean DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_calendar boolean DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_image text;
```

No server source code changes were required; all endpoint logic behaves correctly.
