import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { LocalAuthGuard } from "../common/guards/local-auth.guard";
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
  @ApiOperation({ summary: "Register new user" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  async login(@Body() _dto: LoginDto) {
    return this.authService.login(_dto.email, _dto.password);
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
  async resendVerification(@Body("email") email: string) {
    return this.authService.resendVerification(email);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Send password reset email" })
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  async resetPassword(@Body("token") token: string, @Body("password") password: string) {
    return this.authService.resetPassword(token, password);
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
  async googleAuth() {}

  @Get("google/callback")
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthRedirect(@Req() req: any) {
    return req.user;
  }
}