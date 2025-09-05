import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    if (!deviceId) throw new BadRequestException('deviceId is required');
    return this.authService.generateToken(deviceId);
  }
}
