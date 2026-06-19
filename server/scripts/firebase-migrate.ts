import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq, and } from "drizzle-orm";
import * as schema from "../src/database/schema";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "process.env.DATABASE_URL",
});
const db = drizzle(pool, { schema });

const DATA_DIR = path.join(__dirname, "../exports");

// Safe timestamp converter — handles string, number, Firestore object, null
function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (typeof val._seconds === "number") return new Date(val._seconds * 1000 + (val._nanoseconds || 0) / 1e6);
  return null;
}

// Progress tracking
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

function getDocId(doc: any): string {
  return doc._id || "";
}

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
  examId: string, catTitle: string,
): Promise<{ specialtyId: string; topicId: string }> {
  const slug = toSlug(catTitle);
  let { rows: specs } = await pool.query(
    "SELECT id FROM specialties WHERE exam_id = $1 AND slug = $2", [examId, slug],
  );
  const specialtyId = specs.length
    ? specs[0].id
    : (await pool.query(
        "INSERT INTO specialties (exam_id, name, slug, sort_order) VALUES ($1, $2, $3, 0) RETURNING id",
        [examId, JSON.stringify({ en: catTitle, es: catTitle }), slug],
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
          createdAt: toDate(f.creationTime) || new Date(),
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

  // If no admin found, create default
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

async function migrateMemberships(docs: any[], adminId: string) {
  console.log("\n=== Memberships (memberships → subscription_plans) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const title = f.title || "Untitled Plan";

      const existing = await db
        .select()
        .from(schema.subscriptionPlans)
        .where(
          sql`${schema.subscriptionPlans.name}->>'en' = ${title}`,
        )
        .limit(1);
      if (existing.length) {
        totalPlans++;
        continue;
      }

      let interval = "month";
      if (f.maxDays >= 350) interval = "year";
      else if (f.maxDays >= 80) interval = "quarter";

      await db
        .insert(schema.subscriptionPlans)
        .values({
          name: { en: title, es: title },
          description: { en: f.detail || "", es: f.detail || "" },
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
          createdAt: toDate(f.creationTime) || new Date(),
          updatedAt: new Date(),
        });

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
  let linked = 0;
  let skipped = 0;

  for (const doc of docs) {
    try {
      const f = doc;
      const text = (f.title || "").trim();
      if (!text) { skipped++; continue; }

      const existing = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.text, text))
        .limit(1);
      if (existing.length) {
        totalQuestions++;
        // Still try to link
      } else {
        const answers: any[] = (f.answers || []).filter(
          (a: any) => a.title && a.title.trim(),
        );
        if (answers.length === 0) { skipped++; continue; }

        const [question] = (await db
          .insert(schema.questions)
          .values({
            text,
            explanation: f.explanation || "",
            reference: f.reference || null,
            difficulty: "medium",
            isActive: f.isEnabled !== false,
            createdBy: adminId,
            createdAt: toDate(f.creationTime) || new Date(),
            updatedAt: new Date(),
          })
          .returning()) as any[];

        totalQuestions++;

        if (answers.length) {
          await db.insert(schema.questionOptions).values(
            answers.map((a: any, i: number) => ({
              questionId: question.id,
              text: a.title || "",
              isCorrect: a.isCorrect === true,
              sortOrder: i,
            })),
          );
          totalOptions += answers.length;
        }

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
              questionId: question.id,
              url: x.url!,
              sortOrder: x.sort,
            })),
          );
          totalImages += imgFields.length;
        }
      }

      // Link to exam / specialty / topic
      const catId = getCatIdFromDoc(doc);
      const catTitle = catMap[catId || ""];
      if (!catTitle) { continue; }

      let examSlug = EXAM_TYPE_TO_SLUG[f.examType];
      if (!examSlug) {
        examSlug = detectExamSlug(catTitle);
      }
      const examId = examSlugToId[examSlug];
      if (!examId) { continue; }

      const cacheKey = `${examSlug}::${catTitle}`;
      if (!specTopicCache[cacheKey]) {
        specTopicCache[cacheKey] = await getOrCreateSpecialtyTopic(examId, catTitle);
      }
      const { specialtyId, topicId } = specTopicCache[cacheKey];

      const { rows: qs } = await pool.query(
        "SELECT id FROM questions WHERE text = $1 LIMIT 1", [text],
      );
      if (qs.length) {
        await pool.query(
          "UPDATE questions SET exam_id = $1, specialty_id = $2, topic_id = $3 WHERE id = $4",
          [examId, specialtyId, topicId, qs[0].id],
        );
        linked++;
      }
    } catch (err: any) {
      console.error(`  Error migrating question: ${err.message}`);
    }
  }
  console.log(`  Questions: ${totalQuestions}, Options: ${totalOptions}, Images: ${totalImages}, linked to exam: ${linked}, skipped: ${skipped}`);
}

async function migrateFlashcards(docs: any[], adminId: string, examSlugToId: Record<string, string>) {
  console.log("\n=== Flashcards (flashcardquestions → flashcards) ===");

  const catDocs = readDocs("flashcardcategorys.json");
  const catMap: Record<string, string> = {};
  for (const c of catDocs) catMap[c.id] = c.title;

  const specTopicCache: Record<string, { specialtyId: string; topicId: string }> = {};
  let linked = 0;
  let skipped = 0;

  for (const doc of docs) {
    try {
      const f = doc;
      const front = (f.title || "").trim();
      if (!front) { skipped++; continue; }

      const existing = await db
        .select()
        .from(schema.flashcards)
        .where(eq(schema.flashcards.front, front))
        .limit(1);
      if (!existing.length) {
        await db
          .insert(schema.flashcards)
          .values({
            front,
            back: f.explanation || "",
            reference: f.reference || null,
            isActive: f.isEnabled !== false,
            createdBy: adminId,
            createdAt: toDate(f.creationTime) || new Date(),
            updatedAt: new Date(),
          });
        totalFlashcards++;
      } else {
        totalFlashcards++;
      }

      // Link to exam / specialty / topic
      const catId = getCatIdFromDoc(doc);
      const catTitle = catMap[catId || ""];
      if (!catTitle) { continue; }

      const examSlug = detectExamSlug(catTitle);
      const examId = examSlugToId[examSlug];
      if (!examId) { continue; }

      const cacheKey = `${examSlug}::${catTitle}`;
      if (!specTopicCache[cacheKey]) {
        specTopicCache[cacheKey] = await getOrCreateSpecialtyTopic(examId, catTitle);
      }
      const { specialtyId, topicId } = specTopicCache[cacheKey];

      const { rows: fc } = await pool.query(
        "SELECT id FROM flashcards WHERE front = $1 AND is_active = true LIMIT 1", [front],
      );
      if (fc.length) {
        await pool.query(
          "UPDATE flashcards SET exam_id = $1, specialty_id = $2, topic_id = $3 WHERE id = $4",
          [examId, specialtyId, topicId, fc[0].id],
        );
        linked++;
      }
    } catch (err: any) {
      console.error(`  Error migrating flashcard [${doc._id || "?"}]: ${err.message}`);
    }
  }
  console.log(`  Flashcards: ${totalFlashcards}, linked to exam: ${linked}, skipped: ${skipped}`);
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
        .where(
          sql`${schema.videoModules.title}->>'en' = ${title}`,
        )
        .limit(1);
      if (existing.length) {
        totalModules++;
        continue;
      }

      await db
        .insert(schema.videoModules)
        .values({
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

      // Find matching module by category title
      let moduleId: string | null = null;
      if (f.category && f.category.title) {
        const mods = await db
          .select()
          .from(schema.videoModules)
          .where(
            sql`${schema.videoModules.title}->>'en' = ${f.category.title}`,
          )
          .limit(1);
        if (mods.length) moduleId = mods[0].id;
      }

      if (!moduleId) {
        // Create a default module
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
          and(
            eq(schema.videoLessons.moduleId, moduleId!),
            sql`${schema.videoLessons.title}->>'en' = ${title}`,
          ),
        )
        .limit(1);
      if (existing.length) {
        totalLessons++;
        continue;
      }

      await db
        .insert(schema.videoLessons)
        .values({
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
      const paymentNumber = f.paymentNumber || getDocId(doc);

      const existing = await db
        .select()
        .from(schema.payments)
        .where(
          sql`${schema.payments.paymentNumber} = ${paymentNumber}`,
        )
        .limit(1);
      if (existing.length) {
        totalPayments++;
        continue;
      }

      // Resolve user
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

      await db
        .insert(schema.payments)
        .values({
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
          .where(
            and(
              eq(schema.translations.key, key),
              eq(schema.translations.locale, "es"),
            ),
          )
          .limit(1);
        if (!exists.length) {
          await db.insert(schema.translations).values({
            key,
            locale: "es",
            value: f.title,
            namespace: "firebase",
          });
          totalTranslations++;
        }
      }

      if (f.titleEn) {
        const existsEn = await db
          .select()
          .from(schema.translations)
          .where(
            and(
              eq(schema.translations.key, key),
              eq(schema.translations.locale, "en"),
            ),
          )
          .limit(1);
        if (!existsEn.length) {
          await db.insert(schema.translations).values({
            key,
            locale: "en",
            value: f.titleEn,
            namespace: "firebase",
          });
          totalTranslations++;
        }
      }

      if (f.additional && typeof f.additional === "string") {
        const addKey = `${key}_additional`;
        const exists = await db
          .select()
          .from(schema.translations)
          .where(
            and(
              eq(schema.translations.key, addKey),
              eq(schema.translations.locale, "es"),
            ),
          )
          .limit(1);
        if (!exists.length) {
          await db.insert(schema.translations).values({
            key: addKey,
            locale: "es",
            value: f.additional,
            namespace: "firebase",
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

  await migrateMemberships(readDocs("memberships.json"), adminId);
  await migrateParameters(readDocs("parameters.json"));
  await migrateVideoCategories(readDocs("videocategorys.json"));
  await migrateVideos(readDocs("videos.json"));
  await migrateFlashcards(readDocs("flashcardquestions.json"), adminId, examSlugToId);
  await migratePayments(readDocs("appusermembershippurchases.json"), adminId);

  // Questions — largest file, process last
  await migrateQuestions(readDocs("questions.json"), adminId, examSlugToId);

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
  console.log(`  Transl:       ${totalTranslations}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});