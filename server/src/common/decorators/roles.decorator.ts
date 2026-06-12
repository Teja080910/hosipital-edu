import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const ALLOWED_ACCOUNT_TYPES_KEY = "allowedAccountTypes";
export const AllowedAccountTypes = (...types: string[]) => SetMetadata(ALLOWED_ACCOUNT_TYPES_KEY, types);