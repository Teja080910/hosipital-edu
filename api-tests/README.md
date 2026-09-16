# API Test Suites

All test cases run against a **locally started server** (`http://localhost:4000/api`).

## Prerequisites

1. Local PostgreSQL with schema applied (`postgresql://postgres:postgres@localhost:5432/hospital_edu`).
2. Test admin account (create once):
   ```sh
   cd ../server
   node scripts/create-admin.js 'Test Admin' 'apitest@mdexam.com' 'TestPass123!'
   # then verify email in DB:
   psql -h localhost -U postgres -d hospital_edu -c "UPDATE users SET email_verified_at = NOW() WHERE email = 'apitest@mdexam.com';"
   ```
3. Build and start the server:
   ```sh
   cd ../server
   npm run build
   setsid nohup node dist/src/main > /tmp/server.log 2>&1 < /dev/null & disown
   curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/api/exams   # expect 200
   ```

## Suites

| Script | Scope | Tests |
|--------|-------|-------|
| `api-tests-basic.sh` | Auth, subscription-plans, courses (list/detail/enroll/comments), exams list, exam-attempts list, flashcards list, questions list, users, articles CRUD, certificates, testimonials CRUD, landing, parameters, translations, leads, upload presigned-url, calendar CRUD, analytics, subscriptions, videos, stream — **90 tests** | 90 |
| `api-tests-extended.sh` | Auth extras, exams full CRUD + specialty/topic/subtopic tree, questions CRUD, exam-attempts flow, flashcards CRUD + exam flow, course quizzes (pre/post), course video lessons, stream modules/lessons CRUD + progress, upload file/video, translations CRUD + export + auto-translate, certificates public lookups, users subscription/role, subscriptions checkout/cancel, landing put, parameters full CRUD — **85 tests** | 85 |

## Run

```sh
bash api-tests-basic.sh
bash api-tests-extended.sh
```

## Notes

- `POST /auth/login` and `POST /auth/register` are throttled to 5/min each — each script logs in admin + registers one student only.
- The suites create their own test entities (exams, courses, students, etc.) and clean them up at the end.
- Known environment caveats:
  - `POST /stream/videos/:uid/token` needs a real Cloudflare Stream UID (fake uid → 500).
  - `POST /subscriptions/confirm-checkout` with a fake Stripe session → 500 (Stripe-side error, not app bug).
