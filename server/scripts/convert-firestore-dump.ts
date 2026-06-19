import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const INPUT_DIR = path.resolve(__dirname, "..", "..", "firebase_dump", "consolidated");
const OUTPUT_DIR = path.resolve(__dirname, "..", "exports");

// ─── Firestore field parsers ─────────────────────────────────────────────────

function parseFields(fields: Record<string, any>): Record<string, any> {
  const r: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) r[k] = v.stringValue;
    else if (v.integerValue !== undefined) r[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) r[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) r[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) r[k] = v.timestampValue;
    else if (v.geoPointValue !== undefined) r[k] = v.geoPointValue;
    else if (v.nullValue !== undefined) r[k] = null;
    else if (v.mapValue) r[k] = parseMap(v.mapValue);
    else if (v.arrayValue) r[k] = parseArr(v.arrayValue);
    else if (v.referenceValue !== undefined) r[k] = v.referenceValue;
  }
  return r;
}

function parseMap(map: any): Record<string, any> {
  return map.fields ? parseFields(map.fields) : {};
}

function parseArr(arr: any): any[] {
  if (!arr.values) return [];
  return arr.values.map((v: any) => {
    if (v.stringValue !== undefined) return v.stringValue;
    if (v.integerValue !== undefined) return Number(v.integerValue);
    if (v.doubleValue !== undefined) return v.doubleValue;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.timestampValue !== undefined) return v.timestampValue;
    if (v.geoPointValue !== undefined) return v.geoPointValue;
    if (v.nullValue !== undefined) return null;
    if (v.mapValue) return parseMap(v.mapValue);
    if (v.arrayValue) return parseArr(v.arrayValue);
    if (v.referenceValue !== undefined) return v.referenceValue;
    return null;
  });
}

function getDocId(name: string): string {
  return name.split("/").pop() || "";
}

function convertDocument(doc: any): Record<string, any> {
  const data = parseFields(doc.fields || {});
  return {
    _id: getDocId(doc.name),
    ...data,
    _createTime: doc.createTime || null,
    _updateTime: doc.updateTime || null,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log("Firestore Dump → Clean JSON Converter");
  console.log("=====================================\n");

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input directory not found: ${INPUT_DIR}`);
    console.error("Expected consolidated JSON files from firebase_dump/consolidated/");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} collection files\n`);

  const results: { collection: string; docs: number }[] = [];
  let totalDocs = 0;

  for (const file of files.sort()) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = file; // keeps the same name
    const outputPath = path.join(OUTPUT_DIR, outputName);

    console.log(`  ${file} ...`);

    const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
    const docs = Array.isArray(raw) ? raw : raw.documents || [];

    const converted = docs.map(convertDocument);

    fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2), "utf-8");

    results.push({ collection: file.replace(".json", ""), docs: converted.length });
    totalDocs += converted.length;

    console.log(`    → ${converted.length} documents → ${outputPath}`);
  }

  // Summary
  console.log("\n=== Export Summary ===");
  for (const r of results) {
    console.log(`  ${r.collection}: ${r.docs} documents`);
  }
  console.log(`\n  Total: ${totalDocs} documents across ${results.length} collections`);
  console.log(`  Output: ${OUTPUT_DIR}/`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_summary.json"),
    JSON.stringify({
      exportedAt: new Date().toISOString(),
      source: INPUT_DIR,
      totalCollections: results.length,
      totalDocuments: totalDocs,
      collections: results,
    }, null, 2),
    "utf-8",
  );
}

main();
