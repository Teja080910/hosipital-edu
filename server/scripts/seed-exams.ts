import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "process.env.DATABASE_URL",
});

const DATA_DIR = path.join(__dirname, "firebase-data");

function parseFields(fields: Record<string, any>): Record<string, any> {
  const r: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) r[k] = v.stringValue;
    else if (v.integerValue !== undefined) r[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) r[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) r[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) r[k] = new Date(v.timestampValue);
    else if (v.mapValue) r[k] = parseMap(v.mapValue);
    else if (v.arrayValue) r[k] = parseArr(v.arrayValue);
  }
  return r;
}

function parseMap(map: any): Record<string, any> {
  return map.fields ? parseFields(map.fields) : {};
}

function parseArr(arr: any): any[] {
  if (!arr.values) return [];
  return arr.values.map((v: any) => {
    if (v.stringValue !== undefined) return v.stringValue;
    if (v.integerValue !== undefined) return Number(v.integerValue);
    if (v.doubleValue !== undefined) return v.doubleValue;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.mapValue) return parseMap(v.mapValue);
    if (v.arrayValue) return parseArr(v.arrayValue);
    return null;
  });
}

function getCatIdFromName(name: string): string | null {
  for (const p of name.split("/")) {
    if (p.startsWith("C_")) return p.slice(2).split("_I_")[0];
  }
  return null;
}

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

const EXAMS = [
  { slug: "enarm", name: { en: "ENARM", es: "ENARM" }, description: { en: "Examen Nacional de Aspirantes a Residencias Médicas - Mexico", es: "Examen Nacional de Aspirantes a Residencias Médicas - México" }, sortOrder: 0 },
  { slug: "enurm", name: { en: "ENURM", es: "ENURM" }, description: { en: "Examen Nacional de Ubicación y Recursos Médicos - Mexico", es: "Examen Nacional de Ubicación y Recursos Médicos - México" }, sortOrder: 1 },
  { slug: "mir", name: { en: "MIR", es: "MIR" }, description: { en: "Médico Interno Residente - Spain", es: "Médico Interno Residente - España" }, sortOrder: 2 },
  { slug: "usmle-step-1", name: { en: "USMLE Step 1", es: "USMLE Step 1" }, description: { en: "United States Medical Licensing Examination - Step 1", es: "United States Medical Licensing Examination - Step 1" }, sortOrder: 3 },
];

const EXAM_TYPE_TO_SLUG: Record<string, string> = {
  ENARM: "enarm", ENURM: "enurm", MIR: "mir", USMLE: "usmle-step-1",
};

async function ensureExam(ex: typeof EXAMS[0]): Promise<string> {
  const { rows } = await pool.query("SELECT id FROM exams WHERE slug = $1", [ex.slug]);
  if (rows.length) {
    console.log(`  Exam exists: ${ex.slug}`);
    return rows[0].id;
  }
  const r = await pool.query(
    "INSERT INTO exams (slug, name, description, sort_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id",
    [ex.slug, JSON.stringify(ex.name), JSON.stringify(ex.description), ex.sortOrder],
  );
  console.log(`  Created exam: ${ex.slug}`);
  return r.rows[0].id;
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

async function main() {
  console.log("=== Seed Exams from Firebase Data ===\n");

  if (!fs.existsSync(path.join(DATA_DIR, "questions.json"))) {
    console.error("Firebase data not found in", DATA_DIR);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "questions.json"), "utf-8"));
  const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "categorys.json"), "utf-8"));

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const f = parseFields(c.fields);
    catMap[f.id] = f.title;
  }

  const examSlugToId: Record<string, string> = {};
  for (const ex of EXAMS) {
    examSlugToId[ex.slug] = await ensureExam(ex);
  }

  const specTopicCache: Record<string, { specialtyId: string; topicId: string }> = {};
  let linked = 0;
  let skipped = 0;

  for (const q of questions) {
    const f = parseFields(q.fields);
    const text = (f.title || "").trim();
    if (!text) { skipped++; continue; }

    const catId = getCatIdFromName(q.name);
    const catTitle = catMap[catId || ""];
    if (!catTitle) { skipped++; continue; }

    let examSlug = EXAM_TYPE_TO_SLUG[f.examType];
    if (!examSlug) {
      const upper = catTitle.toUpperCase();
      if (upper.startsWith("ENARM -") || upper.includes("- ENARM")) examSlug = "enarm";
      else if (upper.startsWith("ENURM -")) examSlug = "enurm";
      else if (upper.startsWith("USMLE")) examSlug = "usmle-step-1";
      else examSlug = "mir";
    }

    const examId = examSlugToId[examSlug];
    if (!examId) { skipped++; continue; }

    const cacheKey = `${examSlug}::${catTitle}`;
    if (!specTopicCache[cacheKey]) {
      specTopicCache[cacheKey] = await getOrCreateSpecialtyTopic(examId, catTitle);
    }
    const { specialtyId, topicId } = specTopicCache[cacheKey];

    const { rows: existing } = await pool.query(
      "SELECT id FROM questions WHERE text = $1 LIMIT 1", [text],
    );
    if (!existing.length) { skipped++; continue; }

    await pool.query(
      "UPDATE questions SET exam_id = $1, specialty_id = $2, topic_id = $3 WHERE id = $4",
      [examId, specialtyId, topicId, existing[0].id],
    );
    linked++;
  }

  console.log(`\n=== Summary ===`);
  for (const ex of EXAMS) {
    const eid = examSlugToId[ex.slug];
    const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM questions WHERE exam_id = $1 AND is_active = true", [eid]);
    const { rows: specs } = await pool.query("SELECT COUNT(*)::int AS c FROM specialties WHERE exam_id = $1", [eid]);
    console.log(`  ${ex.slug}: ${rows[0].c} questions, ${specs[0].c} specialties`);
  }
  console.log(`\nTotal linked: ${linked}, skipped: ${skipped}`);
  await pool.end();
}

main().catch((e) => { console.error("Failed:", e.message); process.exit(1); });