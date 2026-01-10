import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginRequestDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  refreshToken!: string;
}

export class AuthResponseDto {
  access_token!: string;
  refresh_token!: string;
}

export class UserInfoDto {
  id!: string;
  username!: string;
  email!: string;
}
