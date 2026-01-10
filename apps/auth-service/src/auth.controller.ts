import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  AuthResponseDto,
  UserInfoDto,
} from '@flowforge/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  register(@Body() dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh-token')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() dto: RefreshTokenRequestDto): Promise<void> {
    await this.authService.logout(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<UserInfoDto> {
    const userId = (req.user as any)?.id;
    const user = await this.authService.findById(userId);
    return { id: user!.id, username: user!.username, email: user!.email };
  }
}
