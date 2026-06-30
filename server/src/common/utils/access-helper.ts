import { eq, and, isNull } from "drizzle-orm";
import { users, userSubscriptions, subscriptionPlans } from "../../database/schema";

export async function getAccessibleExamId(
  db: any,
  userId: string,
): Promise<string | null> {
  const [sub] = await db
    .select({ examId: subscriptionPlans.examId })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
    .limit(1);

  if (sub?.examId) return sub.examId;

  const [user] = await db
    .select({ targetExamId: users.targetExamId, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.targetExamId) {
    const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
    if (hoursSinceRegistration <= 24) return user.targetExamId;
    // user was assigned a target exam by admin — show content even after 24h
    return user.targetExamId;
  }

  return null;
}
