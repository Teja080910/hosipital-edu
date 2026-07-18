import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql, and } from "drizzle-orm";
import * as schema from "../src/database/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "process.env.DATABASE_URL",
});
const db = drizzle(pool, { schema });

const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN || "";
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

async function cfFetch(path: string) {
  const res = await fetch(`${CF_BASE}${path}`, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
  });
  const json: any = await res.json();
  if (!json.success) throw new Error(`CF API error: ${json.errors?.[0]?.message}`);
  return json;
}

async function listAllCfVideos(): Promise<any[]> {
  const all: any[] = [];
  let cursor: string | null = null;
  do {
    const params = cursor ? `?after=${cursor}` : "";
    const json = await cfFetch(params);
    all.push(...(json.result || []));
    cursor = json.result_info?.next_cursor || null;
  } while (cursor);
  return all;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

async function main() {
  console.log("=== Link Cloudflare Videos to DB Lessons ===\n");

  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.error("Missing CLOUDFLARE_STREAM_TOKEN or CLOUDFLARE_ACCOUNT_ID in .env");
    await pool.end();
    process.exit(1);
  }

  // 1. Fetch all lessons from DB
  const lessons = await db
    .select({
      id: schema.videoLessons.id,
      moduleId: schema.videoLessons.moduleId,
      title: schema.videoLessons.title,
      videoUrl: schema.videoLessons.videoUrl,
      duration: schema.videoLessons.duration,
    })
    .from(schema.videoLessons)
    .where(eq(schema.videoLessons.isActive, true));

  console.log(`DB lessons: ${lessons.length}`);

  // Build lookup: normalized title -> lesson
  const lessonByNormalizedTitle = new Map<string, typeof lessons[number]>();
  // Build lookup: Drive file ID -> lesson
  const lessonByDriveId = new Map<string, typeof lessons[number]>();
  for (const l of lessons) {
    const title = (l.title as any)?.en || "";
    if (title) {
      const key = normalize(title);
      if (!lessonByNormalizedTitle.has(key)) {
        lessonByNormalizedTitle.set(key, l);
      }
    }
    const driveMatch = (l.videoUrl || "").match(/\/d\/([^/]+)/);
    if (driveMatch) {
      lessonByDriveId.set(driveMatch[1], l);
    }
  }

  // 2. Fetch all videos from Cloudflare
  const cfVideos = await listAllCfVideos();
  console.log(`Cloudflare videos: ${cfVideos.length}\n`);

  let matched = 0;
  let skipped = 0;
  let unmatched: any[] = [];
  let updated = 0;

  for (const v of cfVideos) {
    const uid = v.uid;
    const name = v.meta?.name || "";
    const cfDuration = Math.round(v.duration || 0);

    if (!name) {
      unmatched.push(v);
      continue;
    }

    const key = normalize(name);
    let lesson = lessonByNormalizedTitle.get(key);

    // Fallback: try matching by Google Drive file ID embedded in the name
    if (!lesson) {
      const driveIdMatch = name.match(/^([^/]+?)\.mp4$/);
      if (driveIdMatch) {
        lesson = lessonByDriveId.get(driveIdMatch[1]);
      }
    }

    if (!lesson) {
      unmatched.push(v);
      continue;
    }

    // Check if already linked to a CF UID
    const existingUrl = lesson.videoUrl || "";
    if (existingUrl.includes(uid)) {
      skipped++;
      continue;
    }

    // Update the lesson
    await db
      .update(schema.videoLessons)
      .set({
        videoUrl: uid,
        duration: cfDuration || lesson.duration,
      })
      .where(eq(schema.videoLessons.id, lesson.id));

    console.log(`  LINKED: "${name}" → lesson ${lesson.id.slice(0, 8)} (uid: ${uid.slice(0, 8)})`);
    updated++;
    matched++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Matched & updated: ${updated}`);
  console.log(`  Already linked:    ${skipped}`);
  console.log(`  Unmatched:         ${unmatched.length}`);

  if (unmatched.length > 0) {
    console.log(`\n--- Unmatched Videos ---`);
    for (const v of unmatched) {
      const name = v.meta?.name || "(no name)";
      console.log(`  [${v.uid.slice(0, 8)}] ${name} (${Math.round(v.duration || 0)}s)`);
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
