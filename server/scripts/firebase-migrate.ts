import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq } from "drizzle-orm";
import * as schema from "../src/database/schema";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is required");
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const DATA_DIR = path.join(__dirname, "../exports");

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (typeof val._seconds === "number") return new Date(val._seconds * 1000 + (val._nanoseconds || 0) / 1e6);
  return null;
}

function getFlashcardBack(f: any): string {
  if (f.answers && f.answers.length) {
    const correct = f.answers.find((a: any) => a.isCorrect);
    return (correct?.title || f.answers[0].title) ?? "";
  }
  return f.explanation || "";
}

let totalUsers = 0;
let totalPlans = 0;
let totalQuestions = 0;
let totalOptions = 0;
let totalImages = 0;
let totalFlashcards = 0;
let totalModules = 0;
let totalLessons = 0;
let totalPayments = 0;
let totalTranslations = 0;
let totalUserSubscriptions = 0;
let totalExamAttempts = 0;
let totalExamAnswers = 0;
let totalUserQuestionProgress = 0;
let totalFlashcardReviews = 0;

// ─── Exam / Category helpers ─────────────────────────────────────────────────

const EXAMS = [
  { slug: "enarm", name: { en: "ENARM", es: "ENARM" }, description: { en: "Examen Nacional de Aspirantes a Residencias Médicas - Mexico", es: "Examen Nacional de Aspirantes a Residencias Médicas - México" }, sortOrder: 0 },
  { slug: "enurm", name: { en: "ENURM", es: "ENURM" }, description: { en: "Examen Nacional de Ubicación y Recursos Médicos - Mexico", es: "Examen Nacional de Ubicación y Recursos Médicos - México" }, sortOrder: 1 },
  { slug: "mir", name: { en: "MIR", es: "MIR" }, description: { en: "Médico Interno Residente - Spain", es: "Médico Interno Residente - España" }, sortOrder: 2 },
  { slug: "usmle-step-1", name: { en: "USMLE Step 1", es: "USMLE Step 1" }, description: { en: "United States Medical Licensing Examination - Step 1", es: "United States Medical Licensing Examination - Step 1" }, sortOrder: 3 },
];

const EXAM_TYPE_TO_SLUG: Record<string, string> = {
  ENARM: "enarm", ENURM: "enurm", MIR: "mir", USMLE: "usmle-step-1",
};

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function getCatIdFromDoc(doc: any): string | null {
  const parts = (doc._id || "").split("_I_");
  if (parts.length === 2 && parts[0].startsWith("C_")) return parts[0].slice(2);
  return null;
}

function detectExamSlug(catTitle: string): string {
  const upper = catTitle.toUpperCase();
  if (upper.startsWith("ENARM -") || upper.includes("- ENARM")) return "enarm";
  if (upper.startsWith("ENURM -")) return "enurm";
  if (upper.startsWith("USMLE")) return "usmle-step-1";
  return "mir";
}

async function ensureExams(): Promise<Record<string, string>> {
  console.log("\n=== Ensuring Exams ===");
  const slugToId: Record<string, string> = {};
  for (const ex of EXAMS) {
    const { rows } = await pool.query("SELECT id FROM exams WHERE slug = $1", [ex.slug]);
    if (rows.length) {
      slugToId[ex.slug] = rows[0].id;
      console.log(`  Exam exists: ${ex.slug}`);
    } else {
      const r = await pool.query(
        "INSERT INTO exams (slug, name, description, sort_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id",
        [ex.slug, JSON.stringify(ex.name), JSON.stringify(ex.description), ex.sortOrder],
      );
      slugToId[ex.slug] = r.rows[0].id;
      console.log(`  Created exam: ${ex.slug}`);
    }
  }
  return slugToId;
}

async function getOrCreateSpecialtyTopic(
  examId: string, catTitle: string, type: string = "question",
): Promise<{ specialtyId: string; topicId: string }> {
  const slug = toSlug(catTitle);
  let { rows: specs } = await pool.query(
    "SELECT id FROM specialties WHERE exam_id = $1 AND slug = $2", [examId, slug],
  );
  const specialtyId = specs.length
    ? specs[0].id
    : (await pool.query(
        "INSERT INTO specialties (exam_id, name, slug, type, sort_order) VALUES ($1, $2, $3, $4, 0) RETURNING id",
        [examId, JSON.stringify({ en: catTitle, es: catTitle }), slug, type],
      )).rows[0].id;

  let { rows: topics } = await pool.query(
    "SELECT id FROM topics WHERE specialty_id = $1 AND slug = $2", [specialtyId, slug],
  );
  const topicId = topics.length
    ? topics[0].id
    : (await pool.query(
        "INSERT INTO topics (specialty_id, name, slug, sort_order) VALUES ($1, $2, $3, 0) RETURNING id",
        [specialtyId, JSON.stringify({ en: catTitle, es: catTitle }), slug],
      )).rows[0].id;

  return { specialtyId, topicId };
}

function readDocs(file: string): any[] {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) {
    console.log(`  File not found: ${file}, skipping`);
    return [];
  }
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

// ─── Migrations ─────────────────────────────────────────────────────────────

async function migrateUsers(docs: any[]) {
  console.log("\n=== Users (appusers → users) ===");
  let adminId: string | null = null;

  for (const doc of docs) {
    try {
      const f = doc;
      const email = (f.username || "").toLowerCase().trim();
      if (!email) continue;

      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
      if (existing.length) {
        if (!adminId) adminId = existing[0].id;
        continue;
      }

      const fullName = [f.name, f.lastName].filter(Boolean).join(" ").trim();

      const [user] = (await db
        .insert(schema.users)
        .values({
          email,
          name: fullName || email.split("@")[0],
          lastName: f.lastName || null,
          phone: f.phone || null,
          zipCode: f.zipCode || null,
          role: f.isAdministrator ? "admin" : "student",
          emailVerifiedAt: new Date(),
          createdAt: toDate(f._createTime) || new Date(),
          updatedAt: new Date(),
          deletedAt: f.enabled === false ? new Date() : null,
        })
        .returning()) as any[];

      if (!adminId) adminId = user.id;
      totalUsers++;
    } catch (err: any) {
      console.error(`  Error migrating user: ${err.message}`);
    }
  }

  if (!adminId) {
    const [admin] = (await db
      .insert(schema.users)
      .values({
        email: "admin@mdexam.com",
        name: "Admin",
        role: "admin",
        emailVerifiedAt: new Date(),
      })
      .returning()) as any[];
    adminId = admin.id;
  }

  console.log(`  Users imported: ${totalUsers}`);
  return adminId;
}

async function migrateMemberships(docs: any[]) {
  console.log("\n=== Memberships (memberships → subscription_plans) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const title = f.title || "Untitled Plan";

      let interval = "month";
      if (f.maxDays >= 350) interval = "year";
      else if (f.maxDays >= 80) interval = "quarter";

      const planData = {
        name: { en: title, es: title } as any,
        description: { en: f.detail || "", es: f.detail || "" } as any,
        interval,
        price: String(f.price ?? 0),
        currency: "USD",
        maxQuestions: f.maxQuestions ?? null,
        maxFlashcards: f.maxFlashcards ?? null,
        maxVideos: f.maxVideos ?? null,
        isDefault: f.isDefault ?? false,
        isCourseOnly: f.isCourseOnly ?? false,
        isVisible: f.isVisible ?? true,
        sortOrder: f.order ?? 0,
        isActive: true,
        updatedAt: new Date(),
      };

      const existing = await db
        .select()
        .from(schema.subscriptionPlans)
        .where(sql`${schema.subscriptionPlans.name}->>'en' = ${title}`)
        .limit(1);

      if (existing.length) {
        await db
          .update(schema.subscriptionPlans)
          .set(planData)
          .where(eq(schema.subscriptionPlans.id, existing[0].id));
      } else {
        await db.insert(schema.subscriptionPlans).values({
          ...planData,
          createdAt: toDate(f.creationTime) || new Date(),
        });
      }

      totalPlans++;
    } catch (err: any) {
      console.error(`  Error migrating membership: ${err.message}`);
    }
  }
  console.log(`  Plans imported: ${totalPlans}`);
}

async function migrateQuestions(docs: any[], adminId: string, examSlugToId: Record<string, string>) {
  console.log("\n=== Questions (questions → questions + options + images) ===");

  const catDocs = readDocs("categorys.json");
  const catMap: Record<string, string> = {};
  for (const c of catDocs) catMap[c.id] = c.title;

  const specTopicCache: Record<string, { specialtyId: string; topicId: string }> = {};
  let inserted = 0;
  let skipped = 0;

  for (const doc of docs) {
    try {
      const f = doc;
      const text = (f.title || "").trim();
      if (!text) { skipped++; continue; }

      const answers: any[] = (f.answers || []).filter((a: any) => a.title && a.title.trim());
      if (answers.length === 0) { skipped++; continue; }

      // Resolve exam / specialty / topic from category
      const catId = getCatIdFromDoc(doc);
      const catTitle = catMap[catId || ""];
      if (!catTitle) { skipped++; continue; }

      let examSlug = EXAM_TYPE_TO_SLUG[f.examType];
      if (!examSlug) examSlug = detectExamSlug(catTitle);
      const examId = examSlugToId[examSlug];
      if (!examId) { skipped++; continue; }

      const cacheKey = `${examSlug}::${catTitle}`;
      if (!specTopicCache[cacheKey]) {
        specTopicCache[cacheKey] = await getOrCreateSpecialtyTopic(examId, catTitle);
      }
      const { specialtyId, topicId } = specTopicCache[cacheKey];

      // Upsert by unique text
      const existing = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.text, text))
        .limit(1);

      let questionId: string;
      if (existing.length) {
        questionId = existing[0].id;
        await pool.query(
          "UPDATE questions SET exam_id = $1, specialty_id = $2, topic_id = $3 WHERE id = $4",
          [examId, specialtyId, topicId, questionId],
        );
      } else {
        const [question] = (await db
          .insert(schema.questions)
          .values({
            text,
            explanation: f.explanation || "",
            reference: f.reference || null,
            difficulty: "medium",
            isActive: f.isEnabled !== false,
            createdBy: adminId,
            examId,
            specialtyId,
            topicId,
            createdAt: toDate(f.creationTime) || new Date(),
            updatedAt: new Date(),
          })
          .returning()) as any[];
        questionId = question.id;
        inserted++;

        await db.insert(schema.questionOptions).values(
          answers.map((a: any, i: number) => ({
            questionId,
            text: a.title || "",
            isCorrect: a.isCorrect === true,
            sortOrder: i,
          })),
        );
        totalOptions += answers.length;

        const imgFields = [
          { url: f.urlTitle01, sort: 0 },
          { url: f.urlTitle02, sort: 1 },
          { url: f.urlTitle03, sort: 2 },
          { url: f.urlExplanation01, sort: 3 },
          { url: f.urlExplanation02, sort: 4 },
          { url: f.urlExplanation03, sort: 5 },
          { url: f.urlReference01, sort: 6 },
          { url: f.urlReference02, sort: 7 },
          { url: f.urlReference03, sort: 8 },
        ].filter((x) => x.url && x.url.trim());

        if (imgFields.length) {
          await db.insert(schema.questionImages).values(
            imgFields.map((x) => ({
              questionId,
              url: x.url!,
              sortOrder: x.sort,
            })),
          );
          totalImages += imgFields.length;
        }
      }

      // Link to exam via junction table
      await pool.query(
        "INSERT INTO question_exams (question_id, exam_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [questionId, examId],
      );

      totalQuestions++;
    } catch (err: any) {
      console.error(`  Error migrating question: ${err.message}`);
    }
  }
  console.log(`  Questions: ${totalQuestions} (inserted: ${inserted}, skipped: ${skipped}), Options: ${totalOptions}, Images: ${totalImages}`);
}

async function migrateFlashcards(docs: any[], adminId: string, examSlugToId: Record<string, string>) {
  console.log("\n=== Flashcards (flashcardquestions → flashcards) ===");

  const catDocs = readDocs("flashcardcategorys.json");
  const catMap: Record<string, string> = {};
  for (const c of catDocs) catMap[c.id] = c.title;

  const specTopicCache: Record<string, { specialtyId: string; topicId: string }> = {};
  let inserted = 0;
  let skipped = 0;

  for (const doc of docs) {
    try {
      const f = doc;
      const front = (f.title || "").trim();
      if (!front) { skipped++; continue; }

      // Resolve exam / specialty / topic from category
      const catId = getCatIdFromDoc(doc);
      const catTitle = catMap[catId || ""];
      if (!catTitle) { skipped++; continue; }

      const examSlug = detectExamSlug(catTitle);
      const examId = examSlugToId[examSlug];
      if (!examId) { skipped++; continue; }

      const cacheKey = `${examSlug}::${catTitle}`;
      if (!specTopicCache[cacheKey]) {
        specTopicCache[cacheKey] = await getOrCreateSpecialtyTopic(examId, catTitle, "flashcard");
      }
      const { specialtyId, topicId } = specTopicCache[cacheKey];

      // Upsert by unique front
      const existing = await db
        .select()
        .from(schema.flashcards)
        .where(eq(schema.flashcards.front, front))
        .limit(1);

      let flashcardId: string;
      if (existing.length) {
        flashcardId = existing[0].id;
        await pool.query(
          "UPDATE flashcards SET exam_id = $1, specialty_id = $2, topic_id = $3, back = $4, updated_at = NOW() WHERE id = $5",
          [examId, specialtyId, topicId, getFlashcardBack(f), flashcardId],
        );
      } else {
        const [fc] = (await db
          .insert(schema.flashcards)
          .values({
            front,
            back: getFlashcardBack(f),
            reference: f.reference || null,
            isActive: f.isEnabled !== false,
            createdBy: adminId,
            examId,
            specialtyId,
            topicId,
            createdAt: toDate(f.creationTime) || new Date(),
            updatedAt: new Date(),
          })
          .returning()) as any[];
        flashcardId = fc.id;
        inserted++;
      }

      // Link to exam via junction table
      await pool.query(
        "INSERT INTO flashcard_exams (flashcard_id, exam_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [flashcardId, examId],
      );

      totalFlashcards++;
    } catch (err: any) {
      console.error(`  Error migrating flashcard [${doc._id || "?"}]: ${err.message}`);
    }
  }
  console.log(`  Flashcards: ${totalFlashcards} (inserted: ${inserted}, skipped: ${skipped})`);
}

async function migrateVideoCategories(docs: any[]) {
  console.log("\n=== Video Categories (videocategorys → video_modules) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const title = (f.title || "").trim();
      if (!title) continue;

      const existing = await db
        .select()
        .from(schema.videoModules)
        .where(sql`${schema.videoModules.title}->>'en' = ${title}`)
        .limit(1);
      if (existing.length) {
        totalModules++;
        continue;
      }

      await db.insert(schema.videoModules).values({
        title: { en: title, es: title },
        description: { en: "", es: "" },
        maxWatching: f.maxWatching ?? null,
        isActive: true,
        sortOrder: 0,
        createdAt: toDate(f.creationTime) || new Date(),
      });

      totalModules++;
    } catch (err: any) {
      console.error(`  Error migrating video category: ${err.message}`);
    }
  }
  console.log(`  Video modules: ${totalModules}`);
}

async function migrateVideos(docs: any[]) {
  console.log("\n=== Videos (videos → video_lessons) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const title = (f.title || "").trim();
      if (!title) continue;

      let moduleId: string | null = null;
      if (f.category && f.category.title) {
        const mods = await db
          .select()
          .from(schema.videoModules)
          .where(sql`${schema.videoModules.title}->>'en' = ${f.category.title}`)
          .limit(1);
        if (mods.length) moduleId = mods[0].id;
      }

      if (!moduleId) {
        const [mod] = (await db
          .insert(schema.videoModules)
          .values({
            title: { en: title, es: title },
            description: { en: "", es: "" },
            isActive: true,
          })
          .returning()) as any[];
        moduleId = mod.id;
      }

      const existing = await db
        .select()
        .from(schema.videoLessons)
        .where(
          sql`${schema.videoLessons.moduleId} = ${moduleId} AND ${schema.videoLessons.title}->>'en' = ${title}`,
        )
        .limit(1);
      if (existing.length) {
        totalLessons++;
        continue;
      }

      await db.insert(schema.videoLessons).values({
        moduleId: moduleId!,
        title: { en: title, es: title },
        description: { en: "", es: "" },
        videoUrl: f.url || "",
        isActive: f.isEnabled !== false,
        duration: 0,
        sortOrder: 0,
        createdAt: toDate(f.creationTime) || new Date(),
      });

      totalLessons++;
    } catch (err: any) {
      console.error(`  Error migrating video: ${err.message}`);
    }
  }
  console.log(`  Video lessons: ${totalLessons}`);
}

async function migratePayments(docs: any[], adminId: string) {
  console.log("\n=== Payments (appusermembershippurchases → payments) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const paymentNumber = f.paymentNumber || f._id || "";

      const existing = await db
        .select()
        .from(schema.payments)
        .where(sql`${schema.payments.paymentNumber} = ${paymentNumber}`)
        .limit(1);
      if (existing.length) {
        totalPayments++;
        continue;
      }

      const username = (f.username || "").toLowerCase().trim();
      let userId = adminId;
      if (username) {
        const users = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, username))
          .limit(1);
        if (users.length) userId = users[0].id;
      }

      const toMembership = f.toMembership || {};
      const amount = toMembership.price ?? 0;

      await db.insert(schema.payments).values({
        userId,
        paymentNumber,
        amount: String(amount),
        currency: "USD",
        status: "succeeded",
        description: `Membership purchase: ${toMembership.title || ""}`,
        createdAt: toDate(f.creationTime) || new Date(),
      });

      totalPayments++;
    } catch (err: any) {
      console.error(`  Error migrating payment: ${err.message}`);
    }
  }
  console.log(`  Payments: ${totalPayments}`);
}

async function migrateUserSubscriptions(docs: any[], adminId: string) {
  console.log("\n=== User Subscriptions (appusermembershippurchases → user_subscriptions) ===");

  const users = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users);
  const userByEmail: Record<string, string> = {};
  for (const u of users) userByEmail[u.email.toLowerCase()] = u.id;

  const planCache: Record<string, string> = {};
  const existingPlans = await db
    .select({ id: schema.subscriptionPlans.id, name: schema.subscriptionPlans.name })
    .from(schema.subscriptionPlans);
  for (const p of existingPlans) {
    const en = (p.name as any)?.en;
    if (en) planCache[en] = p.id;
  }

  for (const doc of docs) {
    try {
      const f = doc;
      const email = (f.username || "").toLowerCase().trim();
      if (!email) continue;

      const userId = userByEmail[email];
      if (!userId) continue;

      const toMembership = f.toMembership || {};
      const planTitle = (toMembership.title || "").trim();
      if (!planTitle) continue;

      // Get or create plan
      let planId = planCache[planTitle];
      if (!planId) {
        let interval = "month";
        const maxDays = toMembership.maxDays || 30;
        if (maxDays >= 350) interval = "year";
        else if (maxDays >= 80) interval = "quarter";

        const [plan] = (await db
          .insert(schema.subscriptionPlans)
          .values({
            name: { en: planTitle, es: planTitle } as any,
            description: { en: toMembership.detail || "", es: toMembership.detail || "" } as any,
            interval,
            price: String(toMembership.price ?? 0),
            currency: "USD",
            maxQuestions: toMembership.maxQuestions ?? null,
            maxFlashcards: toMembership.maxFlashcards ?? null,
            maxVideos: toMembership.maxVideos ?? null,
            maxUses: toMembership.maxUses ?? null,
            isDefault: toMembership.isDefault ?? false,
            isCourseOnly: toMembership.isCourseOnly ?? false,
            isVisible: toMembership.isVisible ?? true,
            sortOrder: toMembership.order ?? 0,
            isActive: true,
            createdAt: toDate(f.creationTime) || new Date(),
            updatedAt: new Date(),
          })
          .returning()) as any[];
        planId = plan.id;
        planCache[planTitle] = planId;
        console.log(`  Created plan: ${planTitle}`);
      }

      const paymentNumber = f.paymentNumber || f._id || "";
      const existing = await db
        .select()
        .from(schema.userSubscriptions)
        .where(sql`${schema.userSubscriptions.stripeSubscriptionId} = ${paymentNumber}`)
        .limit(1);
      if (existing.length) {
        totalUserSubscriptions++;
        continue;
      }

      const current = f.currentMembership || {};
      const now = new Date();
      const maxDays = toMembership.maxDays || 30;
      const periodEnd = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

      const statusMap: Record<string, string> = { End: "expired", Pending: "active" };
      const fbStatus = f.userMembershipPurchaseStatusModel?.id || "Pending";

      await db.insert(schema.userSubscriptions).values({
        userId,
        planId,
        stripeSubscriptionId: paymentNumber,
        status: statusMap[fbStatus] || "active",
        currentPeriodStart: toDate(f.creationTime) || now,
        currentPeriodEnd: periodEnd,
        remainingExamAttempts: current.maxQuestions ?? null,
        remainingFlashcardAttempts: current.maxFlashcards ?? null,
        remainingUses: current.maxUses ?? null,
        createdAt: toDate(f.creationTime) || now,
        updatedAt: now,
      });

      totalUserSubscriptions++;
    } catch (err: any) {
      console.error(`  Error migrating user subscription: ${err.message}`);
    }
  }
  console.log(`  User subscriptions imported: ${totalUserSubscriptions}`);
}

async function migrateExamHistory(docs: any[], adminId: string, examSlugToId: Record<string, string>) {
  console.log("\n=== Exam History (appuserexams → exam_attempts + exam_answers + user_question_progress) ===");

  const users = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users);
  const userByEmail: Record<string, string> = {};
  for (const u of users) userByEmail[u.email.toLowerCase()] = u.id;

  const questions = await db
    .select({ id: schema.questions.id, text: schema.questions.text })
    .from(schema.questions);
  const questionByText: Record<string, string> = {};
  const questionByPrefix: Record<string, string> = {};
  for (const q of questions) {
    if (!questionByText[q.text]) questionByText[q.text] = q.id;
    const prefix = q.text.slice(0, 60);
    if (!questionByPrefix[prefix]) questionByPrefix[prefix] = q.id;
  }

  const options = await db
    .select({
      id: schema.questionOptions.id,
      questionId: schema.questionOptions.questionId,
      text: schema.questionOptions.text,
    })
    .from(schema.questionOptions);
  const optionByQText: Record<string, Record<string, string>> = {};
  for (const o of options) {
    if (!optionByQText[o.questionId]) optionByQText[o.questionId] = {};
    if (!optionByQText[o.questionId][o.text]) optionByQText[o.questionId][o.text] = o.id;
  }

  for (const doc of docs) {
    try {
      const f = doc;
      const email = (f.username || "").toLowerCase().trim();
      if (!email) continue;
      const userId = userByEmail[email];
      if (!userId) continue;

      const firebaseId = f.id || f._id || "";
      if (!firebaseId) continue;
      const attemptId = crypto.createHash("md5").update("6ba7b810-9dad-11d1-80b4-00c04fd430c8" + firebaseId).digest("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");

      const existing = await db
        .select()
        .from(schema.examAttempts)
        .where(eq(schema.examAttempts.id, attemptId))
        .limit(1);
      if (existing.length) {
        totalExamAttempts++;
        continue;
      }

      const cats = f.categorys || [];
      const catTitle = cats.length > 0 ? (cats[0].title || "") : "";
      const examSlug = detectExamSlug(catTitle);
      const examId = examSlugToId[examSlug];
      if (!examId) continue;

      const qas = f.questionAnswers || [];
      const totalQ = qas.length;
      const answeredQ = qas.filter((qa: any) => qa.answer).length;
      const correctQ = qas.filter((qa: any) => qa.answer?.isCorrect).length;
      const startTime = toDate(f.creationTime) || new Date();
      const endTime = toDate(f.endTime);
      const timeSpent = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      await db.insert(schema.examAttempts).values({
        id: attemptId,
        userId,
        examId,
        mode: f.isOpen ? "practice" : "exam",
        status: "completed",
        customTitle: f.customTitle || null,
        isShowTimeCounter: f.isShowTimeCounter || false,
        questionCount: totalQ,
        answeredCount: answeredQ,
        correctCount: correctQ,
        timeLimit: f.maxTime || null,
        timeSpent,
        startedAt: startTime,
        completedAt: endTime,
        createdAt: startTime,
      });

      totalExamAttempts++;

      for (const qa of qas) {
        const answer = qa.answer;
        if (!answer) continue;

        const qText = (qa.question?.title || "").trim();
        let questionId = questionByText[qText];
        if (!questionId) {
          const prefix = qText.slice(0, 60);
          questionId = questionByPrefix[prefix];
        }
        if (!questionId) continue;

        const answerText = (answer.title || "").trim();
        const optionId = optionByQText[questionId]?.[answerText] || null;

        await db
          .insert(schema.examAnswers)
          .values({
            attemptId,
            questionId,
            selectedOptionId: optionId,
            isCorrect: answer.isCorrect === true,
            timeSpent: 0,
            answeredAt: startTime,
          })
          .onConflictDoNothing();

        totalExamAnswers++;

        const existingProgress = await db
          .select()
          .from(schema.userQuestionProgress)
          .where(
            sql`${schema.userQuestionProgress.userId} = ${userId} AND ${schema.userQuestionProgress.questionId} = ${questionId}`,
          )
          .limit(1);

        if (existingProgress.length) {
          await db
            .update(schema.userQuestionProgress)
            .set({
              timesAnswered: existingProgress[0].timesAnswered + 1,
              timesCorrect: existingProgress[0].timesCorrect + (answer.isCorrect ? 1 : 0),
              lastAnsweredAt: startTime,
              updatedAt: new Date(),
            })
            .where(eq(schema.userQuestionProgress.id, existingProgress[0].id));
        } else {
          await db.insert(schema.userQuestionProgress).values({
            userId,
            questionId,
            timesAnswered: 1,
            timesCorrect: answer.isCorrect ? 1 : 0,
            lastAnsweredAt: startTime,
          });
        }
        totalUserQuestionProgress++;
      }
    } catch (err: any) {
      console.error(`  Error migrating exam: ${err.message}`);
    }
  }
  console.log(`  Exam attempts: ${totalExamAttempts}, Answers: ${totalExamAnswers}, Question progress: ${totalUserQuestionProgress}`);
}

async function migrateFlashcardReviews(docs: any[]) {
  console.log("\n=== Flashcard Reviews (flashcard_sr → user_flashcard_reviews) ===");

  const users = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users);
  const userByEmail: Record<string, string> = {};
  for (const u of users) userByEmail[u.email.toLowerCase()] = u.id;

  const flashcards = await db
    .select({ id: schema.flashcards.id, front: schema.flashcards.front })
    .from(schema.flashcards);
  const flashcardByFront: Record<string, string> = {};
  for (const f of flashcards) {
    if (!flashcardByFront[f.front]) flashcardByFront[f.front] = f.id;
  }

  for (const doc of docs) {
    try {
      const f = doc;
      const email = (f.username || "").toLowerCase().trim();
      if (!email) continue;
      const userId = userByEmail[email];
      if (!userId) continue;

      const flashcardTitle = (f.flashcardTitle || "").trim();
      const flashcardId = flashcardByFront[flashcardTitle];
      if (!flashcardId) continue;

      const existing = await db
        .select()
        .from(schema.userFlashcardReviews)
        .where(
          sql`${schema.userFlashcardReviews.userId} = ${userId} AND ${schema.userFlashcardReviews.flashcardId} = ${flashcardId}`,
        )
        .limit(1);
      if (existing.length) {
        totalFlashcardReviews++;
        continue;
      }

      const lastReview = toDate(f.lastReviewDate) || new Date();
      const nextReview = toDate(f.nextReviewDate) || new Date();

      await db.insert(schema.userFlashcardReviews).values({
        userId,
        flashcardId,
        easeFactor: Math.round((f.easeFactor || 2.5) * 100),
        interval: f.intervalDays || 0,
        repetitions: f.repetitions || 0,
        nextReviewAt: nextReview,
        lastReviewedAt: lastReview,
        createdAt: lastReview,
        updatedAt: lastReview,
      });

      totalFlashcardReviews++;
    } catch (err: any) {
      console.error(`  Error migrating flashcard review: ${err.message}`);
    }
  }
  console.log(`  Flashcard reviews imported: ${totalFlashcardReviews}`);
}

async function migrateFlashcardExamHistory(docs: any[]) {
  console.log("\n=== Flashcard Exam History (appuserflashcardexams → flashcard_exam_attempts + answers) ===");

  const users = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users);
  const userByEmail: Record<string, string> = {};
  for (const u of users) userByEmail[u.email.toLowerCase()] = u.id;

  const flashcards = await db
    .select({ id: schema.flashcards.id, front: schema.flashcards.front })
    .from(schema.flashcards);
  const flashcardByFront: Record<string, string> = {};
  const flashcardByPrefix: Record<string, string> = {};
  for (const f of flashcards) {
    if (!flashcardByFront[f.front]) flashcardByFront[f.front] = f.id;
    const prefix = f.front.slice(0, 60);
    if (!flashcardByPrefix[prefix]) flashcardByPrefix[prefix] = f.id;
  }

  let attempts = 0;
  let answers = 0;
  let skipped = 0;

  for (const doc of docs) {
    try {
      const f = doc;
      const email = (f.username || "").toLowerCase().trim();
      if (!email) { skipped++; continue; }
      const userId = userByEmail[email];
      if (!userId) { skipped++; continue; }

      const firebaseId = f.id || f._id || "";
      if (!firebaseId) { skipped++; continue; }
      const attemptId = crypto.createHash("md5").update("6ba7b810-9dad-11d1-80b4-00c04fd430c8" + firebaseId).digest("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");

      const existing = await db
        .select()
        .from(schema.flashcardExamAttempts)
        .where(eq(schema.flashcardExamAttempts.id, attemptId))
        .limit(1);
      if (existing.length) { attempts++; continue; }

      const qas = f.questionAnswers || [];
      const totalQ = qas.length;
      const answeredQ = qas.filter((qa: any) => qa.answer).length;
      const correctQ = qas.filter((qa: any) => qa.answer?.isCorrect).length;
      const startTime = toDate(f.creationTime) || new Date();
      const endTime = toDate(f.endTime);
      const timeSpent = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      await db.insert(schema.flashcardExamAttempts).values({
        id: attemptId,
        userId,
        mode: f.isOpen ? "practice" : "exam",
        status: "completed",
        customTitle: f.customTitle || null,
        isShowTimeCounter: f.isShowTimeCounter || false,
        questionCount: totalQ,
        answeredCount: answeredQ,
        correctCount: correctQ,
        timeLimit: f.maxTime || null,
        timeSpent,
        startedAt: startTime,
        completedAt: endTime,
      });

      attempts++;

      for (const qa of qas) {
        const answer = qa.answer;
        if (!answer) continue;

        const front = (qa.question?.title || "").trim();
        let flashcardId = flashcardByFront[front];
        if (!flashcardId) {
          const prefix = front.slice(0, 60);
          flashcardId = flashcardByPrefix[prefix];
        }
        if (!flashcardId) continue;

        await db.insert(schema.flashcardExamAnswers).values({
          attemptId,
          flashcardId,
          isCorrect: answer.isCorrect === true,
          answeredAt: startTime,
        });

        answers++;
      }
    } catch (err: any) {
      console.error(`  Error migrating flashcard exam [${doc._id || "?"}]: ${err.message}`);
    }
  }
  console.log(`  Flashcard exam attempts: ${attempts}, Answers: ${answers}, Skipped: ${skipped}`);
}

async function migrateParameters(docs: any[]) {
  console.log("\n=== Parameters (parameters → translations) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const key = f.key2 || "";
      if (!key) continue;

      if (f.title) {
        const exists = await db
          .select()
          .from(schema.translations)
          .where(sql`${schema.translations.key} = ${key} AND ${schema.translations.locale} = 'es'`)
          .limit(1);
        if (!exists.length) {
          await db.insert(schema.translations).values({
            key, locale: "es", value: f.title, namespace: "firebase",
          });
          totalTranslations++;
        }
      }

      if (f.titleEn) {
        const existsEn = await db
          .select()
          .from(schema.translations)
          .where(sql`${schema.translations.key} = ${key} AND ${schema.translations.locale} = 'en'`)
          .limit(1);
        if (!existsEn.length) {
          await db.insert(schema.translations).values({
            key, locale: "en", value: f.titleEn, namespace: "firebase",
          });
          totalTranslations++;
        }
      }

      if (f.additional && typeof f.additional === "string") {
        const addKey = `${key}_additional`;
        const exists = await db
          .select()
          .from(schema.translations)
          .where(sql`${schema.translations.key} = ${addKey} AND ${schema.translations.locale} = 'es'`)
          .limit(1);
        if (!exists.length) {
          await db.insert(schema.translations).values({
            key: addKey, locale: "es", value: f.additional, namespace: "firebase",
          });
          totalTranslations++;
        }
      }
    } catch (err: any) {
      console.error(`  Error migrating parameter: ${err.message}`);
    }
  }
  console.log(`  Translations: ${totalTranslations}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seedEnums() {
  console.log("\n=== Seeding Enum Tables ===");
  const enums: [string, string[]][] = [
    ["user_role", ["admin", "student", "user", "super_admin"]],
    ["difficulty_enum", ["easy", "medium", "hard"]],
    ["attempt_mode_enum", ["practice", "exam"]],
    ["attempt_status_enum", ["in_progress", "completed"]],
    ["course_content_type_enum", ["video", "pdf", "quiz", "text"]],
    ["quiz_type_enum", ["pre_test", "post_test", "lesson"]],
    ["enrollment_status_enum", ["active", "expired", "refunded"]],
    ["subscription_interval_enum", ["month", "quarter", "year"]],
    ["subscription_status_enum", ["active", "canceled", "past_due", "expired"]],
    ["payment_status_enum", ["pending", "succeeded", "failed", "refunded"]],
    ["event_type_enum", ["study_schedule", "personal", "exam"]],
  ];

  for (const [table, values] of enums) {
    for (const v of values) {
      await pool.query(`INSERT INTO ${table} (value) VALUES ($1) ON CONFLICT DO NOTHING`, [v]);
    }
  }

  console.log(`  Seeded ${enums.length} enum tables`);
}

async function main() {
  console.log("Firebase → PostgreSQL Migration");
  console.log("==============================\n");

  await seedEnums();

  const adminId = (await migrateUsers(readDocs("appusers.json")))!;

  const examSlugToId = await ensureExams();

  await migrateMemberships(readDocs("memberships.json"));
  await migrateParameters(readDocs("parameters.json"));
  await migrateVideoCategories(readDocs("videocategorys.json"));
  await migrateVideos(readDocs("videos.json"));
  await migrateFlashcards(readDocs("flashcardquestions.json"), adminId, examSlugToId);
  await migratePayments(readDocs("appusermembershippurchases.json"), adminId);
  await migrateUserSubscriptions(readDocs("appusermembershippurchases.json"), adminId);

  // Questions must be migrated before exam history (questionByText lookup)
  await migrateQuestions(readDocs("questions.json"), adminId, examSlugToId);

  await migrateExamHistory(readDocs("appuserexams.json"), adminId, examSlugToId);
  await migrateFlashcardReviews(readDocs("flashcard_sr.json"));
  await migrateFlashcardExamHistory(readDocs("appuserflashcardexams.json"));

  console.log("\n=== Migration Complete ===");
  console.log(`  Users:        ${totalUsers}`);
  console.log(`  Plans:        ${totalPlans}`);
  console.log(`  Questions:    ${totalQuestions}`);
  console.log(`  Options:      ${totalOptions}`);
  console.log(`  Images:       ${totalImages}`);
  console.log(`  Flashcards:   ${totalFlashcards}`);
  console.log(`  Video Mods:   ${totalModules}`);
  console.log(`  Video Less:   ${totalLessons}`);
  console.log(`  Payments:     ${totalPayments}`);
  console.log(`  User Subs:   ${totalUserSubscriptions}`);
  console.log(`  Exam Att:    ${totalExamAttempts}`);
  console.log(`  Exam Ans:    ${totalExamAnswers}`);
  console.log(`  Q Progress:  ${totalUserQuestionProgress}`);
  console.log(`  FC Reviews:  ${totalFlashcardReviews}`);
  console.log(`  Transl:       ${totalTranslations}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
