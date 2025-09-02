import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/device
  @Post('device')
  getToken(@Body('deviceId') deviceId?: string) {
    if (!deviceId) {
      throw new BadRequestException('deviceId is required');
    }
    return this.authService.generateToken(deviceId);
  }
}
