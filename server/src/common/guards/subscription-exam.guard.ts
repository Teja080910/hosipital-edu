import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DRIZZLE } from "../../database/database.provider";
import { eq, and, isNull } from "drizzle-orm";
import { userSubscriptions, subscriptionPlans } from "../../database/schema";
import { I18nService } from "../i18n/i18n.service";

@Injectable()
export class SubscriptionExamGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredExamId = this.reflector.getAllAndOverride<string>("requiredExamId", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredExamId) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException(this.i18n.t("guard.notAuthenticated"));

    const [sub] = await this.db
      .select({ examId: subscriptionPlans.examId, currentPeriodEnd: userSubscriptions.currentPeriodEnd })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
      .limit(1);

    if (!sub) return false;
    if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) <= new Date()) return false;
    if (!sub.examId) return true;
    if (sub.examId === requiredExamId) return true;
    throw new ForbiddenException(this.i18n.t("guard.subscriptionExamDenied"));
  }
}
