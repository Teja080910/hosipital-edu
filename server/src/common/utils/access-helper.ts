import { eq, and, isNull } from "drizzle-orm";
import { users, userSubscriptions, subscriptionPlans, exams } from "../../database/schema";

export async function getAccessibleExamId(
  db: any,
  userId: string,
  userRole?: string,
): Promise<string | null> {
  if (userRole === "admin" || userRole === "super_admin") return null;

  const [sub] = await db
    .select({ examId: subscriptionPlans.examId, planName: subscriptionPlans.name })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
    .limit(1);

  if (sub) {
    if (sub.examId) return sub.examId;
    if (sub.planName) {
      const planText = (typeof sub.planName === "object" ? (sub.planName.en || sub.planName.es || "") : String(sub.planName)).toLowerCase();
      const allExams = await db
        .select({ id: exams.id, name: exams.name, slug: exams.slug })
        .from(exams)
        .where(eq(exams.isActive, true));
      for (const exam of allExams) {
        const examText = (exam.name?.en || exam.name?.es || exam.slug || "").toLowerCase();
        if (planText.includes(examText) || examText.includes(planText)) {
          return exam.id;
        }
      }
    }
    const [user] = await db
      .select({ targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user?.targetExamId) return user.targetExamId;
    return null;
  }

  const [user] = await db
    .select({ targetExamId: users.targetExamId, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.targetExamId) {
    const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
    if (hoursSinceRegistration <= 24) return user.targetExamId;
    return null;
  }

  return null;
}
