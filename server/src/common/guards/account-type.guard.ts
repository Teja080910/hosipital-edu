import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedTypes = this.reflector.getAllAndOverride<string[]>("allowedAccountTypes", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowedTypes) return true;
    const { user } = context.switchToHttp().getRequest();
    if (allowedTypes.includes(user?.accountType)) return true;
    throw new ForbiddenException("Your account type does not have access to this resource.");
  }
}