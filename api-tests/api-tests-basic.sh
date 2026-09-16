#!/bin/bash
BASE="http://localhost:4000/api"
PASS=0
FAIL=0
RESULTS=""

test_api() {
  local method="$1"
  local endpoint="$2"
  local desc="$3"
  local data="$4"
  local auth="$5"
  local expect_code="${6:-200}"
  
  local AUTH_HEADER=""
  if [ "$auth" = "admin" ]; then
    AUTH_HEADER="-H \"Authorization: Bearer $ADMIN_TOKEN\""
  elif [ "$auth" = "user" ]; then
    AUTH_HEADER="-H \"Authorization: Bearer $USER_TOKEN\""
  fi
  
  local BODY_ARG=""
  if [ "$method" = "POST" ] || [ "$method" = "PUT" ] || [ "$method" = "PATCH" ]; then
    if [ -n "$data" ]; then
      BODY_ARG="-d '$data'"
    fi
  fi
  
  CODE=$(eval curl -s -o /tmp/api_resp.json -w '%{http_code}' -X "$method" "\"$BASE$endpoint\"" \
    -H "\"Content-Type: application/json\"" $AUTH_HEADER $BODY_ARG 2>/dev/null)
  BODY=$(cat /tmp/api_resp.json 2>/dev/null)
  
  if [ "$CODE" = "$expect_code" ]; then
    PASS=$((PASS + 1))
    RESULTS="$RESULTS\n✅ PASS | $method $endpoint → $CODE | $desc"
  else
    FAIL=$((FAIL + 1))
    SHORT_BODY=$(echo "$BODY" | head -c 300)
    RESULTS="$RESULTS\n❌ FAIL | $method $endpoint → $CODE (exp $expect_code) | $desc"
    RESULTS="$RESULTS\n   → $SHORT_BODY"
  fi
}

echo "========================================="
echo "  FULL API TEST SUITE - LOCALHOST:4000"
echo "========================================="

# Login admin
ADMIN_LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"apitest@mdexam.com","password":"TestPass123!"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
  PASS=$((PASS + 1))
  RESULTS="$RESULTS\n✅ PASS | POST /auth/login → admin | Admin login"
else
  FAIL=$((FAIL + 1))
  RESULTS="$RESULTS\n❌ FAIL | POST /auth/login → admin | Admin login"
  RESULTS="$RESULTS\n   → $ADMIN_LOGIN"
  echo -e "$RESULTS"
  exit 1
fi

# Register and login student
STU_EMAIL="apistudent_$(date +%s)@yopmail.com"
STU_REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$STU_EMAIL\",\"password\":\"TestPass123!\",\"name\":\"API Test Student\"}")
USER_TOKEN=$(echo "$STU_REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
USER_ID=$(echo "$STU_REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)

# Verify email locally
PGPASSWORD=postgres psql -U postgres -d hospital_edu -c "UPDATE users SET email_verified_at = NOW() WHERE email = '$STU_EMAIL';" > /dev/null 2>&1

sleep 1
if [ -n "$USER_TOKEN" ]; then
  PASS=$((PASS + 1))
  RESULTS="$RESULTS\n✅ PASS | POST /auth/register → student token | Student registered"
else
  FAIL=$((FAIL + 1))
  RESULTS="$RESULTS\n❌ FAIL | POST /auth/register → student token | Student register"
fi

echo -e "\n--- 1. AUTH APIs ---"
test_api POST "/auth/register" "Register new user" '{"email":"testdup_'$(date +%s)'@yopmail.com","password":"Test1234!","name":"Dup User"}' "" "201"
test_api POST "/auth/login" "Login wrong password" '{"email":"apitest@mdexam.com","password":"wrong"}' "" "401"
test_api POST "/auth/login" "Login empty body" '{}' "" "400"
test_api GET "/auth/me" "Get me no token" "" "" "401"
test_api GET "/auth/me" "Get me admin" "" "admin" "200"
test_api GET "/auth/me" "Get me student" "" "user" "200"
test_api POST "/auth/forgot-password" "Forgot password" '{"email":"apitest@mdexam.com"}' "" "201"

echo -e "\n--- 2. SUBSCRIPTION PLANS ---"
test_api GET "/subscription-plans" "List plans" "" "" "200"

PLAN_ID=$(curl -s "$BASE/subscription-plans" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
if [ -n "$PLAN_ID" ]; then
  test_api GET "/subscription-plans" "List plans admin" "" "admin" "200"
  test_api POST "/subscription-plans" "Create plan" '{"name":{"en":"Test Plan"},"description":{"en":"Test"},"price":9.99,"interval":"month","currency":"USD"}' "admin" "201"
  
  NEW_PLAN_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/subscription-plans" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for p in d:
  if 'Test Plan' in str(p.get('name',{}).get('en','')):
    print(p['id']); break
" 2>/dev/null)
  if [ -n "$NEW_PLAN_ID" ]; then
    test_api PATCH "/subscription-plans/$NEW_PLAN_ID" "Update plan" '{"price":19.99}' "admin" "200"
    test_api DELETE "/subscription-plans/$NEW_PLAN_ID" "Delete plan" "" "admin" "200"
  fi
fi

echo -e "\n--- 3. COURSES ---"
test_api GET "/courses" "List courses no auth" "" "" "401"
test_api GET "/courses" "List courses student" "" "user" "200"
test_api GET "/courses?all=true" "List all courses admin" "" "admin" "200"

# Create test course
SLUG="api-test-$(date +%s)"
test_api POST "/courses" "Create course" "{\"title\":{\"en\":\"API Test Course\"},\"description\":{\"en\":\"Testing\"},\"slug\":\"$SLUG\",\"price\":0,\"durationDays\":30,\"hasCertificate\":true}" "admin" "201"

COURSE_LIST=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/courses?all=true")
COURSE_ID=$(echo "$COURSE_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); ids=[c['id'] for c in d if 'API Test' in str(c.get('title',''))]; print(ids[-1] if ids else '')" 2>/dev/null)
COURSE_SLUG=$(echo "$COURSE_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); slugs=[c['slug'] for c in d if 'API Test' in str(c.get('title',''))]; print(slugs[-1] if slugs else '')" 2>/dev/null)

if [ -n "$COURSE_SLUG" ] && [ "$COURSE_SLUG" != "" ]; then
  test_api GET "/courses/$COURSE_SLUG" "Get course by slug" "" "user" "200"
  test_api GET "/courses/check-enrollment/$COURSE_SLUG" "Check enrollment" "" "user" "200"
  test_api GET "/courses/check-access/$COURSE_SLUG" "Check access" "" "user" "200"
  test_api GET "/courses/$COURSE_SLUG/progress" "Get progress" "" "user" "200"
  test_api GET "/courses/$COURSE_SLUG/comments" "Get comments" "" "user" "200"
  test_api POST "/courses/$COURSE_SLUG/comments" "Add comment" '{"body":"Test comment"}' "user" "201"
  test_api GET "/courses/$COURSE_SLUG/pre-test" "Get pre-test" "" "user" "200"
  test_api GET "/courses/$COURSE_SLUG/post-test" "Get post-test" "" "user" "200"
  test_api GET "/courses/$COURSE_SLUG/test-results" "Get test results" "" "user" "200"
  
  # Enroll
  test_api POST "/courses/$COURSE_SLUG/enroll" "Enroll in course" '{}' "user" "201"
  
  # Modules
  test_api POST "/courses/$COURSE_ID/modules" "Create module" '{"title":{"en":"Test Module"}}' "admin" "201"
  
  MOD_DATA=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/courses/$COURSE_SLUG")
  MODULE_ID=$(echo "$MOD_DATA" | python3 -c "import sys,json; d=json.load(sys.stdin); mods=d.get('modules',[]); print(mods[-1]['id'] if mods else '')" 2>/dev/null)
  
  if [ -n "$MODULE_ID" ] && [ "$MODULE_ID" != "" ]; then
    test_api PATCH "/courses/modules/$MODULE_ID" "Update module" '{"title":{"en":"Updated Module"}}' "admin" "200"
    
    # Lessons
    test_api POST "/courses/modules/$MODULE_ID/lessons" "Create lesson" '{"title":{"en":"Test Lesson"},"contentType":"text","content":"Some content","duration":30}' "admin" "201"
    
    LESSON_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/courses/$COURSE_SLUG" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for m in d.get('modules',[]):
  for l in m.get('lessons',[]):
    print(l['id']); exit()
" 2>/dev/null)
    
    if [ -n "$LESSON_ID" ] && [ "$LESSON_ID" != "" ]; then
      test_api PATCH "/courses/lessons/$LESSON_ID" "Update lesson" '{"title":{"en":"Updated Lesson"}}' "admin" "200"
      test_api POST "/courses/$COURSE_SLUG/lessons/$LESSON_ID/complete" "Complete lesson" '{}' "user" "201"
      test_api POST "/courses/$COURSE_SLUG/lessons/$LESSON_ID/incomplete" "Incomplete lesson" '{}' "user" "201"
      test_api DELETE "/courses/lessons/$LESSON_ID" "Delete lesson" "" "admin" "200"
    fi
    
    test_api DELETE "/courses/modules/$MODULE_ID" "Delete module" "" "admin" "200"
  fi
  
  # Delete course
  test_api DELETE "/courses/$COURSE_ID" "Delete course" "" "admin" "200"
fi

echo -e "\n--- 4. EXAMS ---"
test_api GET "/exams" "List exams public" "" "" "200"
test_api GET "/exams" "List exams admin" "" "admin" "200"

EXAM_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/exams" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
if [ -n "$EXAM_ID" ]; then
  test_api GET "/exams/$EXAM_ID" "Get exam" "" "admin" "200"
  
  # Create exam
  test_api POST "/exams" "Create exam" '{"name":{"en":"Test Exam"},"description":{"en":"Test"},"slug":"test-exam-'$(date +%s)'"}' "admin" "201"
fi

echo -e "\n--- 5. EXAM ATTEMPTS ---"
test_api GET "/exam-attempts" "List attempts admin" "" "admin" "200"
test_api GET "/exam-attempts" "List attempts user" "" "user" "200"

echo -e "\n--- 6. FLASHCARDS ---"
test_api GET "/flashcards" "List flashcards no auth" "" "" "401"
test_api GET "/flashcards" "List flashcards admin" "" "admin" "200"
test_api GET "/flashcards/specialties" "List specialties" "" "admin" "200"
test_api GET "/flashcards/due" "Due flashcards" "" "admin" "200"
test_api GET "/flashcards/exam-history" "Exam history" "" "admin" "200"

echo -e "\n--- 7. QUESTIONS ---"
test_api GET "/questions" "List questions no auth" "" "" "401"
test_api GET "/questions" "List questions admin" "" "admin" "200"

echo -e "\n--- 8. USERS ---"
test_api GET "/users" "List users no auth" "" "" "401"
test_api GET "/users" "List users admin" "" "admin" "200"

if [ -n "$USER_ID" ]; then
  test_api GET "/users/$USER_ID" "Get user by id" "" "admin" "200"
  test_api PATCH "/users/$USER_ID" "Update user" '{"name":"Updated Name"}' "admin" "200"
fi

echo -e "\n--- 9. ARTICLES ---"
test_api GET "/articles" "List articles public" "" "" "200"
test_api POST "/articles" "Create article" '{"title":{"en":"Test Article"},"content":{"en":"Body content"},"slug":"api-test-article-'$(date +%s)'"}' "admin" "201"

ART_LIST=$(curl -s "$BASE/articles")
ART_ID=$(echo "$ART_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
ART_SLUG=$(echo "$ART_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['slug'] if d else '')" 2>/dev/null)
if [ -n "$ART_SLUG" ]; then
  test_api GET "/articles/$ART_SLUG" "Get article by slug" "" "" "200"
fi
if [ -n "$ART_ID" ]; then
  test_api PATCH "/articles/$ART_ID" "Update article" '{"title":{"en":"Updated"}}' "admin" "200"
  test_api DELETE "/articles/$ART_ID" "Delete article" "" "admin" "200"
fi

echo -e "\n--- 10. CERTIFICATES ---"
test_api GET "/certificates" "List certificates" "" "admin" "200"

echo -e "\n--- 11. TESTIMONIALS ---"
test_api GET "/testimonials" "List testimonials public" "" "" "200"
test_api GET "/testimonials/admin" "List testimonials admin" "" "admin" "200"
test_api POST "/testimonials" "Create testimonial" '{"name":{"en":"API Test"},"role":{"en":"User"},"text":{"en":"Great!"}}' "admin" "201"

TEST_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/testimonials/admin" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for t in d:
  if t.get('name',{}).get('en','')=='API Test':
    print(t['id']); break
" 2>/dev/null)
if [ -n "$TEST_ID" ]; then
  test_api PATCH "/testimonials/$TEST_ID" "Update testimonial" '{"text":{"en":"Updated!"}}' "admin" "200"
  test_api DELETE "/testimonials/$TEST_ID" "Delete testimonial" "" "admin" "200"
fi

echo -e "\n--- 12. LANDING ---"
test_api GET "/landing" "Get landing" "" "" "200"
test_api GET "/landing-data" "Get landing data" "" "" "200"

echo -e "\n--- 13. PARAMETERS ---"
test_api GET "/public/parameters" "Public parameters" "" "" "200"
test_api GET "/parameters" "Parameters admin" "" "admin" "200"
test_api POST "/parameters" "Create param" "{\"key\":\"test_$(date +%s)\",\"value\":\"test\"}" "admin" "201"

echo -e "\n--- 14. TRANSLATIONS ---"
test_api GET "/translations" "Translations no auth" "" "" "401"
test_api GET "/translations" "Translations admin" "" "admin" "200"

echo -e "\n--- 15. LEADS ---"
test_api POST "/leads" "Create lead" '{"name":"API Lead","email":"apilead_'$(date +%s)'@test.com"}' "" "201"
test_api GET "/leads" "List leads admin" "" "admin" "200"

echo -e "\n--- 16. UPLOAD ---"
test_api POST "/upload/presigned-url" "Presigned URL" '{"key":"uploads/test.jpg","contentType":"image/jpeg"}' "admin" "201"

echo -e "\n--- 17. CALENDAR ---"
test_api GET "/calendar" "List events" "" "admin" "200"
test_api POST "/calendar" "Create event" '{"title":{"en":"Test Event"},"description":{"en":"Test desc"},"eventDate":"2026-09-10T10:00:00Z","eventType":"exam"}' "admin" "201"

CAL_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/calendar" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for ev in d:
  if ev.get('title',{}).get('en','')=='Test Event':
    print(ev['id']); break
" 2>/dev/null)
if [ -n "$CAL_ID" ]; then
  test_api PATCH "/calendar/$CAL_ID" "Update event" '{"title":{"en":"Updated Event"}}' "admin" "200"
  test_api DELETE "/calendar/$CAL_ID" "Delete event" "" "admin" "200"
fi

echo -e "\n--- 18. ANALYTICS ---"
test_api GET "/analytics/user-stats" "User stats" "" "admin" "200"
test_api GET "/analytics/progress" "Progress" "" "admin" "200"
test_api GET "/analytics/admin" "Admin analytics" "" "admin" "200"
test_api GET "/analytics/admin/dau" "DAU" "" "admin" "200"
test_api GET "/analytics/admin/mau" "MAU" "" "admin" "200"

echo -e "\n--- 19. SUBSCRIPTIONS ---"
test_api GET "/subscriptions/my" "My subscription admin" "" "admin" "200"
test_api GET "/subscriptions/my" "My subscription user" "" "user" "200"
test_api GET "/subscriptions/upgrade-plans" "Upgrade plans" "" "user" "200"

echo -e "\n--- 20. VIDEOS ---"
test_api GET "/videos" "List videos" "" "admin" "200"

echo -e "\n--- 21. STREAM ---"
test_api GET "/stream/videos" "Stream videos" "" "admin" "200"
test_api GET "/stream/modules" "Stream modules" "" "admin" "200"

echo -e "\n========================================="
echo "  RESULTS SUMMARY"
echo -e "========================================="
echo -e "$RESULTS"
echo -e "\n========================================="
echo -e "  TOTAL: $((PASS + FAIL)) | PASSED: $PASS | FAILED: $FAIL"
echo -e "========================================="
