const fs = require("fs");
const path = require("path");

const API_BASE = process.env.API_URL || "http://localhost:4000/api";
const EMAIL = "tejasimma033@gmail.com";
const PASSWORD = "Teja@1234";

function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

async function getToken() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.accessToken || data.access_token;
}

async function main() {
  console.log("Authenticating...");
  const token = await getToken();
  console.log("Token acquired\n");

  const messagesDir = path.resolve(__dirname, "../src/messages");
  const locales = ["en", "es"];

  const allKeys = new Set();
  const localeData = {};

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const flat = flatten(json);
    localeData[locale] = flat;
    for (const key of Object.keys(flat)) {
      allKeys.add(key);
    }
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const key of allKeys) {
    const ns = key.split(".")[0];

    for (const locale of locales) {
      const value = localeData[locale][key] || "";

      const res = await fetch(`${API_BASE}/translations?locale=${locale}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existing = await res.json();
      const match = Array.isArray(existing)
        ? existing.find((e) => e.key === key)
        : null;

      if (match) {
        if (match.value !== value) {
          await fetch(`${API_BASE}/translations/${match.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ value }),
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await fetch(`${API_BASE}/translations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key, locale, value, namespace: ns }),
        });
        created++;
      }
    }
  }

  console.log(
    `\nDone. Created: ${created}, Updated: ${updated}, Skipped (unchanged): ${skipped}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});