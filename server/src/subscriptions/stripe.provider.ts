import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

export const STRIPE = Symbol("STRIPE");

export const stripeProvider = {
  provide: STRIPE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const key = config.get<string>("STRIPE_SECRET_KEY") || "";
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    return new Stripe(key, {
      httpClient: Stripe.createNodeHttpClient(),
    });
  },
};