import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const DRIZZLE = Symbol("DRIZZLE");

export const databaseProvider: Provider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const connectionString = config.get<string>("DATABASE_URL")!;
    const client = postgres(connectionString, { prepare: false });
    return drizzle(client, { schema });
  },
};