import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { QuestionsModule } from "./questions/questions.module";
import { ExamsModule } from "./exams/exams.module";
import { FlashcardsModule } from "./flashcards/flashcards.module";
import { CoursesModule } from "./courses/courses.module";
import { VideosModule } from "./videos/videos.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { ArticlesModule } from "./articles/articles.module";
import { TranslationsModule } from "./translations/translations.module";
import { LandingModule } from "./landing/landing.module";
import { CalendarModule } from "./calendar/calendar.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { CertificatesModule } from "./certificates/certificates.module";
import { MailModule } from "./mail/mail.module";
import { UploadModule } from "./upload/upload.module";
import { StreamModule } from "./stream/stream.module";
import { ParametersModule } from "./parameters/parameters.module";
import { I18nModule } from "./common/i18n/i18n.module";

@Module({
  imports: [
    I18nModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    ExamsModule,
    FlashcardsModule,
    CoursesModule,
    VideosModule,
    SubscriptionsModule,
    ArticlesModule,
    TranslationsModule,
    LandingModule,
    CalendarModule,
    AnalyticsModule,
    CertificatesModule,
    MailModule,
    UploadModule,
    StreamModule,
    ParametersModule,
  ],
})
export class AppModule {}