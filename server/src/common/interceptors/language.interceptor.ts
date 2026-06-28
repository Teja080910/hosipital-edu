import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { I18nContext, I18nService } from "../i18n/i18n.service";

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const acceptLanguage = request.headers?.["accept-language"] ?? "";
    const locale = acceptLanguage.startsWith("es") ? "es" : "en";
    return I18nService.storage.run(new I18nContext(locale), () => next.handle());
  }
}
