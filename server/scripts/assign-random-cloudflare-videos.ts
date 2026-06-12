import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "../src/database/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

const CLOUDFLARE_HASH =
  process.env.CLOUDFLARE_CUSTOMER_CODE;

async function main() {
  const realVideos = await db
    .select({ uid: schema.videoLessons.videoUrl })
    .from(schema.videoLessons)
    .where(
      and(
        sql`${schema.videoLessons.videoUrl} IS NOT NULL`,
        sql`${schema.videoLessons.videoUrl} != ''`,
      ),
    );

  const uids = realVideos.map((v: any) => v.uid);
  console.log(`Found ${uids.length} real Cloudflare video UIDs`);

  const courseLessons = await db
    .select()
    .from(schema.courseLessons)
    .where(eq(schema.courseLessons.contentType, "video"));

  console.log(`Updating ${courseLessons.length} course video lessons...`);

  let updated = 0;
  for (const lesson of courseLessons) {
    const randomUid = uids[Math.floor(Math.random() * uids.length)];
    const url = `https://customer-${CLOUDFLARE_HASH}.cloudflarestream.com/${randomUid}/iframe`;

    await db
      .update(schema.courseLessons)
      .set({ videoUrl: url })
      .where(eq(schema.courseLessons.id, lesson.id));

    const t = lesson.title as Record<string, string> | string;
    const title = typeof t === "string" ? t : t?.en || Object.values(t || {})[0] || "unknown";
    console.log(`  ${title} -> ${url}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} lessons.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});