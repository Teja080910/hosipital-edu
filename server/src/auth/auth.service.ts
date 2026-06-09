import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { DRIZZLE } from "../database/database.provider";
import { users, userQuestionProgress } from "../database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { RegisterDto } from "./dto/register.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
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

    const token = this.jwtService.sign(
      { sub: user.id, purpose: "email-verify" },
      { expiresIn: "24h" },
    );
    await this.mailService.sendVerificationEmail(user.email, user.name, token);

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

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.purpose !== "email-verify") throw new BadRequestException("Invalid token");
      const [user] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
        .limit(1);
      if (!user) throw new BadRequestException("User not found");
      if (user.emailVerifiedAt) throw new BadRequestException("Email already verified");
      await this.db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.id, user.id));
      await this.mailService.sendWelcome(user.email, user.name);
      return { message: "Email verified successfully" };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException("Invalid or expired token");
    }
  }

  async resendVerification(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    if (!user) return { message: "If the email exists, a verification link has been sent" };
    if (user.emailVerifiedAt) throw new BadRequestException("Email already verified");
    const token = this.jwtService.sign(
      { sub: user.id, purpose: "email-verify" },
      { expiresIn: "24h" },
    );
    await this.mailService.sendVerificationEmail(user.email, user.name, token);
    return { message: "Verification email sent" };
  }

  async forgotPassword(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    if (!user || !user.passwordHash) {
      return { message: "If the email exists, a reset link has been sent" };
    }
    const token = this.jwtService.sign(
      { sub: user.id, purpose: "password-reset" },
      { expiresIn: "1h" },
    );
    await this.mailService.sendPasswordReset(user.email, user.name, token);
    return { message: "Password reset email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.purpose !== "password-reset") throw new BadRequestException("Invalid token");
      const [user] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
        .limit(1);
      if (!user) throw new BadRequestException("User not found");
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await this.db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id));
      await this.mailService.sendPasswordChanged(user.email, user.name);
      return { message: "Password reset successfully" };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException("Invalid or expired token");
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