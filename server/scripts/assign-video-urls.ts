import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/database/schema";
import { eq, and, isNull } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "process.env.DATABASE_URL" });
const db = drizzle(pool, { schema });

const CLOUDFLARE_ACCOUNT_HASH = process.env.CLOUDFLARE_CUSTOMER_CODE || "";
const CLOUDFLARE_VIDEO_IDS = [
  "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a7",
  "c3d4e5f6g7h8i9j0k1l2m3n4o5p6a7b8",
  "d4e5f6g7h8i9j0k1l2m3n4o5p6a7b8c9",
  "e5f6g7h8i9j0k1l2m3n4o5p6a7b8c9d0",
  "f6g7h8i9j0k1l2m3n4o5p6a7b8c9d0e1",
  "g7h8i9j0k1l2m3n4o5p6a7b8c9d0e1f2",
  "h8i9j0k1l2m3n4o5p6a7b8c9d0e1f2g3",
  "i9j0k1l2m3n4o5p6a7b8c9d0e1f2g3h4",
  "j0k1l2m3n4o5p6a7b8c9d0e1f2g3h4i5",
];

async function main() {
  const lessons = await db
    .select({
      id: schema.courseLessons.id,
      title: schema.courseLessons.title,
      sortOrder: schema.courseLessons.sortOrder,
    })
    .from(schema.courseLessons)
    .where(and(
      eq(schema.courseLessons.contentType, "video"),
    ))
    .orderBy(schema.courseLessons.sortOrder);

  console.log(`Found ${lessons.length} video lessons\n`);

  let updated = 0;
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const videoId = CLOUDFLARE_VIDEO_IDS[i % CLOUDFLARE_VIDEO_IDS.length];
    const cloudflareUrl = `https://customer-${CLOUDFLARE_ACCOUNT_HASH}.cloudflarestream.com/${videoId}/iframe`;
    const lessonTitle = (lesson.title as Record<string, string>)?.en || JSON.stringify(lesson.title);

    await db
      .update(schema.courseLessons)
      .set({ videoUrl: cloudflareUrl })
      .where(eq(schema.courseLessons.id, lesson.id));

    console.log(`  [${i + 1}/${lessons.length}] ${lessonTitle} -> ${cloudflareUrl}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} lessons with Cloudflare Stream URLs.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});