import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Generate a JWT token for a deviceId
  generateToken(deviceId: string) {
    const payload = { deviceId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Validate a JWT token and return the decoded payload
  validateToken(token: string) {
    return this.jwtService.verify(token);
  }
}
