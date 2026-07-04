import { eq, and, isNull, inArray } from "drizzle-orm";
import { users, userSubscriptions, subscriptionPlans, planExams, exams } from "../../database/schema";

export async function getAccessibleExamId(
  db: any,
  userId: string,
  userRole?: string,
): Promise<string | null> {
  if (userRole === "admin" || userRole === "super_admin") return null;

  const [sub] = await db
    .select({ planId: subscriptionPlans.id, examId: subscriptionPlans.examId })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
    .limit(1);

  if (sub) {
    if (sub.examId) return sub.examId;
    const planExamRows = await db
      .select({ examId: planExams.examId })
      .from(planExams)
      .where(eq(planExams.planId, sub.planId))
      .limit(1);
    if (planExamRows.length > 0) return planExamRows[0].examId;
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
