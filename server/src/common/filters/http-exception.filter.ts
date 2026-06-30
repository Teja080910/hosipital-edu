import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import { I18nService } from "../i18n/i18n.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const reply = response as { status: (code: number) => { send: (body: Record<string, unknown>) => void } };

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const locale = I18nService.storage.getStore()?.locale ?? "en";
    const fallbackMsg = locale === "es" ? "Error interno del servidor" : "Internal server error";
    let message: string | string[] = fallbackMsg;

    if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = locale === "es"
        ? "Demasiados intentos. Intenta de nuevo en un minuto."
        : "Too many attempts. Please try again in a minute.";
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === "string"
          ? res
          : (res as any).message || message;
    }

    this.logger.error(
      `HTTP ${status} - ${Array.isArray(message) ? message.join(", ") : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    reply.status(status).send({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
    });
  }
}