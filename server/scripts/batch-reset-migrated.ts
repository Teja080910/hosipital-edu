import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { isNull } from "drizzle-orm";
import * as schema from "../src/database/schema";
import * as jwt from "jsonwebtoken";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

async function main() {
  console.log("Sending password reset emails to migrated users...\n");

  const allUsers = await db
    .select()
    .from(schema.users)
    .where(isNull(schema.users.passwordHash));

  console.log(`Found ${allUsers.length} migrated users without password.\n`);

  const secret = process.env.JWT_SECRET || "super-secret-key";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  for (const user of allUsers) {
    const token = jwt.sign(
      { sub: user.id, purpose: "password-reset" },
      secret,
      { expiresIn: "7d" },
    );

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    console.log(`  ${user.email}: ${resetLink}`);
  }

  console.log("\nDone. Share these links with migrated users to set their passwords.");
  await pool.end();
}

main().catch(console.error);