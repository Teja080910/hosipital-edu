import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Inject } from "@nestjs/common";
import { DRIZZLE } from "../../database/database.provider";
import { eq, and, isNull } from "drizzle-orm";
import { users } from "../../database/schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    @Inject(DRIZZLE) private db: any,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    const [user] = await this.db
      .select({ accountType: users.accountType, targetExamId: users.targetExamId, createdAt: users.createdAt })
      .from(users)
      .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
      .limit(1);

    if (!user) throw new UnauthorizedException();

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      accountType: user.accountType || "full",
      targetExamId: user.targetExamId || null,
      createdAt: user.createdAt,
    };
  }
}