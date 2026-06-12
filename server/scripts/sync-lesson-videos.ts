import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/database/schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "process.env.DATABASE_URL",
});
const db = drizzle(pool, { schema });

const CLOUDFLARE_HASH =
  process.env.CLOUDFLARE_CUSTOMER_CODE;

function cloudflareUrl(uid: string) {
  return `https://customer-${CLOUDFLARE_HASH}.cloudflarestream.com/${uid}/iframe`;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getText(obj: any): string {
  if (typeof obj === "string") return obj;
  return obj?.en || obj?.es || JSON.stringify(obj);
}

async function main() {
  const videoLessons = await db
    .select()
    .from(schema.videoLessons);

  const vids = videoLessons.filter((v: any) => v.videoUrl?.length > 5);
  console.log(`Video lessons with real URLs: ${vids.length}`);

  const courseLessons = await db
    .select()
    .from(schema.courseLessons)
    .where(eq(schema.courseLessons.contentType, "video"));

  console.log(`Course video lessons: ${courseLessons.length}`);

  let updated = 0;
  for (const lesson of courseLessons) {
    const lessonTitle = getText(lesson.title);
    const nLesson = norm(lessonTitle);

    const match = vids.find((v: any) => {
      const vTitle = getText(v.title);
      const nVid = norm(vTitle);
      return nVid === nLesson || nVid.includes(nLesson) || nLesson.includes(nVid);
    });

    if (match) {
      const uid = match.videoUrl || "";
      const url = cloudflareUrl(uid);
      await db
        .update(schema.courseLessons)
        .set({ videoUrl: url })
        .where(eq(schema.courseLessons.id, lesson.id));
      console.log(`  Updated: "${lessonTitle}" -> ${url}`);
      updated++;
    } else {
      console.log(`  No match: "${lessonTitle}" — using Google Drive URL`);
      const driveUrls: Record<string, string> = {
        "Cardiac Anatomy and Embryology": "https://drive.google.com/file/d/1c7kmqOUDFDpiPs6gjHdnxEfHSciHz6Tf/preview",
        "Cardiac Physiology": "https://drive.google.com/file/d/1c7kmqOUDFDpiPs6gjHdnxEfHSciHz6Tf/preview",
        "Pulmonary Anatomy": "https://drive.google.com/file/d/1BCcJVsRgEVWfNEAbiZH-b2OzCeBwfgsD/preview",
        "Ventilation and Gas Exchange": "https://drive.google.com/file/d/13_E4tGqrGMnA8klPOsMX0y7UPAKtP2gt/preview",
        "Cardiovascular Diseases in Mexico": "https://drive.google.com/file/d/1c7kmqOUDFDpiPs6gjHdnxEfHSciHz6Tf/preview",
        "Diabetes and Metabolic Syndrome": "https://drive.google.com/file/d/18nmCenFWFTEDxpMIS5VapXCq45rJuHQx/preview",
        "Vector-Borne Diseases": "https://drive.google.com/file/d/13ugBNyj-Sk4i-xiXAi4SQ8dJ8OOG3eAv/preview",
        "General Surgery Principles": "https://drive.google.com/file/d/1pL2mJ0jfxbCBZmP4ATr_8x2ft10w4mOx/preview",
        "Abdominal Surgery": "https://drive.google.com/file/d/6469a254e6ffcb118520f60613c440c7/preview",
      };
      const driveUrl = driveUrls[lessonTitle] || driveUrls[Object.keys(driveUrls).find(k => lessonTitle.includes(k) || k.includes(lessonTitle)) || ""];
      if (driveUrl) {
        await db
          .update(schema.courseLessons)
          .set({ videoUrl: driveUrl })
          .where(eq(schema.courseLessons.id, lesson.id));
        console.log(`  Set Drive URL: "${lessonTitle}" -> ${driveUrl}`);
        updated++;
      }
    }
  }

  console.log(`\nDone. Updated: ${updated}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});