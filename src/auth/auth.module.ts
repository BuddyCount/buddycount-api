import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  // Import the JWT module and configure it with a secret and token expiration
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret', // Secret for signing JWTs
      signOptions: { expiresIn: '365d' }, // Token validity duration
    }),
  ],
  // Provide services and strategies used in authentication
  providers: [AuthService, JwtStrategy],
  // Register the controller handling authentication endpoints
  controllers: [AuthController],
  // Export AuthService so it can be used in other modules
  exports: [AuthService],
})
export class AuthModule {}
