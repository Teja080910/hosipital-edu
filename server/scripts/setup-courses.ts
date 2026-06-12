import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, isNull, sql } from "drizzle-orm";
import * as schema from "../src/database/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/hospital_edu" });
const db = drizzle(pool, { schema });

const CLOUDFLARE_HASH = process.env.CLOUDFLARE_CUSTOMER_CODE || "s1tgyboloirfoxo0";

function cloudflareUrl(uid: string) {
  return `https://customer-${CLOUDFLARE_HASH}.cloudflarestream.com/${uid}/iframe`;
}

async function getRealVideoUids(): Promise<string[]> {
  const rows = await db
    .select({ uid: schema.videoLessons.videoUrl })
    .from(schema.videoLessons)
    .where(and(
      sql`${schema.videoLessons.videoUrl} IS NOT NULL`,
      sql`${schema.videoLessons.videoUrl} != ''`,
    ));
  return rows.map((r: any) => r.uid);
}

const coursesData = [
  {
    slug: "usmle-step-1-comprehensive",
    title: { en: "USMLE Step 1 Comprehensive Review" },
    description: { en: "Complete coverage of basic sciences for USMLE Step 1 including anatomy, physiology, biochemistry, pharmacology, microbiology, and pathology." },
    shortDescription: { en: "Master basic sciences with expert-led lessons and practice questions" },
    price: "299.99",
    durationDays: 90,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Cardiovascular System" },
        description: { en: "Heart anatomy, cardiac physiology, and cardiovascular pathology" },
        sortOrder: 0,
        lessons: [
          { title: { en: "Cardiac Anatomy and Embryology" }, contentType: "video", videoSlot: 0, duration: 1800, content: "Detailed overview of cardiac anatomy including chambers, valves, coronary circulation, and cardiac embryology.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Cardiac Physiology" }, contentType: "video", videoSlot: 1, duration: 2400, content: "Cardiac cycle, hemodynamics, ECG interpretation, and cardiac output regulation.", sortOrder: 1, isFreePreview: false },
        ],
      },
      {
        title: { en: "Respiratory System" },
        description: { en: "Pulmonary anatomy, physiology, and respiratory pathology" },
        sortOrder: 1,
        lessons: [
          { title: { en: "Pulmonary Anatomy" }, contentType: "video", videoSlot: 2, duration: 1500, content: "Upper and lower respiratory tract anatomy, bronchopulmonary segments, and pleural spaces.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Ventilation and Gas Exchange" }, contentType: "video", videoSlot: 3, duration: 2100, content: "Mechanics of breathing, lung volumes, diffusion, and ventilation-perfusion matching.", sortOrder: 1, isFreePreview: false },
        ],
      },
    ],
  },
  {
    slug: "enarm-mexico-preparation",
    title: { en: "ENARM Mexico Preparation Course" },
    description: { en: "Comprehensive preparation for the ENARM exam with focus on Mexican clinical practice guidelines and epidemiology." },
    shortDescription: { en: "Specifically designed for ENARM exam success" },
    price: "199.99",
    durationDays: 120,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Internal Medicine for ENARM" },
        description: { en: "High-yield internal medicine topics for ENARM" },
        sortOrder: 0,
        lessons: [
          { title: { en: "Cardiovascular Diseases in Mexico" }, contentType: "video", videoSlot: 4, duration: 2000, content: "Epidemiology and management of cardiovascular diseases prevalent in the Mexican population.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Diabetes and Metabolic Syndrome" }, contentType: "video", videoSlot: 5, duration: 1800, content: "Management of diabetes and metabolic syndrome according to Mexican clinical guidelines.", sortOrder: 1, isFreePreview: false },
        ],
      },
      {
        title: { en: "Infectious Diseases" },
        description: { en: "Tropical and infectious diseases common in Latin America" },
        sortOrder: 1,
        lessons: [
          { title: { en: "Vector-Borne Diseases" }, contentType: "video", videoSlot: 6, duration: 2200, content: "Dengue, Chikungunya, Zika, and other arboviruses prevalent in Mexico and Latin America.", sortOrder: 0, isFreePreview: true },
        ],
      },
    ],
  },
  {
    slug: "mir-spain-preparation",
    title: { en: "MIR Spain Exam Preparation" },
    description: { en: "Complete MIR exam preparation covering all specialties required for medical residency in Spain." },
    shortDescription: { en: "Ace the MIR exam with comprehensive training" },
    price: "249.99",
    durationDays: 150,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Medical Surgery" },
        description: { en: "Core surgical topics for MIR" },
        sortOrder: 0,
        lessons: [
          { title: { en: "General Surgery Principles" }, contentType: "video", videoSlot: 7, duration: 2500, content: "Preoperative evaluation, wound healing, surgical infections, and postoperative care.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Abdominal Surgery" }, contentType: "video", videoSlot: 8, duration: 2000, content: "Management of acute abdomen, appendicitis, cholecystitis, and intestinal obstruction.", sortOrder: 1, isFreePreview: false },
        ],
      },
    ],
  },
];

async function main() {
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "tejasimma033@gmail.com"))
    .limit(1);

  if (!adminUser) {
    console.error("Admin user not found. Ensure tejasimma033@gmail.com exists.");
    await pool.end();
    process.exit(1);
  }
  console.log(`Using admin: ${adminUser.email}\n`);

  const uids = await getRealVideoUids();
  console.log(`Found ${uids.length} existing video UIDs in video_lessons table`);

  let seeded = 0;
  let urlUpdated = 0;

  for (const course of coursesData) {
    const existing = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.slug, course.slug))
      .limit(1);

    let courseId: string;

    if (existing.length) {
      courseId = existing[0].id;
      const modCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.courseModules)
        .where(eq(schema.courseModules.courseId, courseId));
      if ((modCount[0]?.count || 0) > 0) {
        console.log(`Skipped (exists): ${course.title.en}`);
        continue;
      }
      console.log(`Inserting modules for existing course: ${course.title.en}`);
    } else {
      const [created] = await db.insert(schema.courses).values({
        slug: course.slug,
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        price: course.price,
        durationDays: course.durationDays,
        hasCertificate: course.hasCertificate,
        isActive: true,
        createdBy: adminUser.id,
      }).returning();
      courseId = created.id;
      console.log(`Created course: ${course.title.en}`);
    }

    for (const mod of course.modules) {
      const [module] = await db.insert(schema.courseModules).values({
        courseId,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
      }).returning();

      for (const lesson of mod.lessons) {
        const uid = uids[lesson.videoSlot % uids.length] || uids[0];
        await db.insert(schema.courseLessons).values({
          moduleId: module.id,
          title: lesson.title,
          contentType: lesson.contentType,
          videoUrl: cloudflareUrl(uid),
          content: lesson.content,
          duration: lesson.duration,
          sortOrder: lesson.sortOrder,
          isFreePreview: lesson.isFreePreview,
        });
      }
    }
    seeded++;
  }

  const unset = await db
    .select({ id: schema.courseLessons.id, title: schema.courseLessons.title })
    .from(schema.courseLessons)
    .where(and(
      eq(schema.courseLessons.contentType, "video"),
      isNull(schema.courseLessons.videoUrl),
    ));

  for (let i = 0; i < unset.length; i++) {
    const uid = uids[i % uids.length];
    const url = cloudflareUrl(uid);
    await db
      .update(schema.courseLessons)
      .set({ videoUrl: url })
      .where(eq(schema.courseLessons.id, unset[i].id));
    const t = unset[i].title?.en || JSON.stringify(unset[i].title);
    console.log(`  URL assigned: ${t} -> ${url}`);
    urlUpdated++;
  }

  console.log(`\nDone. Courses seeded: ${seeded}. URLs assigned: ${urlUpdated}.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});