import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "md-exam-app";
const GCLOUD_BIN = process.env.GCLOUD_BIN || "gcloud";
const API_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 500;
const OUTPUT_DIR = path.resolve(__dirname, "..", "exports");

// ─── Auth ────────────────────────────────────────────────────────────────────

function getToken(): string {
  return execSync(`"${GCLOUD_BIN}" auth print-access-token`, {
    encoding: "utf-8",
    timeout: 15000,
  }).trim();
}

// ─── API call ────────────────────────────────────────────────────────────────

async function runQuery(
  collectionId: string,
  startAfterRef: string | null,
  token: string,
): Promise<{ documents: any[]; hasMore: boolean }> {
  const query: any = {
    structuredQuery: {
      from: [{ collectionId }],
      orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }],
      limit: PAGE_SIZE,
    },
  };

  if (startAfterRef) {
    query.structuredQuery.startAt = {
      values: [{ referenceValue: startAfterRef }],
      before: false,
    };
  }

  const resp = await fetch(`${API_BASE}:runQuery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 300)}`);
  }

  const result: any[] = await resp.json();
  const documents: any[] = [];

  for (const item of result) {
    if (item.document) {
      documents.push(item.document);
    }
  }

  return { documents, hasMore: documents.length > 0 };
}

async function listCollectionIds(token: string): Promise<string[]> {
  const resp = await fetch(`${API_BASE}:listCollectionIds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pageSize: 100 }),
  });
  const result = await resp.json();
  return result.collectionIds || [];
}

// ─── Field Parser ────────────────────────────────────────────────────────────

function parseValue(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return value;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.geoPointValue !== undefined) return { _latitude: value.geoPointValue.latitude, _longitude: value.geoPointValue.longitude };
  if (value.nullValue !== undefined) return null;
  if (value.bytesValue !== undefined) return Buffer.from(value.bytesValue, "base64url").toString("base64");
  if (value.referenceValue !== undefined) return value.referenceValue;
  if (value.arrayValue) return (value.arrayValue.values || []).map(parseValue);
  if (value.mapValue) return parseFields(value.mapValue.fields || {});
  return value;
}

function parseFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseValue(value);
  }
  return result;
}

function getDocId(documentName: string): string {
  return documentName.split("/").pop() || "";
}

function convertDocument(doc: any): Record<string, any> {
  return {
    _id: getDocId(doc.name),
    _path: doc.name,
    ...parseFields(doc.fields || {}),
    _createTime: doc.createTime || null,
    _updateTime: doc.updateTime || null,
  };
}

// ─── Write atomic JSON ───────────────────────────────────────────────────────

function writeJson(filePath: string, data: any) {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Firestore REST API Export");
  console.log("=========================\n");
  console.log(`Project: ${PROJECT_ID}\n`);

  const token = getToken();
  console.log("Authentication: OK\n");

  const collectionIds = await listCollectionIds(token);
  collectionIds.sort();

  console.log(`Found ${collectionIds.length} collections:\n`);
  for (const id of collectionIds) {
    console.log(`  - ${id}`);
  }
  console.log("");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results: { collection: string; docs: number }[] = [];
  let totalDocs = 0;

  for (const collectionId of collectionIds) {
    process.stdout.write(`Exporting ${collectionId} ...`);
    const allDocs: Record<string, any>[] = [];
    let startAfterRef: string | null = null;
    let pages = 0;

    while (true) {
      const freshToken = getToken();
      const { documents, hasMore } = await runQuery(collectionId, startAfterRef, freshToken);
      pages++;

      for (const doc of documents) {
        allDocs.push(convertDocument(doc));
      }

      process.stdout.write(`\r  ${collectionId}: ${allDocs.length} docs (${pages} pages)`);

      if (!hasMore || documents.length === 0) break;

      startAfterRef = documents[documents.length - 1].name;
    }

    console.log("");

    if (allDocs.length > 0) {
      writeJson(path.join(OUTPUT_DIR, `${collectionId}.json`), allDocs);
    }

    results.push({ collection: collectionId, docs: allDocs.length });
    totalDocs += allDocs.length;
  }

  console.log("\n=== Export Summary ===");
  for (const r of results) {
    console.log(`  ${r.collection}: ${r.docs} documents`);
  }
  console.log(`\n  Total: ${totalDocs} documents across ${results.length} collections`);
  console.log(`  Output: ${OUTPUT_DIR}/`);

  writeJson(path.join(OUTPUT_DIR, "_summary.json"), {
    exportedAt: new Date().toISOString(),
    projectId: PROJECT_ID,
    totalCollections: results.length,
    totalDocuments: totalDocs,
    collections: results,
  });

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("\nExport failed:", err);
  process.exit(1);
});
