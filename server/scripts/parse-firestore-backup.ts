import * as fs from "fs";
import * as path from "path";
import * as protobuf from "protobufjs";

// ─── Config ──────────────────────────────────────────────────────────────────

const BACKUP_DIR = path.resolve(
  process.env.HOME || "/home/teja",
  "firestore-backup",
  "firestore-backup",
  "all_namespaces",
  "all_kinds",
);
const OUTPUT_DIR = path.resolve(__dirname, "..", "exports");
const PROTO_DIR = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@google-cloud",
  "firestore",
  "build",
  "protos",
);

// Collection name overrides for consistency
const COLLECTION_ALIASES: Record<string, string> = {
  appusers: "appusers",
  appuserexams: "appuserexams",
  appuserflashcardexams: "appuserflashcardexams",
  appusermemberships: "appusermemberships",
  appusermembershippurchases: "appusermembershippurchases",
  categorys: "categorys",
  flashcardcategorys: "flashcardcategorys",
  flashcardquestions: "flashcardquestions",
  memberships: "memberships",
  parameters: "parameters",
  questions: "questions",
  videocategorys: "videocategorys",
  videos: "videos",
};

// ─── Protobuf Setup ──────────────────────────────────────────────────────────

async function loadProto(): Promise<protobuf.Type> {
  const root = new protobuf.Root();
  root.resolvePath = (origin, target) => {
    if (!origin) {
      return fs.existsSync(target) ? target : null;
    }
    const fromOrigin = path.resolve(path.dirname(origin), target);
    if (fs.existsSync(fromOrigin)) return fromOrigin;
    const fromProto = path.resolve(PROTO_DIR, target);
    if (fs.existsSync(fromProto)) return fromProto;
    return null;
  };

  const docProtoPath = path.join(
    PROTO_DIR,
    "google",
    "firestore",
    "v1",
    "document.proto",
  );
  root.loadSync(docProtoPath);
  return root.lookupType("google.firestore.v1.Document");
}

// ─── Backup File Reader ──────────────────────────────────────────────────────

function* readDelimited(
  buffer: Buffer,
  DocumentType: protobuf.Type,
): Generator<any> {
  let offset = 0;
  while (offset < buffer.length) {
    let len = 0;
    let lenOffset = offset;
    let shift = 0;

    while (lenOffset < buffer.length) {
      const byte = buffer[lenOffset++];
      len |= (byte & 0x7f) << shift;
      shift += 7;
      if (!(byte & 0x80)) break;
    }

    const varintLen = lenOffset - offset;

    if (lenOffset + len > buffer.length) {
      console.error(`  WARNING: truncated message at offset ${offset}, skipping`);
      break;
    }

    const msgBuf = buffer.subarray(lenOffset, lenOffset + len);
    try {
      const decoded = DocumentType.decode(msgBuf);
      yield decoded;
    } catch (err: any) {
      console.error(`  WARNING: failed to decode message at offset ${offset}: ${err.message}`);
    }

    offset = lenOffset + len;
  }
}

// ─── Firestore Value Parser ──────────────────────────────────────────────────

function parseValue(value: any): any {
  if (value === null || value === undefined) return null;

  if (typeof value !== "object") return value;

  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.bytesValue !== undefined) return Buffer.from(value.bytesValue).toString("base64");
  if (value.referenceValue !== undefined) return value.referenceValue;

  if (value.timestampValue) {
    const ts = value.timestampValue;
    if (ts.seconds !== undefined) {
      const secs = typeof ts.seconds === "number" ? ts.seconds : Number(ts.seconds);
      return new Date(secs * 1000 + (ts.nanos || 0) / 1e6).toISOString();
    }
    return ts;
  }

  if (value.geoPointValue) {
    return {
      _latitude: value.geoPointValue.latitude ?? value.geoPointValue.latitude,
      _longitude: value.geoPointValue.longitude ?? value.geoPointValue.longitude,
    };
  }

  if (value.nullValue !== undefined) return null;

  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(parseValue);
  }

  if (value.mapValue) {
    return parseFields(value.mapValue.fields || {});
  }

  return value;
}

function parseFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseValue(value);
  }
  return result;
}

function getCollectionName(documentName: string): string | null {
  // Format: projects/{project}/databases/{db}/documents/{collection}/{docId}
  // Or with subcollections: projects/{project}/databases/{db}/documents/{collection}/{docId}/{subcollection}/{subId}
  const parts = documentName.split("/documents/");
  if (parts.length !== 2) return null;

  const pathParts = parts[1].split("/");
  // Even indexing: collection names are at even indices
  return pathParts[0];
}

function getDocId(documentName: string): string {
  return documentName.split("/").pop() || "";
}

function convertDocument(doc: any): Record<string, any> | null {
  const name = doc.name;
  if (!name) return null;

  const fields = doc.fields || {};
  const data = parseFields(fields);

  return {
    _id: getDocId(name),
    _path: name,
    ...data,
    _createTime: doc.createTime
      ? new Date(
          Number(doc.createTime.seconds || 0) * 1000 +
            (doc.createTime.nanos || 0) / 1e6,
        ).toISOString()
      : null,
    _updateTime: doc.updateTime
      ? new Date(
          Number(doc.updateTime.seconds || 0) * 1000 +
            (doc.updateTime.nanos || 0) / 1e6,
        ).toISOString()
      : null,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Firestore Backup Parser");
  console.log("=======================\n");

  // Check backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`Backup directory not found: ${BACKUP_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("output-"))
    .sort((a, b) => {
      const na = parseInt(a.replace("output-", ""), 10);
      const nb = parseInt(b.replace("output-", ""), 10);
      return na - nb;
    });

  console.log(`Found ${files.length} backup shard files in ${BACKUP_DIR}\n`);

  // Load protobuf schema
  console.log("Loading protobuf schema...");
  const DocumentType = await loadProto();
  console.log("OK\n");

  // Process files in parallel batches
  const BATCH_SIZE = 4;
  const allDocsByCollection: Map<string, Record<string, any>[]> = new Map();
  let totalParsed = 0;
  let totalErrors = 0;

  for (let batchStart = 0; batchStart < files.length; batchStart += BATCH_SIZE) {
    const batch = files.slice(batchStart, batchStart + BATCH_SIZE);
    const batchPromises = batch.map(async (file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const buffer = fs.readFileSync(filePath);
      const docs: any[] = [];

      for (const msg of readDelimited(buffer, DocumentType)) {
        docs.push(msg);
      }

      return { file, docs, errors: 0 };
    });

    const results = await Promise.all(batchPromises);

    for (const { file, docs } of results) {
      for (const doc of docs) {
        const name = (doc as any).name;
        if (!name) {
          totalErrors++;
          continue;
        }

        const collection = getCollectionName(name);
        if (!collection) {
          totalErrors++;
          continue;
        }

        const converted = convertDocument(doc);
        if (!converted) {
          totalErrors++;
          continue;
        }

        const list = allDocsByCollection.get(collection) || [];
        list.push(converted);
        allDocsByCollection.set(collection, list);
        totalParsed++;
      }
    }

    const progress = Math.min(batchStart + BATCH_SIZE, files.length);
    console.log(`  Processed ${progress}/${files.length} shards (${totalParsed} documents)`);
  }

  console.log(`\nParsed ${totalParsed} documents across ${allDocsByCollection.size} collections`);
  if (totalErrors > 0) {
    console.log(`  (${totalErrors} errors/items skipped)`);
  }

  // Deduplicate per collection (same doc can appear across shards)
  console.log("\nDeduplicating ...");
  let totalDeduped = 0;
  for (const [name, docs] of allDocsByCollection) {
    const seen = new Set<string>();
    allDocsByCollection.set(
      name,
      docs.filter((d) => {
        const key = d._id;
        if (seen.has(key)) {
          totalDeduped++;
          return false;
        }
        seen.add(key);
        return true;
      }),
    );
  }
  if (totalDeduped > 0) {
    console.log(`  Removed ${totalDeduped} duplicate documents`);
  }

  // Write output
  console.log("\nWriting output files ...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results: { collection: string; docs: number }[] = [];
  let totalWritten = 0;

  const sortedCollections = Array.from(allDocsByCollection.keys()).sort();
  for (const name of sortedCollections) {
    const docs = allDocsByCollection.get(name)!;
    const alias = COLLECTION_ALIASES[name] || name;
    const outputPath = path.join(OUTPUT_DIR, `${alias}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2), "utf-8");
    results.push({ collection: name, docs: docs.length });
    totalWritten += docs.length;

    console.log(`  ${alias}.json: ${docs.length} documents`);
  }

  // Summary
  console.log("\n=== Export Summary ===");
  for (const r of results) {
    console.log(`  ${r.collection}: ${r.docs} documents`);
  }
  console.log(`\n  Total: ${totalWritten} documents across ${results.length} collections`);
  console.log(`  Output: ${OUTPUT_DIR}/`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_summary.json"),
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        source: BACKUP_DIR,
        shardFiles: files.length,
        totalCollections: results.length,
        totalDocuments: totalWritten,
        collections: results,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

main().catch((err) => {
  console.error("\nExport failed:", err);
  process.exit(1);
});
