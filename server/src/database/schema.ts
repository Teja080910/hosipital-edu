import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  decimal,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userRole = pgTable("user_role", {
  value: text("value").primaryKey(),
});

export const difficultyEnum = pgTable("difficulty_enum", {
  value: text("value").primaryKey(),
});

export const attemptModeEnum = pgTable("attempt_mode_enum", {
  value: text("value").primaryKey(),
});

export const attemptStatusEnum = pgTable("attempt_status_enum", {
  value: text("value").primaryKey(),
});

export const courseContentTypeEnum = pgTable("course_content_type_enum", {
  value: text("value").primaryKey(),
});

export const quizTypeEnum = pgTable("quiz_type_enum", {
  value: text("value").primaryKey(),
});

export const enrollmentStatusEnum = pgTable("enrollment_status_enum", {
  value: text("value").primaryKey(),
});

export const subscriptionIntervalEnum = pgTable("subscription_interval_enum", {
  value: text("value").primaryKey(),
});

export const subscriptionStatusEnum = pgTable("subscription_status_enum", {
  value: text("value").primaryKey(),
});

export const paymentStatusEnum = pgTable("payment_status_enum", {
  value: text("value").primaryKey(),
});

export const eventTypeEnum = pgTable("event_type_enum", {
  value: text("value").primaryKey(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  lastName: text("last_name"),
  phone: text("phone"),
  zipCode: text("zip_code"),
  role: text("role").default("student").notNull(),
  accountType: text("account_type").default("full").notNull(),
  targetExamId: uuid("target_exam_id").references(() => exams.id, { onDelete: "set null" }),
  avatarUrl: text("avatar_url"),
  emailVerifiedAt: timestamp("email_verified_at"),
  googleId: text("google_id").unique(),
  preferredLocale: text("preferred_locale").default("en").notNull(),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull(),
  description: jsonb("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specialties = pgTable("specialties", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  name: jsonb("name").notNull(),
  slug: text("slug").notNull(),
  maxQuestions: integer("max_questions"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  specialtyId: uuid("specialty_id")
    .notNull()
    .references(() => specialties.id, { onDelete: "cascade" }),
  name: jsonb("name").notNull(),
  slug: text("slug").notNull(),
  maxQuestions: integer("max_questions"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subtopics = pgTable("subtopics", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  name: jsonb("name").notNull(),
  slug: text("slug").notNull(),
  maxQuestions: integer("max_questions"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  specialtyId: uuid("specialty_id")
    .references(() => specialties.id),
  topicId: uuid("topic_id")
    .references(() => topics.id),
  subtopicId: uuid("subtopic_id").references(() => subtopics.id, {
    onDelete: "set null",
  }),
  text: text("text").notNull(),
  explanation: text("explanation").notNull(),
  reference: text("reference"),
  difficulty: text("difficulty").notNull().default("medium"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionOptions = pgTable("question_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionImages = pgTable("question_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  section: text("section").notNull().default("title"),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const examAttempts = pgTable("exam_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  examId: uuid("exam_id")
    .notNull()
    .references(() => exams.id),
  mode: text("mode").notNull().default("practice"),
  status: text("status").notNull().default("in_progress"),
  customTitle: text("custom_title"),
  questionCount: integer("question_count").notNull().default(0),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  timeLimit: integer("time_limit"),
  timeSpent: integer("time_spent").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examAnswers = pgTable("exam_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => examAttempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
  selectedOptionId: uuid("selected_option_id").references(
    () => questionOptions.id,
    { onDelete: "set null" },
  ),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").default(0).notNull(),
  isFlagged: boolean("is_flagged").default(false).notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const userQuestionProgress = pgTable(
  "user_question_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    timesAnswered: integer("times_answered").default(0).notNull(),
    timesCorrect: integer("times_correct").default(0).notNull(),
    lastAnsweredAt: timestamp("last_answered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userQuestionIdx: uniqueIndex("uq_user_question_idx").on(
      table.userId,
      table.questionId,
    ),
  }),
);

export const flashcards = pgTable("flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  specialtyId: uuid("specialty_id").references(() => specialties.id, {
    onDelete: "set null",
  }),
  topicId: uuid("topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  reference: text("reference"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userFlashcardReviews = pgTable(
  "user_flashcard_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    flashcardId: uuid("flashcard_id")
      .notNull()
      .references(() => flashcards.id, { onDelete: "cascade" }),
    easeFactor: integer("ease_factor").default(250).notNull(),
    interval: integer("interval").default(0).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReviewAt: timestamp("next_review_at").notNull(),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userFlashcardIdx: uniqueIndex("ufr_user_flashcard_idx").on(
      table.userId,
      table.flashcardId,
    ),
  }),
);

export const videoModules = pgTable("video_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  maxWatching: integer("max_watching"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoLessons = pgTable("video_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => videoModules.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  videoUrl: text("video_url"),
  duration: integer("duration").notNull().default(0),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userVideoProgress = pgTable(
  "user_video_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => videoLessons.id, { onDelete: "cascade" }),
    watchedSeconds: integer("watched_seconds").default(0).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    lastWatchedAt: timestamp("last_watched_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userLessonIdx: uniqueIndex("uvp_user_lesson_idx").on(
      table.userId,
      table.lessonId,
    ),
  }),
);

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  shortDescription: jsonb("short_description"),
  coverImage: text("cover_image"),
  introduction: jsonb("introduction"),
  objectives: jsonb("objectives"),
  targetAudience: jsonb("target_audience"),
  prerequisites: jsonb("prerequisites"),
  whatYouWillLearn: jsonb("what_you_will_learn"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  stripePriceId: text("stripe_price_id"),
  durationDays: integer("duration_days").notNull().default(0),
  hasCertificate: boolean("has_certificate").default(true).notNull(),
  certificateTemplateId: uuid("certificate_template_id").references(
    () => certificateTemplates.id,
    { onDelete: "set null" },
  ),
  preExamInstructions: jsonb("pre_exam_instructions"),
  postExamInstructions: jsonb("post_exam_instructions"),
  certificateInstructions: jsonb("certificate_instructions"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseModules = pgTable("course_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseLessons = pgTable("course_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  contentType: text("content_type").notNull().default("video"),
  videoUrl: text("video_url"),
  pdfUrl: text("pdf_url"),
  imageUrl: text("image_url"),
  content: text("content"),
  duration: integer("duration").notNull().default(0),
  sortOrder: integer("sort_order").default(0).notNull(),
  isFreePreview: boolean("is_free_preview").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseQuizzes = pgTable("course_quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => courseLessons.id, {
    onDelete: "set null",
  }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("lesson"),
  title: jsonb("title").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseQuizAttempts = pgTable("course_quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => courseQuizzes.id, { onDelete: "cascade" }),
  score: integer("score").default(0).notNull(),
  totalQuestions: integer("total_questions").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  answers: jsonb("answers").notNull().default([]),
  passed: boolean("passed").default(false).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCourseEnrollments = pgTable("user_course_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  stripePaymentId: text("stripe_payment_id"),
  accessExpiresAt: timestamp("access_expires_at").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCourseProgress = pgTable("user_course_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => courseModules.id),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => courseLessons.id),
  isCompleted: boolean("is_completed").default(false).notNull(),
  quizScore: integer("quiz_score"),
  quizPassed: boolean("quiz_passed"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseComments = pgTable("course_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  lessonId: uuid("lesson_id").references(() => courseLessons.id, {
    onDelete: "set null",
  }),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const certificateTemplates = pgTable("certificate_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  backgroundUrl: text("background_url"),
  fontFamily: text("font_family"),
  textColor: text("text_color"),
  layoutConfig: jsonb("layout_config"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  templateId: uuid("template_id")
    .notNull()
    .references(() => certificateTemplates.id),
  certificateNumber: text("certificate_number").notNull().unique(),
  studentName: text("student_name").notNull(),
  courseName: jsonb("course_name").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  qrCodeUrl: text("qr_code_url"),
  pdfUrl: text("pdf_url"),
  verificationHash: text("verification_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  stripePriceId: text("stripe_price_id").unique(),
  name: jsonb("name").notNull(),
  description: jsonb("description").notNull(),
  interval: text("interval").notNull().default("month"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  maxQuestions: integer("max_questions"),
  maxFlashcards: integer("max_flashcards"),
  maxVideos: integer("max_videos"),
  maxExamAttempts: integer("max_exam_attempts"),
  maxFlashcardAttempts: integer("max_flashcard_attempts"),
  maxDays: integer("max_days"),
  maxUses: integer("max_uses"),
  isDefault: boolean("is_default").default(false),
  isCourseOnly: boolean("is_course_only").default(false),
  isVisible: boolean("is_visible").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  canceledAt: timestamp("canceled_at"),
  remainingExamAttempts: integer("remaining_exam_attempts"),
  remainingFlashcardAttempts: integer("remaining_flashcard_attempts"),
  remainingUses: integer("remaining_uses"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  paymentNumber: text("payment_number"),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull().default("pending"),
  description: text("description"),
  payableType: text("payable_type"),
  payableId: text("payable_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time"),
  eventType: text("event_type").notNull().default("exam"),
  pdfUrl: text("pdf_url"),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleCategories = pgTable("article_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articleTags = pgTable("article_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => articleCategories.id, {
    onDelete: "set null",
  }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").notNull(),
  excerpt: jsonb("excerpt"),
  content: jsonb("content").notNull(),
  coverImage: text("cover_image"),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  isSubscriberOnly: boolean("is_subscriber_only").default(false).notNull(),
  videoUrl: text("video_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const articleTagsMapping = pgTable(
  "article_tags_mapping",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => articleTags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  }),
);

export const translations = pgTable(
  "translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    locale: text("locale").notNull(),
    value: text("value").notNull(),
    namespace: text("namespace").notNull().default("common"),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyLocaleIdx: uniqueIndex("trans_key_locale_idx").on(
      table.key,
      table.locale,
    ),
  }),
);

export const landingPageConfig = pgTable("landing_page_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  section: text("section").notNull(),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemParameters = pgTable("system_parameters", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: jsonb("name").notNull(),
  role: jsonb("role").notNull(),
  text: jsonb("text").notNull(),
  rating: integer("rating").default(5).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});