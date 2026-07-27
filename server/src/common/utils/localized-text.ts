export function normalizeJsonbValue(value: any): Record<string, string> {
  if (!value || typeof value === "object") return value || {};
  return { en: String(value), es: String(value) };
}

export function pickLocale(value: any, locale = "en"): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || Object.values(value)[0] || "";
}
