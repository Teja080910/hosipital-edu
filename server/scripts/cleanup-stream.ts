import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/database/schema";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/hospital_edu",
});
const db = drizzle(pool, { schema });

const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN || "";
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

async function cfFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${CF_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (init?.method === "DELETE") {
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`DELETE failed: ${res.status} ${body.slice(0, 200)}`);
    }
    return { success: true };
  }
  const json: any = await res.json();
  if (!json.success) {
    throw new Error(`CF API error: ${json.errors?.[0]?.message}`);
  }
  return json;
}

async function main() {
  console.log("Cloudflare Stream Storage Cleanup\n");

  // 1. Get all UIDs used in DB
  const lessons = await db
    .select({ videoUrl: schema.videoLessons.videoUrl })
    .from(schema.videoLessons)
    .where(sql`${schema.videoLessons.videoUrl} IS NOT NULL`);
  const usedUids = new Set(lessons.map((l) => l.videoUrl.split("?")[0]));

  console.log(`Used in DB: ${usedUids.size} videos`);

  // 2. List all videos on Cloudflare
  let allVideos: any[] = [];
  let cursor: string | null = null;
  do {
    const params = cursor ? `?after=${cursor}` : "";
    const json = await cfFetch(params);
    allVideos = allVideos.concat(json.result || []);
    cursor = json.result_info?.next_cursor || null;
  } while (cursor);

  console.log(`On Cloudflare: ${allVideos.length} videos\n`);

  // 3. Find deletable videos
  const toDelete: any[] = [];
  for (const v of allVideos) {
    const uid = v.uid;
    const name = v.meta?.name || "";
    const isUsed = usedUids.has(uid);

    if (isUsed) {
      console.log(`  KEEP  [${uid.slice(0, 8)}] ${name || "(no name)"}`);
      continue;
    }

    if (!name) {
      toDelete.push(v);
      console.log(`  DEL   [${uid.slice(0, 8)}] (no name) — ${(v.duration || 0).toFixed(0)}s`);
    } else {
      console.log(`  SKIP  [${uid.slice(0, 8)}] ${name} — has name but not in DB`);
    }
  }

  if (toDelete.length === 0) {
    console.log("\nNo unnamed videos to delete.");
    await pool.end();
    return;
  }

  const totalMin = toDelete.reduce((s, v) => s + (v.duration || 0), 0) / 60;

  console.log(`\n=== Summary ===`);
  console.log(`  Unnamed videos: ${toDelete.length}`);
  console.log(`  Total duration: ${totalMin.toFixed(0)} min`);
  console.log(`  Estimated freed storage: ~${(totalMin / 100).toFixed(1)}% of $5 plan\n`);

  // 4. Delete them
  for (const v of toDelete) {
    try {
      await cfFetch(`/${v.uid}`, { method: "DELETE" });
      console.log(`  Deleted: [${v.uid.slice(0, 8)}] (${(v.duration || 0).toFixed(0)}s)`);
    } catch (err: any) {
      console.log(`  FAIL:   [${v.uid.slice(0, 8)}] ${err.message}`);
    }
  }

  console.log(`\nDone. Deleted ${toDelete.length} videos.`);

  // Re-run migrate-videos if needed
  console.log("\nRun 'npm run db:migrate-videos' to continue uploading remaining videos.");

  await pool.end();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});