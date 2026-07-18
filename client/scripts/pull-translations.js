const fs = require("fs");
const path = require("path");

const API_BASE = process.env.API_URL || "http://localhost:4000/api";
const EMAIL = process.env.API_EMAIL || "admin@example.com";
const PASSWORD = process.env.API_PASSWORD || "password";

async function getToken() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.accessToken || data.access_token;
}

function unflatten(flat) {
  const root = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let obj = root;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) {
        obj[parts[i]] = value;
      } else {
        obj[parts[i]] = obj[parts[i]] || {};
        obj = obj[parts[i]];
      }
    }
  }
  return root;
}

async function main() {
  console.log("Authenticating...");
  const token = await getToken();
  console.log("Fetching translations...");

  const res = await fetch(`${API_BASE}/translations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = await res.json();

  const grouped = {};
  for (const item of items) {
    const { key, locale, value, namespace } = item;
    if (!grouped[locale]) grouped[locale] = {};
    if (!grouped[locale][namespace]) grouped[locale][namespace] = {};
    grouped[locale][namespace][key] = value;
  }

  const messagesDir = path.resolve(__dirname, "../src/messages");

  for (const [locale, namespaces] of Object.entries(grouped)) {
    const flat = {};
    for (const [ns, keys] of Object.entries(namespaces)) {
      for (const [key, value] of Object.entries(keys)) {
        flat[`${ns}.${key}`] = value;
      }
    }
    const nested = unflatten(flat);
    const filePath = path.join(messagesDir, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(nested, null, 2) + "\n");
    console.log(`  Wrote ${locale}.json (${Object.keys(flat).length} keys)`);
  }

  console.log("\nDone. Messages synced from database.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});