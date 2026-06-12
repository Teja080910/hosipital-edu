import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "process.env.DATABASE_URL",
});

const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN || "";
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

async function main() {
  const list = await fetch(`${CF_BASE}`, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  }).then((r) => r.json());
  const cfVideos: any[] = list.result || [];
  console.log(`CF videos: ${cfVideos.length}`);

  const { rows: driveLessons } = await pool.query(
    `SELECT id, title->>'en' as title, video_url FROM video_lessons WHERE video_url LIKE '%drive.google.com%'`,
  );
  console.log(`Drive lessons: ${driveLessons.length}\n`);

  // Map: CF name → uid
  const cfByName: Record<string, string> = {};
  for (const v of cfVideos) {
    const name = (v.meta?.name || "").trim().toLowerCase();
    if (name) cfByName[name] = v.uid;
  }

  let matched = 0;
  for (const lesson of driveLessons) {
    const title = (lesson.title || "").trim();
    if (!title) continue;

    const lower = title.toLowerCase();
    let uid =
      cfByName[lower] ||
      Object.entries(cfByName).find(
        ([k]) => lower.includes(k) || k.includes(lower),
      )?.[1];

    if (uid) {
      await pool.query("UPDATE video_lessons SET video_url = $1 WHERE id = $2", [
        uid,
        lesson.id,
      ]);
      console.log(`  ✓ ${title.slice(0, 50)} → ${uid.slice(0, 8)}`);
      matched++;
    } else {
      console.log(`  ✗ ${title.slice(0, 50)} — not on CF`);
    }
  }

  // Fix ?tusv2=true suffix
  const { rowCount } = await pool.query(
    `UPDATE video_lessons SET video_url = split_part(video_url, '?', 1) WHERE video_url LIKE '%?tusv2=true%'`,
  );
  console.log(`\nFixed ?tusv2=true: ${rowCount}`);

  // Set names on unnamed CF videos
  for (const v of cfVideos) {
    if (v.meta?.name) continue;
    const { rows } = await pool.query(
      `SELECT title->>'en' as t FROM video_lessons WHERE video_url LIKE $1 LIMIT 1`,
      [`${v.uid}%`],
    );
    if (rows[0]?.t) {
      await fetch(`${CF_BASE}/${v.uid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meta: { name: rows[0].t } }),
      });
      console.log(`  Named: ${v.uid.slice(0, 8)} → ${rows[0].t.slice(0, 50)}`);
    }
  }

  console.log(`\nDone. Updated: ${matched}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});