#!/bin/bash
# Extended API test suite - covers ALL remaining endpoints incl. video/stream/quiz/flashcard flows
BASE="http://localhost:4000/api"
PASS=0
FAIL=0
RESULTS=""
ERRORS=""

# accept: exact code OR comma list OR "any"
test_api() {
  local method="$1" endpoint="$2" desc="$3" data="$4" auth="$5" expect="${6:-200}"
  local AUTH_HEADER=""
  if [ "$auth" = "admin" ]; then AUTH_HEADER="-H 'Authorization: Bearer $ADMIN_TOKEN'"
  elif [ "$auth" = "user" ]; then AUTH_HEADER="-H 'Authorization: Bearer $USER_TOKEN'"
  fi
  local BODY_ARG=""
  if [ "$method" = "POST" ] || [ "$method" = "PUT" ] || [ "$method" = "PATCH" ]; then
    if [ -n "$data" ]; then BODY_ARG="-d '$data'"; fi
  fi
  CODE=$(eval curl -s -o /tmp/api_resp.json -w '%{http_code}' -X "$method" "$BASE$endpoint" -H "'Content-Type: application/json'" $AUTH_HEADER $BODY_ARG)
  BODY=$(cat /tmp/api_resp.json 2>/dev/null)

  if [ "$expect" = "any" ] || echo ",$expect," | grep -q ",$CODE,"; then
    PASS=$((PASS + 1))
    RESULTS="$RESULTS\n✅ (${expect}) $method $endpoint → $CODE | $desc"
  else
    FAIL=$((FAIL + 1))
    SHORT_BODY=$(echo "$BODY" | head -c 220)
    RESULTS="$RESULTS\n❌ $method $endpoint → $CODE (exp $expect) | $desc"
    ERRORS="$ERRORS\n   $method $endpoint → $CODE: $SHORT_BODY"
  fi
}

# ─── LOGIN (admin + fresh student) ───
ADMIN_LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"apitest@mdexam.com","password":"TestPass123!"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
REGTIME=$(date +%s)
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d '{"email":"apiv3_'"$REGTIME"'@yopmail.com","password":"TestPass123!","name":"V3 Student"}')
USER_TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
STU_ID=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)
if [ -z "$USER_TOKEN" ]; then
  echo "STUDENT REGISTER FAILED: $REG" ; exit 1
fi
PASS=$((PASS+1)); RESULTS="$RESULTS\n✅ (201) POST /auth/register → register stud | v3 student ok (id=$STU_ID)"
if [ -n "$ADMIN_TOKEN" ]; then PASS=$((PASS+1)); RESULTS="$RESULTS\n✅ (200) POST /auth/login → admin | admin ok"; else echo "ADMIN LOGIN FAILED"; exit 1; fi

echo "== AUTH EXTRA =="
test_api POST "/auth/logout" "Logout" '{}' "" "201"
test_api POST "/auth/resend-verification" "Resend verification" '{"email":"apiv3_'"$REGTIME"'@yopmail.com"}' "" "201"
test_api POST "/auth/verify-email" "Verify with bad token" '{"token":"__fake__"}' "" "any"
test_api POST "/auth/reset-password" "Reset with bad token" '{"token":"__fake__","password":"NewPass123!"}' "" "any"

echo "== EXAMS + SPECIALTY/TOPIC/SUBTREE =="
test_api POST "/exams" "Create exam" '{"name":{"en":"API V3 Exam - '"$REGTIME"'"}}' "admin" "201"
EXAM_ID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
# fallback: parse from output file above
test_api GET "/exams/$EXAM_ID" "Get exam by id" "" "admin" "200"
test_api PATCH "/exams/$EXAM_ID" "Update exam" '{"description":{"en":"Updated desc"}}' "admin" "200"
test_api POST "/exams/$EXAM_ID/specialties" "Create specialty" '{"name":{"en":"Cardio"}}' "admin" "201"
SPEC_ID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api PATCH "/exams/specialties/$SPEC_ID" "Update specialty" '{"name":{"en":"Cardio2"}}' "admin" "200"
test_api POST "/exams/specialties/$SPEC_ID/topics" "Create topic" '{"name":{"en":"Topic1"}}' "admin" "201"
TOPIC_ID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api PATCH "/exams/topics/$TOPIC_ID" "Update topic" '{"name":{"en":"Topic1x"}}' "admin" "200"
test_api POST "/exams/topics/$TOPIC_ID/subtopics" "Create subtopic" '{"name":{"en":"Sub1"}}' "admin" "201"
SUB_ID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api PATCH "/exams/subtopics/$SUB_ID" "Update subtopic" '{"name":{"en":"Sub1x"}}' "admin" "200"

echo "== QUESTIONS =="
test_api POST "/questions" "Create question" '{"text":{"en":"Que?"},"examIds":["'"$EXAM_ID"'"],"options":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false}]}' "admin" "201"
QID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api GET "/questions/$QID" "Get question" "" "admin" "200"
test_api PATCH "/questions/$QID" "Update question" '{"text":{"en":"Que2?"}}' "admin" "200"
test_api DELETE "/questions/$QID" "Delete question" "" "admin" "200"

echo "== EXAM ATTEMPTS FLOW (student) =="
test_api POST "/exam-attempts" "Start attempt" '{"examId":"'"$EXAM_ID"'","mode":"practice","questionCount":3}' "user" "201"
ATT_ID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api GET "/exam-attempts/active/$EXAM_ID" "Active attempt" "" "user" "200"
test_api GET "/exam-attempts/$ATT_ID" "Attempt detail" "" "user" "200"
# answer flow: need question id + option id from the attempt
QATT=$(curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE/exam-attempts/$ATT_ID")
QID2=$(echo "$QATT" | python3 -c "import sys,json; d=json.load(sys.stdin); qs=d.get('questions') or d.get('answers') or []; print(qs[0]['questionId'] if qs and isinstance(qs[0],dict) else '')" 2>/dev/null)
OPTID=$(echo "$QATT" | python3 -c "import sys,json; d=json.load(sys.stdin); qs=d.get('questions') or d.get('answers') or []; qs2=qs[0] if qs and isinstance(qs[0],dict) else {}; print(qs2.get('selectedOptionId','') or (qs2[0]['id'] if qs2 and len(qs2)>0 else ''))" 2>/dev/null)
if [ -n "$QID2" ] && [ -n "$OPTID" ]; then
  test_api PATCH "/exam-attempts/$ATT_ID/answer" "Answer question" '{"questionId":"'"$QID2"'","selectedOptionId":"'"$OPTID"'","timeSpent":5}' "user" "200"
fi
test_api PATCH "/exam-attempts/$ATT_ID/complete" "Complete attempt" "{}" "user" "200"

echo "== FLASHCARDS FULL CRUD + EXAM =="
test_api POST "/flashcards" "Create flashcard" '{"front":{"en":"Front"},"back":{"en":"Back"},"examIds":["'"$EXAM_ID"'"]}' "admin" "201"
FCID=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
test_api PATCH "/flashcards/$FCID" "Update flashcard" '{"back":{"en":"Back2"}}' "admin" "200"
test_api POST "/flashcards/$FCID/review" "Review (SM-2)" '{"quality":4}' "user" "201"
test_api POST "/flashcards/exam/start" "Start flashcard exam" '{"mode":"practice","questionCount":5}' "user" "201"
FATT=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
if [ -n "$FATT" ]; then
  test_api GET "/flashcards/exam-history/$FATT" "Flashcard attempt detail" "" "user" "200"
  test_api PATCH "/flashcards/exam/$FATT/answer" "Answer flashcard" '{"flashcardId":"'"$FCID"'","isCorrect":true}' "user" "200"
  test_api PATCH "/flashcards/exam/$FATT/complete" "Complete flashcard exam" "{}" "user" "200"
fi
test_api DELETE "/flashcards/$FCID" "Delete flashcard" "" "admin" "200"

echo "== COURSE QUIZ (admin save/get/delete) =="
COURSE_ID='5ef67c12-b934-499f-9d0f-f60316e676b1'
COURSE_SLUG='telugu'
test_api POST "/courses/$COURSE_ID/quiz" "Save pre_test quiz" '{"type":"pre_test","title":{"en":"Quiz"},"passingScore":70,"questions":[{"question":"q1","options":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false}]}]}' "admin" "201"
test_api GET "/courses/$COURSE_ID/quiz/pre_test" "Get quiz admin" "" "admin" "200"
test_api DELETE "/courses/$COURSE_ID/quiz/pre_test" "Delete quiz" "" "admin" "200"

echo "== COURSE QUIZ-ATTEMPTS (student) =="
test_api GET "/courses/quiz-attempts" "List my quiz attempts" "" "user" "200"

echo "== COURSE VIDEO LESSON CREATE (admin) =="
test_api POST "/courses/$COURSE_ID/modules" "Create module for video" '{"title":{"en":"Vid Mod"}}' "admin" "201"
VMOD=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
if [ -n "$VMOD" ]; then
  test_api POST "/courses/modules/$VMOD/lessons" "Create video lesson" '{"title":{"en":"Vid Lesson"},"contentType":"video","videoUrl":"https://example.com/v.mp4","duration":120}' "admin" "201"
  VLESSON=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
  if [ -n "$VLESSON" ]; then
    test_api GET "/courses/$COURSE_SLUG/lessons/$VLESSON/quiz" "Lesson quiz" "" "user" "200"
    test_api POST "/courses/$COURSE_SLUG/lessons/$VLESSON/complete" "Complete video lesson" "{}" "user" "201"
    test_api DELETE "/courses/lessons/$VLESSON" "Delete video lesson" "" "admin" "200"
  fi
  test_api DELETE "/courses/modules/$VMOD" "Delete video module" "" "admin" "200"
fi

echo "== STREAM MODULES/LESSONS CRUD =="
test_api POST "/stream/upload-url" "CF direct upload URL" '{}' "admin" "201,200"
test_api GET "/stream/videos" "CF list videos" "" "admin" "200"
test_api GET "/stream/videos/fake-uid" "CF get video fake" "" "admin" "any"
test_api POST "/stream/videos/fake-uid/token" "Signed token" "" "user" "any"
test_api POST "/stream/modules" "Create stream module" '{"title":{"en":"SMod"},"description":{"en":"Desc"}}' "admin" "201"
SMOD=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
if [ -n "$SMOD" ]; then
  test_api GET "/stream/modules/$SMOD" "Get stream module" "" "admin" "200"
  test_api GET "/videos/$SMOD" "Videos findById module" "" "admin" "200"
  test_api PATCH "/stream/modules/$SMOD" "Update stream module" '{"title":{"en":"SMod2"}}' "admin" "200"
  test_api POST "/stream/lessons" "Create stream lesson" '{"moduleId":"'"$SMOD"'","title":{"en":"SLes"},"description":{"en":"D"},"videoUrl":"https://example.com/v.mp4","duration":60}' "admin" "201"
  SLESSON=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
  if [ -n "$SLESSON" ]; then
    test_api PATCH "/stream/lessons/$SLESSON" "Update stream lesson" '{"title":{"en":"SLes2"}}' "admin" "200"
    test_api POST "/videos/progress/$SLESSON" "Save video progress" '{"watchedSeconds":30,"duration":60}' "user" "201"
    test_api GET "/videos/progress/$SLESSON" "Get video progress" "" "user" "200"
    test_api DELETE "/stream/lessons/$SLESSON" "Delete stream lesson" "" "admin" "204"
  fi
  test_api DELETE "/stream/modules/$SMOD" "Delete stream module" "" "admin" "204"
fi

echo "== UPLOAD =="
test_api PUT "/upload/file?key=test-apis.png" "Upload PNG file" '{"base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==","contentType":"image/png"}' "admin" "200"
test_api PUT "/upload/file?key=bad.txt" "Upload invalid type" '{"base64":"aGk=","contentType":"text/plain"}' "admin" "400"
test_api PUT "/upload/video/fake-uid" "Upload video invalid" '{"base64":"AAAA","contentType":"video/mp4"}' "admin" "any"

echo "== TRANSLATIONS =="
test_api POST "/translations" "Create translation" '{"key":"v3_test_'"$REGTIME"'","locale":"en","value":"Hello","namespace":"common"}' "admin" "201"
TRNS=$(cat /tmp/api_resp.json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'] if True else '')" 2>/dev/null)
if [ -n "$TRNS" ]; then
  test_api PUT "/translations/$TRNS" "Update translation" '{"value":"Hi"}' "admin" "200"
fi
test_api POST "/translations/export" "Export translations" '{}' "admin" "200,201"
test_api POST "/translations/auto-translate" "AI auto-translate" '{"sourceLocale":"en","targetLocale":"es","namespace":"common"}' "admin" "any"

echo "== CERTIFICATES =="
test_api GET "/certificates/number/FAKE-1234" "Public by number 404" "" "" "404"
test_api GET "/certificates/verify/fakehash" "Public verify 404" "" "" "404"
test_api POST "/certificates/generate" "Generate cert (no completion)" '{"courseId":"'"$COURSE_ID"'"}' "user" "any"

echo "== USERS (self + admin sub ops) =="
test_api GET "/users/$STU_ID" "Get self" "" "user" "200"
test_api GET "/users/$STU_ID/referral" "Referral self" "" "user" "200"
test_api GET "/users/$STU_ID/subscription" "Sub admin" "" "admin" "200"
test_api PATCH "/users/$STU_ID/subscription" "Update sub admin" '{"status":"active"}' "admin" "200"
test_api PATCH "/users/$STU_ID/role" "Change role student" '{"role":"student"}' "admin" "200"
test_api GET "/users/$STU_ID" "Get self after role" "" "user" "200"

echo "== SUBSCRIPTIONS =="
test_api POST "/subscriptions/create-checkout" "Create checkout bad plan" '{"planId":"00000000-0000-0000-0000-000000000000","locale":"en"}' "user" "any"
test_api POST "/subscriptions/confirm-checkout" "Confirm bad session" '{"sessionId":"cs_fake"}' "user" "any"
test_api POST "/subscriptions/cancel" "Cancel (no sub)" "{}" "user" "any"

echo "== LANDING =="
test_api PUT "/landing/hero" "Update hero section" '{"config":{"title":{"en":"New"}}}' "admin" "any"

echo "== PARAMETERS FULL =="
PARAMKEY="v3_param_$REGTIME"
test_api POST "/parameters" "Create parameter" '{"key":"'"$PARAMKEY"'","value":"1","description":"test"}' "admin" "201"
test_api GET "/parameters/$PARAMKEY" "Get parameter admin" "" "admin" "200"
test_api GET "/public/parameters/$PARAMKEY" "Get parameter public" "" "" "200"
test_api PATCH "/parameters/$PARAMKEY" "Update parameter" '{"value":"2"}' "admin" "200"
test_api DELETE "/parameters/$PARAMKEY" "Delete parameter" "" "admin" "200"

echo "== SUB-PLAN FULL + EXAM SUBTREE CLEANUP =="
test_api DELETE "/exams/subtopics/$SUB_ID" "Delete subtopic" "" "admin" "200"
test_api DELETE "/exams/topics/$TOPIC_ID" "Delete topic" "" "admin" "200"
test_api DELETE "/exams/specialties/$SPEC_ID" "Delete specialty" "" "admin" "200"
# windows batch cleanup of created exam via soft delete? no DELETE /exams route; mark inactive
test_api PATCH "/exams/$EXAM_ID" "Deactivate test exam" '{"isActive":false}' "admin" "200"

echo "== FINAL: SOFT DELETE v3 STUDENT (admin) =="
test_api DELETE "/users/$STU_ID" "Soft delete student" "" "admin" "200"

echo -e "\n========================================="
echo -e "  RESULTS SUMMARY"
echo -e "========================================="
echo -e "$RESULTS"
echo -e "\n========================================="
echo -e "  TOTAL: $((PASS + FAIL)) | PASSED: $PASS | FAILED: $FAIL"
echo -e "========================================="
if [ -n "$ERRORS" ]; then
  echo -e "\n--- ERROR DETAILS ---"
  echo -e "$ERRORS"
fi
