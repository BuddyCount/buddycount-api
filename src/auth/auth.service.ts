import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  deviceId: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Generate a JWT token for a deviceId
  generateToken(deviceId: string): { access_token: string } {
    const payload: JwtPayload = { deviceId };
    return { access_token: this.jwtService.sign(payload) };
  }

  // Validate a JWT token and return the decoded payload
  validateToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
