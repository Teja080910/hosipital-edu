import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { LanguageInterceptor } from "./common/interceptors/language.interceptor";

async function bootstrap() {
  const fastifyInstance = new FastifyAdapter({
    logger: true,
    bodyLimit: 1048576,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyInstance,
  );

  const instance = app.getHttpAdapter().getInstance() as any;
  instance.addContentTypeParser("application/json", { parseAs: "buffer", override: true }, (req: any, body: Buffer, done: any) => {
    req.rawBody = body;
    try {
      const parsed = JSON.parse(body.toString());
      done(null, parsed);
    } catch (err) {
      done(err as Error);
    }
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4175",
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LanguageInterceptor(), new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle("MD Exam API")
    .setDescription("Medical exam preparation platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");
  Logger.log(`Server running on http://localhost:${port}`, "Bootstrap");
  Logger.log(
    `Swagger docs at http://localhost:${port}/api/docs`,
    "Bootstrap",
  );
}

bootstrap();