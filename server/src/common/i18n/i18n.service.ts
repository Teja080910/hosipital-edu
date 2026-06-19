import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";
import en from "./messages/en";
import es from "./messages/es";

const messages: Record<string, Record<string, any>> = { en, es };
const defaultLocale = "en";

export class I18nContext {
  constructor(public locale: string) {}
}

@Injectable()
export class I18nService {
  static storage = new AsyncLocalStorage<I18nContext>();

  getLocale(): string {
    return I18nService.storage.getStore()?.locale ?? defaultLocale;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const locale = this.getLocale();
    const localeMessages = messages[locale] ?? messages[defaultLocale];
    const value = this.resolveKey(localeMessages, key);
    if (typeof value !== "string") {
      const fallback = this.resolveKey(messages[defaultLocale], key);
      if (typeof fallback !== "string") return key;
      return this.interpolate(fallback, params);
    }
    return this.interpolate(value, params);
  }

  private resolveKey(obj: any, key: string): any {
    return key.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  private interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }
}
