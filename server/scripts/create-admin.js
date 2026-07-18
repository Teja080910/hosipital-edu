const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error("Usage: node scripts/create-admin.js <name> <email> <password>");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/hospital_edu" });

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    await pool.query("UPDATE users SET role = $1 WHERE email = $2", ["admin", email]);
    console.log(`User ${email} promoted to admin`);
  } else {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (email, password_hash, name, role, preferred_locale, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())",
      [email, hash, name, "admin", "en"],
    );
    console.log(`Admin user ${email} created`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});