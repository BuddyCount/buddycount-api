import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint to obtain a JWT token for a device
  // Public access, expects a POST request to /auth/device with a deviceId in the body
  @Public()
  @Post('device')
  @ApiBody({
    description: 'Provide a unique deviceId to obtain a JWT access token',
    schema: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          example: 'my-device-unique-id',
        },
      },
      required: ['deviceId'],
    },
  })
  getToken(@Body('deviceId') deviceId?: string) {
    // Throw an error if deviceId is missing
    if (!deviceId) throw new BadRequestException('deviceId is required');
    // Call the AuthService to generate a token
    return this.authService.generateToken(deviceId);
  }
}
