import { Pool } from "pg";

const pool = new Pool({ connectionString: "postgresql://postgres:1234@localhost:5432/hospital_edu" });

async function main() {
  const keepEmail = "sailakshmiborra4104@gmail.com";

  const { rows: toDelete } = await pool.query(
    `SELECT id, email FROM users WHERE email != $1`,
    [keepEmail]
  );

  console.log(`Deleting ${toDelete.length} users (keeping ${keepEmail})...`);

  for (const u of toDelete) {
    // Delete related data first
    await pool.query(`DELETE FROM exam_attempts WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM exam_answers WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE user_id = $1)`, [u.id]);
    await pool.query(`DELETE FROM user_subscriptions WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM user_course_enrollments WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM user_course_progress WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM course_quiz_attempts WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM user_flashcard_reviews WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM certificates WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM course_comments WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM user_video_progress WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM payments WHERE user_id = $1`, [u.id]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [u.id]);
    console.log(`  Deleted: ${u.email}`);
  }

  console.log("Done.");
  await pool.end();
}

main().catch(console.error);
