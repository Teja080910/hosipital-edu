import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { DRIZZLE } from "../database/database.provider";
import { users, userQuestionProgress } from "../database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, dto.email), isNull(users.deletedAt)))
      .limit(1);

    if (existing.length) throw new ConflictException("Email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [user] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        name: dto.name,
      })
      .returning();

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    if (!user || !user.passwordHash) throw new UnauthorizedException("Email not found");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Incorrect password");
    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async validateUser(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
      });
      const [user] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
        .limit(1);
      if (!user) throw new UnauthorizedException("User not found");
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN", "7d"),
      }),
    };
  }

  sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}