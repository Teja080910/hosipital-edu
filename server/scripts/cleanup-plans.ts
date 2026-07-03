import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/database/schema";
import { sql, eq, inArray } from "drizzle-orm";
import "dotenv/config";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("=== Cleanup: Keep only 5 Firebase catalog plans ===\n");

  // Get all plans
  const allPlans = await db
    .select({ id: schema.subscriptionPlans.id, name: schema.subscriptionPlans.name })
    .from(schema.subscriptionPlans);

  const planByName: Record<string, string> = {};
  for (const p of allPlans) {
    const en = (p.name as any)?.en;
    if (en) planByName[en] = p.id;
  }

  const catalogNames = ["FREE ACCESS", "Plan de 1 mes", "Plan ENURM 27 3 cuotas", "Plan ENURM 27", "Plan PREMIUM ENURM"];

  // Mapping: extra plan name → catalog plan name
  const mapping: Record<string, string> = {
    "1 MES": "Plan de 1 mes",
    "3 MESES": "Plan ENURM 27 3 cuotas",
    "6 MESES": "Plan ENURM 27 3 cuotas",
    "Plan de 3 meses": "Plan ENURM 27 3 cuotas",
    "Plan de 6 meses": "Plan PREMIUM ENURM",
    "Plan de 9 meses": "Plan PREMIUM ENURM",
    "1 AÑO": "Plan PREMIUM ENURM",
    "Plan de 1 año": "Plan PREMIUM ENURM",
    "Plan de 1 año (Clave del éxito)": "Plan PREMIUM ENURM",
    "Intensivo ENURM": "Plan ENURM 27",
    "Intensivo ENURM 2025": "Plan ENURM 27",
    "Plan ENURM 26": "Plan ENURM 27",
    "MIR 2028": "Plan PREMIUM ENURM",
    "Plan ENARM 2025": "Plan PREMIUM ENURM",
  };

  let remapped = 0;
  for (const [extraName, catalogName] of Object.entries(mapping)) {
    const extraId = planByName[extraName];
    const catalogId = planByName[catalogName];
    if (!extraId || !catalogId) {
      console.log(`  Skipped: "${extraName}" → "${catalogName}" (plan not found)`);
      continue;
    }
    const result = await db
      .update(schema.userSubscriptions)
      .set({ planId: catalogId })
      .where(eq(schema.userSubscriptions.planId, extraId));
    remapped += result.rowCount ?? 0;
    console.log(`  Remapped ${result.rowCount ?? 0} subs: "${extraName}" → "${catalogName}"`);
  }

  // Delete extra plans
  const extraIds = Object.keys(mapping)
    .map((n) => planByName[n])
    .filter(Boolean);

  if (extraIds.length > 0) {
    await db.delete(schema.subscriptionPlans).where(inArray(schema.subscriptionPlans.id, extraIds));
    console.log(`\n  Deleted ${extraIds.length} extra plans`);
  }

  // Update catalog plans with correct data
  const planData: Record<string, any> = {
    "FREE ACCESS": { price: "0.00", interval: "month", maxExamAttempts: 2, maxFlashcardAttempts: 2, maxUses: 2, isDefault: true, sortOrder: 1, isVisible: true },
    "Plan de 1 mes": { price: "1.00", interval: "month", maxExamAttempts: 10000, maxFlashcardAttempts: 50000, maxUses: 10000, isDefault: false, sortOrder: 2, isVisible: true },
    "Plan ENURM 27 3 cuotas": { price: "1.00", interval: "quarter", maxExamAttempts: 10000, maxFlashcardAttempts: 50000, maxUses: 10000, isDefault: false, sortOrder: 3, isVisible: true },
    "Plan ENURM 27": { price: "40.65", interval: "quarter", maxExamAttempts: 100000, maxFlashcardAttempts: 100000, maxUses: 100000, isDefault: false, sortOrder: 4, isVisible: true },
    "Plan PREMIUM ENURM": { price: "65.00", interval: "quarter", maxExamAttempts: 10000, maxFlashcardAttempts: 50000, maxUses: 10000, isDefault: false, sortOrder: 5, isVisible: true },
  };

  for (const [name, data] of Object.entries(planData)) {
    const id = planByName[name];
    if (!id) continue;
    await db
      .update(schema.subscriptionPlans)
      .set(data)
      .where(eq(schema.subscriptionPlans.id, id));
    console.log(`  Updated: "${name}"`);
  }

  // Verify
  const remaining = await db
    .select({ name: schema.subscriptionPlans.name })
    .from(schema.subscriptionPlans)
    .orderBy(schema.subscriptionPlans.sortOrder);

  console.log("\n=== Remaining plans ===");
  for (const p of remaining) {
    const en = (p.name as any)?.en;
    console.log(`  - ${en}`);
  }

  await pool.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
