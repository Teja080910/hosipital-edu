import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DRIZZLE } from "../../database/database.provider";
import { eq, and, isNull } from "drizzle-orm";
import { userSubscriptions, subscriptionPlans } from "../../database/schema";

@Injectable()
export class SubscriptionExamGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private db: any,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredExamId = this.reflector.getAllAndOverride<string>("requiredExamId", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredExamId) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException("Not authenticated");

    const [sub] = await this.db
      .select({ examId: subscriptionPlans.examId })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
      .limit(1);

    if (!sub || !sub.examId) return true;
    if (sub.examId === requiredExamId) return true;
    throw new ForbiddenException("Your subscription does not include access to this exam.");
  }
}
