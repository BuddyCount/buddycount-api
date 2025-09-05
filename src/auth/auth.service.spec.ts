import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, JwtPayload } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'supersecret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a JWT containing the deviceId', () => {
      const deviceId = 'device-123';
      const tokenObj = service.generateToken(deviceId);

      expect(tokenObj).toHaveProperty('access_token');

      const decoded = jwtService.verify<JwtPayload>(tokenObj.access_token, {
        secret: 'supersecret',
      });
      expect(decoded.deviceId).toBe(deviceId);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT and return payload', () => {
      const deviceId = 'device-456';
      const tokenObj = service.generateToken(deviceId);

      const payload: JwtPayload = service.validateToken(tokenObj.access_token);
      expect(payload.deviceId).toBe(deviceId);
    });

    it('should throw an error for an invalid token', () => {
      expect(() => service.validateToken('invalid.token')).toThrow();
    });
  });
});
