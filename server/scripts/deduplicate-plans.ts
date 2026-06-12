import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "../src/database/schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "process.env.DATABASE_URL",
});
const db = drizzle(pool, { schema });

async function main() {
  console.log("Deduplicate Subscription Plans\n");

  // Find duplicates by name (English)
  const dups = await pool.query(
    `SELECT name->>'en' as title, array_agg(id ORDER BY created_at) as ids, count(*)
     FROM subscription_plans
     GROUP BY name->>'en'
     HAVING count(*) > 1`,
  );

  if (dups.rows.length === 0) {
    console.log("No duplicate plan names found.");

    // Check sort_order duplicates instead
    const sortDups = await pool.query(
      `SELECT sort_order, array_agg(id) as ids, count(*)
       FROM subscription_plans
       GROUP BY sort_order
       HAVING count(*) > 1`,
    );
    if (sortDups.rows.length > 0) {
      console.log("Duplicate sort orders found. Reindexing...");
      const all = await pool.query(
        "SELECT id FROM subscription_plans ORDER BY sort_order, created_at",
      );
      for (let i = 0; i < all.rows.length; i++) {
        await pool.query(
          "UPDATE subscription_plans SET sort_order = $1 WHERE id = $2",
          [i, all.rows[i].id],
        );
      }
      console.log(`Reindexed ${all.rows.length} plans`);
    }
    await pool.end();
    return;
  }

  console.log("Duplicate plans found:\n");
  for (const row of dups.rows) {
    console.log(`  "${row.title}" — ${row.count} copies`);
    console.log(`    IDs: ${row.ids.join(", ")}`);

    // Keep the first (oldest), delete the rest
    const [keep, ...remove] = row.ids;
    console.log(`    Keeping: ${keep}`);
    console.log(`    Deleting: ${remove.join(", ")}`);

    for (const id of remove) {
      await pool.query(
        "UPDATE user_subscriptions SET plan_id = $1 WHERE plan_id = $2",
        [keep, id],
      );
      await pool.query("DELETE FROM subscription_plans WHERE id = $1", [id]);
    }
  }

  console.log("\nDone.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});