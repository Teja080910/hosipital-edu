import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const EXPORT_DIR = path.resolve(__dirname, "..", "exports");
const PROGRESS_FILE = path.join(EXPORT_DIR, "_progress.json");

// ─── Init Firebase Admin ─────────────────────────────────────────────────────

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (saPath) {
  const sa = JSON.parse(fs.readFileSync(saPath, "utf-8"));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else {
  // Try ADC (gcloud auth application-default-login)
  admin.initializeApp();
}

const firestore = admin.firestore();
firestore.settings({ preferRest: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flattenDoc(doc: admin.firestore.DocumentSnapshot): Record<string, any> {
  const data = doc.data();
  if (!data) return { _id: doc.id, _path: doc.ref.path };
  return { _id: doc.id, _path: doc.ref.path, ...data };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function deduplicate(docs: Record<string, any>[]): Record<string, any>[] {
  const seen = new Set<string>();
  return docs.filter((d) => {
    const key = d._id || d._path || uuidv4();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Paginated Collection Export ─────────────────────────────────────────────

async function exportCollection(
  collectionRef: admin.firestore.CollectionReference,
  outputPath: string,
  batchSize = 500,
): Promise<number> {
  const allDocs: Record<string, any>[] = [];
  let lastDoc: admin.firestore.DocumentSnapshot | null = null;
  let total = 0;
  let batches = 0;

  console.log(`  ${collectionRef.path}`);

  while (true) {
    let query: admin.firestore.Query = collectionRef
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(batchSize);

    if (lastDoc) query = query.startAfter(lastDoc);

    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      allDocs.push(flattenDoc(doc));
      total++;
    }

    batches++;
    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    if (batches % 10 === 0) {
      process.stdout.write(`\r    ${total} documents (${batches} batches)`);
    }
  }

  if (batches > 0) {
    process.stdout.write(`\r    ${total} documents (${batches} batches)`);
  }
  console.log("");

  // Deduplicate and write
  const unique = deduplicate(allDocs);
  if (unique.length !== allDocs.length) {
    console.log(`    Removed ${allDocs.length - unique.length} duplicates`);
  }

  if (unique.length > 0) {
    writeJsonAtomic(outputPath, unique);
  }

  return unique.length;
}

// ─── Atomic JSON write ───────────────────────────────────────────────────────

function writeJsonAtomic(filePath: string, data: any) {
  const tmp = filePath + ".tmp." + uuidv4().slice(0, 8);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
}

// ─── Save progress for resumability ──────────────────────────────────────────

function saveProgress(results: { collection: string; docs: number; error?: string }[]) {
  writeJsonAtomic(PROGRESS_FILE, {
    exportedAt: new Date().toISOString(),
    collections: results,
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Firestore Live Export Tool");
  console.log("==========================\n");
  console.log(`Reading from project: ${process.env.GOOGLE_CLOUD_PROJECT || "(detected from credentials)"}\n`);

  ensureDir(EXPORT_DIR);

  // List all top-level collections
  const collections = await firestore.listCollections();
  const collectionNames = collections.map((c) => c.id).sort();

  if (collectionNames.length === 0) {
    console.log("No collections found. Check credentials.");
    process.exit(1);
  }

  console.log(`Found ${collectionNames.length} collections:\n`);
  for (const name of collectionNames) {
    console.log(`  - ${name}`);
  }
  console.log("");

  // Export each
  const results: { collection: string; docs: number }[] = [];
  let totalDocs = 0;

  for (const name of collectionNames) {
    const outputPath = path.join(EXPORT_DIR, `${name}.json`);
    console.log(`Exporting ${name} ...`);

    try {
      const count = await exportCollection(firestore.collection(name), outputPath);
      results.push({ collection: name, docs: count });
      totalDocs += count;
      saveProgress(results);
    } catch (err: any) {
      console.error(`  FAILED: ${err.message}`);
      results.push({ collection: name, docs: 0, error: err.message } as any);
      saveProgress(results);
    }
  }

  // Summary
  console.log("\n=== Export Summary ===");
  for (const r of results) {
    if ((r as any).error) {
      console.log(`  ${r.collection}: FAILED - ${(r as any).error}`);
    } else {
      console.log(`  ${r.collection}: ${r.docs} documents`);
    }
  }
  console.log(`\n  Total: ${totalDocs} documents across ${results.length} collections`);
  console.log(`  Output: ${EXPORT_DIR}/\n`);

  writeJsonAtomic(path.join(EXPORT_DIR, "_summary.json"), {
    exportedAt: new Date().toISOString(),
    totalCollections: results.length,
    totalDocuments: totalDocs,
    collections: results,
  });
}

main().catch((err) => {
  console.error("\nExport failed:", err);
  process.exit(1);
});
