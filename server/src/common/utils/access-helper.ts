import { eq, and, isNull, inArray, gt } from "drizzle-orm";
import { users, userSubscriptions, subscriptionPlans, planExams, exams } from "../../database/schema";

export async function getAccessibleExamId(
  db: any,
  userId: string,
  userRole?: string,
): Promise<string | null> {
  if (userRole === "admin" || userRole === "super_admin") return null;
  const now = new Date();

  const [sub] = await db
    .select({ planId: subscriptionPlans.id, examId: subscriptionPlans.examId })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(and(eq(userSubscriptions.userId, userId), inArray(userSubscriptions.status, ["active", "cancelling"]), gt(userSubscriptions.currentPeriodEnd, now)))
    .limit(1);

  if (sub) {
    const planExamRows = await db
      .select({ examId: planExams.examId })
      .from(planExams)
      .where(eq(planExams.planId, sub.planId));
    const planExamIds = planExamRows.map((r: any) => r.examId);

    if (planExamIds.length > 0) {
      const [planUser] = await db
        .select({ targetExamId: users.targetExamId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (planUser?.targetExamId && planExamIds.includes(planUser.targetExamId)) {
        return planUser.targetExamId;
      }
      return planUser?.targetExamId || planExamIds[0];
    }

    if (sub.examId) return sub.examId;

    const [planUser] = await db
      .select({ targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (planUser?.targetExamId) return planUser.targetExamId;
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
