const TIMESTAMP_FIELDS = new Set([
  "createdAt", "updatedAt", "deletedAt",
  "emailVerifiedAt", "publishedAt",
  "completedAt", "startedAt",
  "currentPeriodStart", "currentPeriodEnd", "canceledAt",
  "accessExpiresAt",
  "lastReviewAt", "nextReviewAt",
]);

export function stripTimestamps<T extends Record<string, any>>(data: T): Partial<T> {
  if (!data || typeof data !== "object") return data;
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (TIMESTAMP_FIELDS.has(key)) {
      delete result[key];
    }
  }
  return result;
}