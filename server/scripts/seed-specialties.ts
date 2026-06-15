import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const specialtiesByExam: Record<string, { en: string; es: string }[]> = {
  enurm: [
    { en: "ENURM Basic Sciences", es: "ENURM Ciencias Básicas" },
    { en: "ENURM Internal Medicine", es: "ENURM Medicina Interna" },
    { en: "ENURM Pediatrics", es: "ENURM Pediatría" },
    { en: "ENURM Surgery", es: "ENURM Cirugía" },
    { en: "ENURM Gynecology and Obstetrics", es: "ENURM Ginecología y Obstetricia" },
    { en: "Anatomy", es: "Anatomía" },
    { en: "Cardiology", es: "Cardiología" },
    { en: "Surgery", es: "Cirugía" },
    { en: "Pharmacology", es: "Farmacología" },
    { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
    { en: "Infectious Diseases", es: "Infectología" },
    { en: "Maxillofacial Surgery", es: "Maxilofacial" },
    { en: "Internal Medicine", es: "Medicina Interna" },
    { en: "Nephro-Urology", es: "Nefro-Urología" },
    { en: "Pulmonology", es: "Neumología" },
    { en: "Neurology", es: "Neurología" },
    { en: "Pediatrics", es: "Pediatría" },
  ],
  enarm: [
    { en: "ENARM Surgery", es: "ENARM Cirugía" },
    { en: "ENARM Internal Medicine", es: "ENARM Medicina Interna" },
    { en: "ENARM Pediatrics", es: "ENARM Pediatría" },
    { en: "Internal Medicine - ENARM", es: "Medicina Interna - ENARM" },
    { en: "Anatomy", es: "Anatomía" },
    { en: "Cardiology", es: "Cardiología" },
    { en: "Surgery", es: "Cirugía" },
    { en: "Pharmacology", es: "Farmacología" },
    { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
    { en: "Infectious Diseases", es: "Infectología" },
    { en: "Maxillofacial Surgery", es: "Maxilofacial" },
    { en: "Internal Medicine", es: "Medicina Interna" },
    { en: "Nephro-Urology", es: "Nefro-Urología" },
    { en: "Pulmonology", es: "Neumología" },
    { en: "Neurology", es: "Neurología" },
    { en: "Pediatrics", es: "Pediatría" },
  ],
  mir: [
    { en: "Anatomy", es: "Anatomía" },
    { en: "Cardiology", es: "Cardiología" },
    { en: "Surgery", es: "Cirugía" },
    { en: "Pharmacology", es: "Farmacología" },
    { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
    { en: "Infectious Diseases", es: "Infectología" },
    { en: "Maxillofacial Surgery", es: "Maxilofacial" },
    { en: "Internal Medicine", es: "Medicina Interna" },
    { en: "Nephro-Urology", es: "Nefro-Urología" },
    { en: "Pulmonology", es: "Neumología" },
    { en: "Neurology", es: "Neurología" },
    { en: "Pediatrics", es: "Pediatría" },
  ],
  "usmle-step-1": [
    { en: "Anatomy", es: "Anatomía" },
    { en: "Pharmacology", es: "Farmacología" },
  ],
};

const usmleStep2Slug = "usmle-step-2";
const usmleStep2Specialties = [
  { en: "Cardiology", es: "Cardiología" },
  { en: "Surgery", es: "Cirugía" },
  { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
  { en: "Infectious Diseases", es: "Infectología" },
  { en: "Internal Medicine", es: "Medicina Interna" },
  { en: "Nephro-Urology", es: "Nefro-Urología" },
  { en: "Pulmonology", es: "Neumología" },
  { en: "Neurology", es: "Neurología" },
  { en: "Pediatrics", es: "Pediatría" },
];

async function main() {
  const client = await pool.connect();

  // Get exam IDs
  const { rows: exams } = await client.query(`SELECT id, slug FROM exams WHERE is_active = true`);

  for (const exam of exams) {
    const list = specialtiesByExam[exam.slug];
    if (!list) continue;

    // Nullify all FK references then delete existing specialties for this exam
    await client.query(`UPDATE questions SET specialty_id = NULL, topic_id = NULL, subtopic_id = NULL WHERE exam_id = $1`, [exam.id]);
    await client.query(`UPDATE flashcards SET specialty_id = NULL, topic_id = NULL WHERE exam_id = $1`, [exam.id]);
    await client.query(`DELETE FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = $1))`, [exam.id]);
    await client.query(`DELETE FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = $1)`, [exam.id]);
    await client.query(`DELETE FROM specialties WHERE exam_id = $1`, [exam.id]);

    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const slug = `${exam.slug}-${s.en.toLowerCase().replace(/\s+/g, "-")}`;
      await client.query(
        `INSERT INTO specialties (exam_id, name, slug, sort_order) VALUES ($1, $2, $3, $4)`,
        [exam.id, JSON.stringify({ en: s.en, es: s.es }), slug, i],
      );
    }
    console.log(`Seeded ${list.length} specialties for ${exam.slug}`);
  }

  // Handle USMLE Step 2 — create exam if not exists
  let step2 = exams.find((e: any) => e.slug === usmleStep2Slug);
  if (!step2) {
    const { rows } = await client.query(
      `INSERT INTO exams (slug, name, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
      [usmleStep2Slug, JSON.stringify({ en: "USMLE Step 2 CK", es: "USMLE Step 2 CK" }), JSON.stringify({ en: "USMLE Step 2 Clinical Knowledge", es: "USMLE Step 2 Clinical Knowledge" }), 4],
    );
    step2 = { id: rows[0].id, slug: usmleStep2Slug };
    console.log(`Created exam: USMLE Step 2 CK`);
  }

  // Nullify all FK references then delete existing specialties for USMLE Step 2
  await client.query(`UPDATE questions SET specialty_id = NULL, topic_id = NULL, subtopic_id = NULL WHERE exam_id = $1`, [step2.id]);
  await client.query(`UPDATE flashcards SET specialty_id = NULL, topic_id = NULL WHERE exam_id = $1`, [step2.id]);
  await client.query(`DELETE FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = $1))`, [step2.id]);
  await client.query(`DELETE FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = $1)`, [step2.id]);
  await client.query(`DELETE FROM specialties WHERE exam_id = $1`, [step2.id]);

  for (let i = 0; i < usmleStep2Specialties.length; i++) {
    const s = usmleStep2Specialties[i];
    const slug = `${usmleStep2Slug}-${s.en.toLowerCase().replace(/\s+/g, "-")}`;
    await client.query(
      `INSERT INTO specialties (exam_id, name, slug, sort_order) VALUES ($1, $2, $3, $4)`,
      [step2.id, JSON.stringify({ en: s.en, es: s.es }), slug, i],
    );
  }
  console.log(`Seeded ${usmleStep2Specialties.length} specialties for ${usmleStep2Slug}`);

  client.release();
  await pool.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
