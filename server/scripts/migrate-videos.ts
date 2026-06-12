import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql, and } from "drizzle-orm";
import * as schema from "../src/database/schema";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "process.env.DATABASE_URL",
});
const db = drizzle(pool, { schema });

const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN || "";
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

const VIDEOS_JSON = path.join(__dirname, "firebase-data", "videos.json");
const TMP_DIR = path.join(__dirname, "firebase-data", ".video-tmp");

let totalMigrated = 0;
let totalFailed = 0;

function extractDriveId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

async function downloadWithGdown(fileId: string, outPath: string): Promise<void> {
  try {
    execSync(`gdown "https://drive.google.com/uc?id=${fileId}" -O "${outPath}"`, {
      stdio: "pipe",
      timeout: 600000,
    });
  } catch (err: any) {
    throw new Error(`gdown failed: ${err.stderr?.toString()?.slice(0, 300) || err.message}`);
  }
}

const CHUNK_SIZE = 50 * 1024 * 1024;

async function uploadToCf(filePath: string, videoName: string = ""): Promise<string | null> {
  const fileSize = fs.statSync(filePath).size;

  // Step 1: For files under 200MB, use basic POST with form-data
  // For files under 200MB, use basic POST with form-data
  if (fileSize <= 200 * 1024 * 1024) {
    const uploadRes = await fetch(`${CF_BASE}/direct_upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ maxDurationSeconds: 7200 }),
    });
    const uploadJson: any = await uploadRes.json();
    if (!uploadJson.success) {
      throw new Error(`direct_upload failed: ${uploadJson.errors?.[0]?.message}`);
    }
    const { uploadURL, uid } = uploadJson.result;

    const fileBuffer = fs.readFileSync(filePath);
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: "video/mp4" });
    formData.set("file", blob, path.basename(filePath));

    const postRes = await fetch(uploadURL, {
      method: "POST",
      body: formData,
    });
    if (!postRes.ok) {
      const body = await postRes.text();
      throw new Error(`Upload failed: ${postRes.status} ${body.slice(0, 200)}`);
    }
    return uid;
  }

  // Step 2: For files over 200MB, use TUS protocol
  // POST to API with TUS headers to get a one-time upload URL
  const tusRes = await fetch(`${CF_BASE}?direct_user=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(fileSize),
      "Upload-Metadata": `filename ${Buffer.from(path.basename(filePath)).toString("base64")}`,
    },
  });
  if (!tusRes.ok) {
    const body = await tusRes.text();
    // TUS init failed — check for quota
    const tusBody = await tusRes.clone().text();
    if (tusRes.status === 413) {
      console.log(`     [SKIP] Cloudflare storage quota exceeded. Upgrade your Stream plan or delete old videos.`);
      return null;
    }
    throw new Error(`TUS init failed: ${tusRes.status} ${tusBody.slice(0, 300)}`);
  }

  const location = tusRes.headers.get("Location");
  if (!location) throw new Error("TUS: no Location header in response");

  console.log(`     Upload endpoint: ${location.substring(0, 60)}...`);

  // Upload in chunks via PATCH to the signed URL
  const fd = fs.openSync(filePath, "r");
  let offset = 0;
  try {
    while (offset < fileSize) {
      const chunkSize = Math.min(100 * 1024 * 1024, fileSize - offset);
      const buf = Buffer.alloc(chunkSize);
      fs.readSync(fd, buf, 0, chunkSize, offset);

      const chunkRes = await fetch(location, {
        method: "PATCH",
        body: new Uint8Array(buf),
        headers: {
          "Tus-Resumable": "1.0.0",
          "Content-Type": "application/offset+octet-stream",
          "Upload-Offset": String(offset),
        },
      });
      if (!chunkRes.ok) {
        const body = await chunkRes.text();
        throw new Error(`Chunk failed at ${offset}: ${chunkRes.status} ${body.slice(0, 200)}`);
      }
      offset += chunkSize;
      process.stdout.write(`\r       ${(offset / 1024 / 1024).toFixed(0)}MB/${(fileSize / 1024 / 1024).toFixed(0)}MB (${((offset / fileSize) * 100).toFixed(0)}%)`);
    }
    process.stdout.write("\n");

    // UID is last segment of Location (strip any query params)
    const uid = location.split("/")?.pop()?.split("?")[0]?.split("&")[0] || "";
    return uid;
  } finally {
    fs.closeSync(fd);
  }
}

async function setVideoName(uid: string, name: string): Promise<void> {
  await fetch(`${CF_BASE}/${uid}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ meta: { name } }),
  });
}

async function pollCfVideo(uid: string, maxRetries = 120): Promise<{ ready: boolean; duration: number }> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(`${CF_BASE}/${uid}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    });
    const json: any = await res.json();
    if (json.success && json.result) {
      const status = json.result.status?.state;
      if (status === "ready") {
        return { ready: true, duration: json.result.duration || 0 };
      }
      if (status === "error") {
        throw new Error(`CF error: ${json.result.status?.errorReasonCode || "unknown"}`);
      }
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 2000));
  }
  return { ready: false, duration: 0 };
}

async function main() {
  console.log("Video Migration: gdown → Cloudflare Stream\n");

  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.error("Missing CLOUDFLARE_STREAM_TOKEN or CLOUDFLARE_ACCOUNT_ID in .env");
    await pool.end();
    process.exit(1);
  }

  if (!fs.existsSync(VIDEOS_JSON)) {
    console.error(`File not found: ${VIDEOS_JSON}`);
    await pool.end();
    process.exit(1);
  }

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const docs = JSON.parse(fs.readFileSync(VIDEOS_JSON, "utf-8"));
  console.log(`Found ${docs.length} videos\n`);

  for (let i = 0; i < docs.length; i++) {
    const f = docs[i].fields;
    const title = f.title?.stringValue || "";
    const url = f.url?.stringValue || "";

    if (!url) { console.log(`${i + 1}. [SKIP] ${title} — no URL`); continue; }

    const fileId = extractDriveId(url);
    if (!fileId) { console.log(`${i + 1}. [SKIP] ${title} — invalid URL`); continue; }

    console.log(`${i + 1}/${docs.length}: ${title}`);

    // Check if already migrated — find a lesson with this URL and see if it changed
    const existingLesson = await db
      .select({ id: schema.videoLessons.id, videoUrl: schema.videoLessons.videoUrl })
      .from(schema.videoLessons)
      .where(sql`${schema.videoLessons.videoUrl} = ${url}`)
      .limit(1);

    if (existingLesson.length === 0) {
      // Maybe already updated — check by title
      const byTitle = await db
        .select({ id: schema.videoLessons.id, videoUrl: schema.videoLessons.videoUrl })
        .from(schema.videoLessons)
        .where(
          and(
            sql`${schema.videoLessons.title}->>'en' = ${title.trim()}`,
            sql`${schema.videoLessons.videoUrl} NOT LIKE '%drive.google.com%'`,
          ),
        )
        .limit(1);
      if (byTitle.length) {
        console.log(`     [SKIP] Already migrated → ${byTitle[0].videoUrl}`);
        totalMigrated++;
        continue;
      }
    } else if (existingLesson[0].videoUrl && !existingLesson[0].videoUrl.includes("drive.google.com")) {
      console.log(`     [SKIP] Already migrated → ${existingLesson[0].videoUrl}`);
      totalMigrated++;
      continue;
    }

    const tmpFile = path.join(TMP_DIR, `${fileId}.mp4`);

    try {
      // 1. Download via gdown
      if (!fs.existsSync(tmpFile)) {
        console.log(`     Downloading via gdown...`);
        await downloadWithGdown(fileId, tmpFile);
        const size = fs.statSync(tmpFile).size;
        console.log(`     Downloaded: ${(size / 1024 / 1024).toFixed(1)} MB`);
      } else {
        console.log(`     Already downloaded, skipping download`);
      }

      // 2. Upload to Cloudflare Stream via TUS
      console.log(`     Uploading to Cloudflare...`);
      const uid = await uploadToCf(tmpFile, title);
      if (!uid) { console.log(`     [SKIP] Upload returned null`); totalFailed++; continue; }
      console.log(`     Uploaded (uid: ${uid}), processing`);
      await setVideoName(uid, title);
      console.log(`     Name set: ${title}`);

      // 4. Poll
      const result = await pollCfVideo(uid);
      console.log();
      if (!result.ready) {
        console.log(`     [WARN] Not ready after polling`);
      } else {
        console.log(`     Ready! ${result.duration.toFixed(0)}s`);
      }

      // 5. Update DB
      const existing = await db
        .select()
        .from(schema.videoLessons)
        .where(sql`${schema.videoLessons.videoUrl} = ${url}`)
        .limit(1);

      let lessonId = existing.length ? existing[0].id : null;

      if (!lessonId) {
        const byTitle = await db
          .select()
          .from(schema.videoLessons)
          .where(sql`${schema.videoLessons.title}->>'en' = ${title.trim()}`)
          .limit(1);
        if (byTitle.length) lessonId = byTitle[0].id;
      }

      if (lessonId) {
        await db.update(schema.videoLessons)
          .set({ videoUrl: uid as string, duration: Math.round(result.duration || 0) })
          .where(eq(schema.videoLessons.id, lessonId));
        console.log(`     DB updated → ${uid}`);
      } else {
        // Find module by category
        const cat = f.category?.mapValue?.fields;
        const catTitle = cat?.title?.stringValue || "";
        const mods = await db.select().from(schema.videoModules)
          .where(sql`${schema.videoModules.title}->>'en' = ${catTitle}`).limit(1);
        if (mods.length) {
          await db.insert(schema.videoLessons).values({
            moduleId: mods[0].id,
            title: { en: title.trim() },
            description: { en: "" },
            videoUrl: uid as string,
            duration: Math.round(result.duration || 0),
          });
          console.log(`     Created lesson in "${catTitle}"`);
        } else {
          console.log(`     [SKIP] No module for "${catTitle}"`);
        }
      }

      totalMigrated++;
    } catch (err: any) {
      console.log(`     [FAIL] ${err.message}`);
      totalFailed++;
    }
    console.log();
  }

  console.log("=== Complete ===");
  console.log(`  Migrated: ${totalMigrated}`);
  console.log(`  Failed:   ${totalFailed}`);

  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });