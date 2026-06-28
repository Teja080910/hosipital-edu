const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/hospital_edu" });

  const existing = await pool.query("SELECT id FROM certificate_templates WHERE is_default = true LIMIT 1");
  if (existing.rows.length > 0) {
    console.log("A default certificate template already exists (id:", existing.rows[0].id, ")");
    await pool.end();
    return;
  }

  const result = await pool.query(
    `INSERT INTO certificate_templates (name, text_color, is_default, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, name`,
    ["Default Template", "#1e3a5f", true],
  );

  console.log("Default certificate template created:", result.rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to seed certificate template:", err);
  process.exit(1);
});
