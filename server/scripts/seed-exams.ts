import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/database/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:1234@localhost:5432/hospital_edu",
});
const db = drizzle(pool, { schema });

const examsData = [
  {
    slug: "enarm",
    name: { en: "ENARM", es: "ENARM" },
    description: {
      en: "Examen Nacional de Aspirantes a Residencias Médicas - Mexico",
      es: "Examen Nacional de Aspirantes a Residencias Médicas - México",
    },
    sortOrder: 0,
    specialties: [
      {
        name: { en: "Internal Medicine", es: "Medicina Interna" },
        slug: "internal-medicine",
        sortOrder: 0,
        topics: [
          {
            name: { en: "Cardiology", es: "Cardiología" },
            slug: "cardiology",
            sortOrder: 0,
            subtopics: [
              { name: { en: "Ischemic Heart Disease", es: "Cardiopatía Isquémica" }, slug: "ischemic-heart-disease", sortOrder: 0 },
              { name: { en: "Heart Failure", es: "Insuficiencia Cardíaca" }, slug: "heart-failure", sortOrder: 1 },
              { name: { en: "Arrhythmias", es: "Arritmias" }, slug: "arrhythmias", sortOrder: 2 },
            ],
          },
          {
            name: { en: "Infectious Disease", es: "Enfermedades Infecciosas" },
            slug: "infectious-disease",
            sortOrder: 1,
            subtopics: [
              { name: { en: "Respiratory Infections", es: "Infecciones Respiratorias" }, slug: "respiratory-infections", sortOrder: 0 },
              { name: { en: "Tropical Diseases", es: "Enfermedades Tropicales" }, slug: "tropical-diseases", sortOrder: 1 },
            ],
          },
          {
            name: { en: "Endocrinology", es: "Endocrinología" },
            slug: "endocrinology",
            sortOrder: 2,
            subtopics: [
              { name: { en: "Diabetes", es: "Diabetes" }, slug: "diabetes", sortOrder: 0 },
              { name: { en: "Thyroid Disorders", es: "Trastornos Tiroideos" }, slug: "thyroid-disorders", sortOrder: 1 },
            ],
          },
          {
            name: { en: "Gastroenterology", es: "Gastroenterología" },
            slug: "gastroenterology",
            sortOrder: 3,
            subtopics: [
              { name: { en: "Peptic Ulcer Disease", es: "Enfermedad Ulcerosa Péptica" }, slug: "peptic-ulcer", sortOrder: 0 },
              { name: { en: "Liver Disease", es: "Enfermedad Hepática" }, slug: "liver-disease", sortOrder: 1 },
            ],
          },
        ],
      },
      {
        name: { en: "Pediatrics", es: "Pediatría" },
        slug: "pediatrics",
        sortOrder: 1,
        topics: [
          {
            name: { en: "Neonatology", es: "Neonatología" },
            slug: "neonatology",
            sortOrder: 0,
            subtopics: [
              { name: { en: "Newborn Resuscitation", es: "Reanimación Neonatal" }, slug: "newborn-resuscitation", sortOrder: 0 },
            ],
          },
          {
            name: { en: "Pediatric Infectious Disease", es: "Infectología Pediátrica" },
            slug: "pediatric-infectious-disease",
            sortOrder: 1,
            subtopics: [
              { name: { en: "Childhood Vaccinations", es: "Vacunación Infantil" }, slug: "childhood-vaccinations", sortOrder: 0 },
            ],
          },
        ],
      },
      {
        name: { en: "Surgery", es: "Cirugía" },
        slug: "surgery",
        sortOrder: 2,
        topics: [
          {
            name: { en: "General Surgery", es: "Cirugía General" },
            slug: "general-surgery",
            sortOrder: 0,
            subtopics: [
              { name: { en: "Acute Abdomen", es: "Abdomen Agudo" }, slug: "acute-abdomen", sortOrder: 0 },
              { name: { en: "Trauma", es: "Trauma" }, slug: "trauma", sortOrder: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "mir",
    name: { en: "MIR", es: "MIR" },
    description: {
      en: "Médico Interno Residente - Spain",
      es: "Médico Interno Residente - España",
    },
    sortOrder: 1,
    specialties: [
      {
        name: { en: "Internal Medicine", es: "Medicina Interna" },
        slug: "internal-medicine",
        sortOrder: 0,
        topics: [
          {
            name: { en: "Cardiology", es: "Cardiología" },
            slug: "cardiology",
            sortOrder: 0,
            subtopics: [],
          },
          {
            name: { en: "Neurology", es: "Neurología" },
            slug: "neurology",
            sortOrder: 1,
            subtopics: [],
          },
        ],
      },
    ],
  },
  {
    slug: "usmle-step-1",
    name: { en: "USMLE Step 1", es: "USMLE Step 1" },
    description: {
      en: "United States Medical Licensing Examination - Step 1",
      es: "United States Medical Licensing Examination - Step 1",
    },
    sortOrder: 2,
    specialties: [
      {
        name: { en: "Pathology", es: "Patología" },
        slug: "pathology",
        sortOrder: 0,
        topics: [
          {
            name: { en: "General Pathology", es: "Patología General" },
            slug: "general-pathology",
            sortOrder: 0,
            subtopics: [
              { name: { en: "Cell Injury", es: "Lesión Celular" }, slug: "cell-injury", sortOrder: 0 },
              { name: { en: "Inflammation", es: "Inflamación" }, slug: "inflammation", sortOrder: 1 },
            ],
          },
        ],
      },
      {
        name: { en: "Pharmacology", es: "Farmacología" },
        slug: "pharmacology",
        sortOrder: 1,
        topics: [
          {
            name: { en: "Autonomic Pharmacology", es: "Farmacología Autonómica" },
            slug: "autonomic-pharmacology",
            sortOrder: 0,
            subtopics: [],
          },
        ],
      },
    ],
  },
];

const flashcardsData = [
  { front: "What is the most common cause of community-acquired pneumonia?", back: "Streptococcus pneumoniae" },
  { front: "What is the first-line treatment for hypertension in diabetic patients?", back: "ACE Inhibitors or ARBs" },
  { front: "What ECG finding is characteristic of acute pericarditis?", back: "Diffuse ST-segment elevation with PR depression" },
  { front: "What is the most common cause of chronic pancreatitis?", back: "Alcohol use disorder" },
  { front: "What is the triad of Ménière's disease?", back: "Episodic vertigo, tinnitus, and hearing loss" },
  { front: "What is the most common cause of Cushing syndrome?", back: "Iatrogenic (exogenous glucocorticoid use)" },
  { front: "What is the treatment for anaphylaxis?", back: "Epinephrine IM (first-line), antihistamines, corticosteroids" },
  { front: "What is the most common cause of iron deficiency anemia in adults?", back: "Chronic blood loss (GI or menstrual)" },
  { front: "What is the gold standard for diagnosing pulmonary embolism?", back: "CT pulmonary angiography (CTPA)" },
  { front: "What is the Glasgow Coma Scale range?", back: "3 (worst) to 15 (best)" },
];

async function main() {
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "tejasimma033@gmail.com"))
    .limit(1);

  if (!adminUser) {
    console.error("Admin user not found. Create one first via npm run create:admin");
    await pool.end();
    process.exit(1);
  }

  const userId = adminUser.id;

  // Seed exams
  for (const examData of examsData) {
    const existing = await db
      .select()
      .from(schema.exams)
      .where(eq(schema.exams.slug, examData.slug))
      .limit(1);

    if (existing.length) {
      console.log(`Skipped (exists): ${examData.slug}`);
      continue;
    }

    const [exam] = await db
      .insert(schema.exams)
      .values({
        slug: examData.slug,
        name: examData.name,
        description: examData.description,
        sortOrder: examData.sortOrder,
        isActive: true,
      })
      .returning();
    console.log(`Created exam: ${examData.slug}`);

    for (const specData of examData.specialties) {
      const [specialty] = await db
        .insert(schema.specialties)
        .values({
          examId: exam.id,
          name: specData.name,
          slug: specData.slug,
          sortOrder: specData.sortOrder,
        })
        .returning();

      for (const topicData of specData.topics) {
        const [topic] = await db
          .insert(schema.topics)
          .values({
            specialtyId: specialty.id,
            name: topicData.name,
            slug: topicData.slug,
            sortOrder: topicData.sortOrder,
          })
          .returning();

        for (const subData of topicData.subtopics) {
          await db.insert(schema.subtopics).values({
            topicId: topic.id,
            name: subData.name,
            slug: subData.slug,
            sortOrder: subData.sortOrder,
          });
        }
      }
    }
  }

  // Seed flashcards
  const firstSpecialty = await db
    .select()
    .from(schema.specialties)
    .limit(1);

  if (!firstSpecialty.length) {
    console.error("No specialties found, cannot create flashcards");
    await pool.end();
    process.exit(1);
  }

  const firstTopic = await db
    .select()
    .from(schema.topics)
    .where(eq(schema.topics.specialtyId, firstSpecialty[0].id))
    .limit(1);

  if (!firstTopic.length) {
    console.error("No topics found, cannot create flashcards");
    await pool.end();
    process.exit(1);
  }

  for (const fc of flashcardsData) {
    await db
      .insert(schema.flashcards)
      .values({
        specialtyId: firstSpecialty[0].id,
        topicId: firstTopic[0].id,
        front: fc.front,
        back: fc.back,
        isActive: true,
        createdBy: userId,
      });
  }
  console.log(`Created ${flashcardsData.length} flashcards`);

  console.log("\nSeed complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
