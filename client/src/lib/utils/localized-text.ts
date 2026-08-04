export function pickLocale(value: any, locale = "en"): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const result = value[locale] || value.en || Object.values(value)[0] || "";
  return typeof result === "string" ? result : pickLocale(result, locale);
}
