import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import {
  RegisterRequestDto,
  LoginRequestDto,
  AuthResponseDto,
  RefreshTokenRequestDto,
} from '@flowforge/common';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const exists = await this.repo.findOne({ where: [{ username: dto.username }, { email: dto.email }] });
    if (exists) {
      throw new BadRequestException('Username or email already registered');
    }
    const user = this.repo.create({
      username: dto.username,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
    });
    await this.repo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.repo.findOne({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    const user = await this.repo.findOne({ where: { refreshToken: dto.refreshToken } });
    if (!user || !user.refreshTokenExpiryDate || user.refreshTokenExpiryDate < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateTokens(user);
  }

  async logout(dto: RefreshTokenRequestDto): Promise<void> {
    const user = await this.repo.findOne({ where: { refreshToken: dto.refreshToken } });
    if (!user) return;
    user.refreshToken = null;
    user.refreshTokenExpiryDate = null;
    await this.repo.save(user);
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id, username: user.username, user_id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = uuid();
    const expiry = new Date(Date.now() + this.refreshTtlMs());
    user.refreshToken = refreshToken;
    user.refreshTokenExpiryDate = expiry;
    await this.repo.save(user);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private refreshTtlMs() {
    const hours = parseInt(process.env.JWT_REFRESH_HOURS ?? '168', 10);
    return hours * 60 * 60 * 1000;
  }
}
