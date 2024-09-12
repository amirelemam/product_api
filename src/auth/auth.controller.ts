import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthToken } from './auth.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiOperation({ summary: 'Get access token' })
  @ApiResponse({ status: 200, description: 'Acess token', type: AuthToken })
  login() {
    return this.authService.login({ username: 'admin', password: 'mypass' });
  }
}
