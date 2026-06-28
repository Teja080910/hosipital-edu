const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/hospital_edu" });

  const result = await pool.query(
    `UPDATE exams SET description = $1 WHERE slug = $2 RETURNING id, slug, name, description`,
    [
      JSON.stringify({
        en: "Examen Nacional Único de Residencias Médicas (Dominican Republic)",
        es: "Examen Nacional Único de Residencias Médicas (República Dominicana)",
      }),
      "enurm",
    ],
  );

  if (result.rows.length > 0) {
    console.log("ENURM description updated successfully:");
    console.log(`  name: ${JSON.stringify(result.rows[0].name)}`);
    console.log(`  description: ${JSON.stringify(result.rows[0].description)}`);
  } else {
    console.log("ENURM exam not found (slug: enurm). Check if the slug is correct.");
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Failed to update ENURM description:", err);
  process.exit(1);
});
