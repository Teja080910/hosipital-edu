import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { I18nService } from "../common/i18n/i18n.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private i18n: I18nService,
  ) {}

  @Post("register")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Register new user" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Login with email and password" })
  async login(@Body() _dto: LoginDto) {
    return this.authService.login(_dto.email, _dto.password, _dto.turnstileToken);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout" })
  async logout() {
    return { message: this.i18n.t("auth.loggedOut") };
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email address" })
  async verifyEmail(@Body("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post("resend-verification")
  @ApiOperation({ summary: "Resend verification email" })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Send password reset email" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Get("google")
  @ApiOperation({ summary: "Google OAuth login" })
  async googleAuth() {
    // TODO: Google OAuth not yet implemented
  }

  @Get("google/callback")
  @ApiOperation({ summary: "Google OAuth callback" })
  // TODO: Add @UseGuards(AuthGuard('google')) when Google OAuth is implemented
  async googleAuthRedirect(@Req() req: any) {
    return req.user;
  }
}