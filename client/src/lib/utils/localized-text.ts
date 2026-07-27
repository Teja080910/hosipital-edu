export function pickLocale(value: any, locale = "en"): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || Object.values(value)[0] || "";
}
