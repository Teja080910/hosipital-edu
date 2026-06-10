import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/database/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/hospital_edu",
});
const db = drizzle(pool, { schema });

const examsData = [
  {
    slug: "enarm",
    name: { en: "ENARM", es: "ENARM" },
    description: { en: "Examen Nacional de Aspirantes a Residencias Médicas - Mexico", es: "Examen Nacional de Aspirantes a Residencias Médicas - México" },
    sortOrder: 0,
    specialties: [
      {
        name: { en: "Internal Medicine", es: "Medicina Interna" },
        slug: "internal-medicine", sortOrder: 0,
        topics: [
          { name: { en: "Cardiology", es: "Cardiología" }, slug: "cardiology", sortOrder: 0, subtopics: [
            { name: { en: "Ischemic Heart Disease", es: "Cardiopatía Isquémica" }, slug: "ischemic-heart-disease", sortOrder: 0 },
            { name: { en: "Heart Failure", es: "Insuficiencia Cardíaca" }, slug: "heart-failure", sortOrder: 1 },
          ]},
          { name: { en: "Infectious Disease", es: "Enfermedades Infecciosas" }, slug: "infectious-disease", sortOrder: 1, subtopics: [
            { name: { en: "Respiratory Infections", es: "Infecciones Respiratorias" }, slug: "respiratory-infections", sortOrder: 0 },
          ]},
          { name: { en: "Endocrinology", es: "Endocrinología" }, slug: "endocrinology", sortOrder: 2, subtopics: [
            { name: { en: "Diabetes", es: "Diabetes" }, slug: "diabetes", sortOrder: 0 },
          ]},
        ],
      },
      {
        name: { en: "Pediatrics", es: "Pediatría" },
        slug: "pediatrics", sortOrder: 1,
        topics: [
          { name: { en: "Neonatology", es: "Neonatología" }, slug: "neonatology", sortOrder: 0, subtopics: [] },
        ],
      },
      {
        name: { en: "Surgery", es: "Cirugía" },
        slug: "surgery", sortOrder: 2,
        topics: [
          { name: { en: "General Surgery", es: "Cirugía General" }, slug: "general-surgery", sortOrder: 0, subtopics: [] },
        ],
      },
    ],
  },
  {
    slug: "mir",
    name: { en: "MIR", es: "MIR" },
    description: { en: "Médico Interno Residente - Spain", es: "Médico Interno Residente - España" },
    sortOrder: 1,
    specialties: [
      {
        name: { en: "Internal Medicine", es: "Medicina Interna" },
        slug: "internal-medicine", sortOrder: 0,
        topics: [
          { name: { en: "Cardiology", es: "Cardiología" }, slug: "cardiology", sortOrder: 0, subtopics: [] },
          { name: { en: "Neurology", es: "Neurología" }, slug: "neurology", sortOrder: 1, subtopics: [] },
        ],
      },
    ],
  },
  {
    slug: "usmle-step-1",
    name: { en: "USMLE Step 1", es: "USMLE Step 1" },
    description: { en: "United States Medical Licensing Examination - Step 1", es: "United States Medical Licensing Examination - Step 1" },
    sortOrder: 2,
    specialties: [
      {
        name: { en: "Pathology", es: "Patología" },
        slug: "pathology", sortOrder: 0,
        topics: [
          { name: { en: "General Pathology", es: "Patología General" }, slug: "general-pathology", sortOrder: 0, subtopics: [
            { name: { en: "Cell Injury", es: "Lesión Celular" }, slug: "cell-injury", sortOrder: 0 },
          ]},
        ],
      },
      {
        name: { en: "Pharmacology", es: "Farmacología" },
        slug: "pharmacology", sortOrder: 1,
        topics: [
          { name: { en: "Autonomic Pharmacology", es: "Farmacología Autonómica" }, slug: "autonomic-pharmacology", sortOrder: 0, subtopics: [] },
        ],
      },
    ],
  },
];

const flashcardsData = [
  { front: "Most common cause of community-acquired pneumonia?", back: "Streptococcus pneumoniae" },
  { front: "First-line treatment for hypertension in diabetics?", back: "ACE Inhibitors or ARBs" },
  { front: "ECG finding in acute pericarditis?", back: "Diffuse ST-elevation with PR depression" },
  { front: "Most common cause of chronic pancreatitis?", back: "Alcohol use disorder" },
  { front: "Triad of Ménière's disease?", back: "Vertigo, tinnitus, hearing loss" },
  { front: "Treatment for anaphylaxis?", back: "Epinephrine IM first-line" },
  { front: "Gold standard for PE diagnosis?", back: "CT pulmonary angiography" },
  { front: "Glasgow Coma Scale range?", back: "3 to 15" },
  { front: "Most common cause of iron deficiency anemia in adults?", back: "Chronic blood loss" },
  { front: "Most common cause of Cushing syndrome?", back: "Iatrogenic (glucocorticoids)" },
];

async function main() {
  const [admin] = await db.select().from(schema.users).limit(1);
  if (!admin) { console.error("No admin user"); process.exit(1); }

  for (const ed of examsData) {
    const existing = await db.select().from(schema.exams).where(eq(schema.exams.slug, ed.slug)).limit(1);
    if (existing.length) { console.log(`Skipped exam: ${ed.slug}`); continue; }

    const [exam] = await db.insert(schema.exams).values({ slug: ed.slug, name: ed.name, description: ed.description, sortOrder: ed.sortOrder, isActive: true }).returning();
    console.log(`Created exam: ${ed.slug}`);

    for (const sd of ed.specialties) {
      const [spec] = await db.insert(schema.specialties).values({ examId: exam.id, name: sd.name, slug: sd.slug, sortOrder: sd.sortOrder }).returning();
      for (const td of sd.topics) {
        const [topic] = await db.insert(schema.topics).values({ specialtyId: spec.id, name: td.name, slug: td.slug, sortOrder: td.sortOrder }).returning();
        for (const sub of td.subtopics) {
          await db.insert(schema.subtopics).values({ topicId: topic.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder });
        }
      }
    }
  }

  const firstSpec = await db.select().from(schema.specialties).limit(1);
  const firstTopic = await db.select().from(schema.topics).limit(1);
  if (firstSpec.length && firstTopic.length) {
    for (const fc of flashcardsData) {
      await db.insert(schema.flashcards).values({ specialtyId: firstSpec[0].id, topicId: firstTopic[0].id, front: fc.front, back: fc.back, isActive: true, createdBy: admin.id });
    }
  }

  const enarm = await db.select().from(schema.exams).where(eq(schema.exams.slug, "enarm")).limit(1);
  const mir = await db.select().from(schema.exams).where(eq(schema.exams.slug, "mir")).limit(1);
  const usmle = await db.select().from(schema.exams).where(eq(schema.exams.slug, "usmle-step-1")).limit(1);

  const enarmSpec = await db.select().from(schema.specialties).where(eq(schema.specialties.examId, enarm[0].id)).limit(1);
  const enarmTopic = await db.select().from(schema.topics).where(eq(schema.topics.specialtyId, enarmSpec[0].id)).limit(1);
  const mirSpec = await db.select().from(schema.specialties).where(eq(schema.specialties.examId, mir[0].id)).limit(1);
  const mirTopic = await db.select().from(schema.topics).where(eq(schema.topics.specialtyId, mirSpec[0].id)).limit(1);
  const usmleSpec = await db.select().from(schema.specialties).where(eq(schema.specialties.examId, usmle[0].id)).limit(1);
  const usmleTopic = await db.select().from(schema.topics).where(eq(schema.topics.specialtyId, usmleSpec[0].id)).limit(1);

  const questions = await db.select().from(schema.questions);
  const enarmQs = questions.filter((_: any, i: number) => i < 10);
  const mirQs = questions.filter((_: any, i: number) => i >= 10 && i < 12);
  const usmleQs = questions.filter((_: any, i: number) => i >= 12 && i < 14);

  for (const q of enarmQs) {
    await db.update(schema.questions).set({ examId: enarm[0].id, specialtyId: enarmSpec[0].id, topicId: enarmTopic[0].id }).where(eq(schema.questions.id, q.id));
  }
  for (const q of mirQs) {
    await db.update(schema.questions).set({ examId: mir[0].id, specialtyId: mirSpec[0].id, topicId: mirTopic[0].id }).where(eq(schema.questions.id, q.id));
  }
  for (const q of usmleQs) {
    await db.update(schema.questions).set({ examId: usmle[0].id, specialtyId: usmleSpec[0].id, topicId: usmleTopic[0].id }).where(eq(schema.questions.id, q.id));
  }

  console.log("\nDone! Exams, specialties, topics, flashcards created. Questions linked.");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });