import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { DRIZZLE } from "../database/database.provider";
import { users, userSubscriptions, subscriptionPlans } from "../database/schema";
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
    const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    let referredBy: string | null = null;
    if (dto.referralCode) {
      const [referrer] = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, dto.referralCode))
        .limit(1);
      if (referrer) referredBy = referrer.id;
    }

    const [user] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        name: dto.name,
        referralCode,
        referredBy,
        accountType: dto.accountType || "full",
        targetExamId: dto.targetExamId || null,
      })
      .returning();

    const token = this.jwtService.sign(
      { sub: user.id, purpose: "email-verify" },
      { expiresIn: "24h" },
    );
    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    const tokens = await this.generateTokens(user);

    const [defaultPlan] = await this.db
      .select()
      .from(subscriptionPlans)
      .where(and(eq(subscriptionPlans.isDefault, true), eq(subscriptionPlans.isActive, true)))
      .limit(1);

    if (defaultPlan) {
      await this.db.insert(userSubscriptions).values({
        userId: user.id,
        planId: defaultPlan.id,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + (defaultPlan.maxDays || 1) * 86400000),
      });
    }

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    if (!user) throw new UnauthorizedException("Email not found");
    if (!user.passwordHash) {
      const autoReset = this.config.get<string>("AUTO_SEND_RESET_ON_MIGRATED", "false") === "true";
      if (autoReset) {
        const token = this.jwtService.sign(
          { sub: user.id, purpose: "password-reset" },
          { expiresIn: "1h" },
        );
        await this.mailService.sendPasswordReset(user.email, user.name, token);
      }
      throw new UnauthorizedException("Your account was migrated. Please check your email to set a new password.");
    }
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
    if (!user) {
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
    const payload = { sub: user.id, email: user.email, role: user.role, accountType: user.accountType || "full", targetExamId: user.targetExamId || null };
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