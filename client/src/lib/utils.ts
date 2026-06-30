import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function localizedText(value: unknown, locale = "en"): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = localizedText(item, locale);
      if (resolved) return resolved;
    }
    return "";
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = localizedText(record[locale], locale);
    if (direct) return direct;
    const english = localizedText(record.en, locale);
    if (english) return english;
    for (const nested of Object.values(record)) {
      const resolved = localizedText(nested, locale);
      if (resolved) return resolved;
    }
  }
  return "";
}
