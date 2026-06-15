import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const ALLOWED_ACCOUNT_TYPES_KEY = "allowedAccountTypes";
export const AllowedAccountTypes = (...types: string[]) => SetMetadata(ALLOWED_ACCOUNT_TYPES_KEY, types);

export const REQUIRED_EXAM_ID_KEY = "requiredExamId";
export const RequiredExamId = (examId: string) => SetMetadata(REQUIRED_EXAM_ID_KEY, examId);