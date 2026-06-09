import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { stripeProvider, STRIPE } from "./stripe.provider";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [MailModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, stripeProvider],
  exports: [SubscriptionsService, STRIPE],
})
export class SubscriptionsModule {}