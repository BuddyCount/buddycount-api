import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('getToken', () => {
    it('should return a token for valid deviceId', () => {
      const deviceId = 'device-123';
      const token = { access_token: 'jwt-token' };

      const spy = jest.spyOn(service, 'generateToken').mockReturnValue(token);

      const result = controller.getToken(deviceId);

      expect(spy).toHaveBeenCalledWith(deviceId);
      expect(result).toEqual(token);
    });

    it('should throw BadRequestException if deviceId is missing', () => {
      expect(() => {
        controller.getToken(null as unknown as string);
      }).toThrow(BadRequestException);

      expect(() => {
        controller.getToken(undefined);
      }).toThrow(BadRequestException);
    });
  });
});
