import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: { username: string; password: string }) {
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        sub: user.password,
      }),
    };
  }
}
