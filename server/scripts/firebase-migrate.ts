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
          createdAt: f.creationTime || new Date(),
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
          createdAt: f.creationTime || new Date(),
          updatedAt: new Date(),
        });

      totalPlans++;
    } catch (err: any) {
      console.error(`  Error migrating membership: ${err.message}`);
    }
  }
  console.log(`  Plans imported: ${totalPlans}`);
}

async function migrateQuestions(docs: any[], adminId: string) {
  console.log("\n=== Questions (questions → questions + options + images) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const text = (f.title || "").trim();
      if (!text) continue;

      const existing = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.text, text))
        .limit(1);
      if (existing.length) {
        totalQuestions++;
        continue;
      }

      const answers: any[] = (f.answers || []).filter(
        (a: any) => a.title && a.title.trim(),
      );
      if (answers.length === 0) continue;

      const [question] = (await db
        .insert(schema.questions)
        .values({
          text,
          explanation: f.explanation || "",
          reference: f.reference || null,
          difficulty: "medium",
          isActive: f.isEnabled !== false,
          createdBy: adminId,
          createdAt: f.creationTime || new Date(),
          updatedAt: new Date(),
        })
        .returning()) as any[];

      totalQuestions++;

      // Options
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

      // Images from URL fields
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
    } catch (err: any) {
      console.error(`  Error migrating question: ${err.message}`);
    }
  }
  console.log(`  Questions: ${totalQuestions}, Options: ${totalOptions}, Images: ${totalImages}`);
}

async function migrateFlashcards(docs: any[], adminId: string) {
  console.log("\n=== Flashcards (flashcardquestions → flashcards) ===");

  for (const doc of docs) {
    try {
      const f = doc;
      const front = (f.title || "").trim();
      if (!front) continue;

      const existing = await db
        .select()
        .from(schema.flashcards)
        .where(eq(schema.flashcards.front, front))
        .limit(1);
      if (existing.length) {
        totalFlashcards++;
        continue;
      }

      await db
        .insert(schema.flashcards)
        .values({
          front,
          back: f.explanation || "",
          reference: f.reference || null,
          isActive: f.isEnabled !== false,
          createdBy: adminId,
          createdAt: f.creationTime || new Date(),
          updatedAt: new Date(),
        });

      totalFlashcards++;
    } catch (err: any) {
      console.error(`  Error migrating flashcard: ${err.message}`);
    }
  }
  console.log(`  Flashcards: ${totalFlashcards}`);
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
          createdAt: f.creationTime || new Date(),
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
          createdAt: f.creationTime || new Date(),
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
          createdAt: f.creationTime || new Date(),
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

  await migrateMemberships(readDocs("memberships.json"), adminId);
  await migrateParameters(readDocs("parameters.json"));
  await migrateVideoCategories(readDocs("videocategorys.json"));
  await migrateVideos(readDocs("videos.json"));
  await migrateFlashcards(readDocs("flashcardquestions.json"), adminId);
  await migratePayments(readDocs("appusermembershippurchases.json"), adminId);

  // Questions — largest file, process last
  await migrateQuestions(readDocs("questions.json"), adminId);

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