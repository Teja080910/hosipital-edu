import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { I18nService } from "../i18n/i18n.service";
import { ALLOWED_ACCOUNT_TYPES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedTypes = this.reflector.getAllAndOverride<string[]>(ALLOWED_ACCOUNT_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowedTypes) return true;
    const { user } = context.switchToHttp().getRequest();
    if (allowedTypes.includes(user?.accountType)) return true;
    if (user?.role === "admin" || user?.role === "super_admin") return true;
    throw new ForbiddenException(this.i18n.t("guard.accountTypeDenied"));
  }
}