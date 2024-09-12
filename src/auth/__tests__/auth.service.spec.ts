import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(), // Mock the sign method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should generate a JWT token', async () => {
    const mockToken = 'mock-jwt-token';
    (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

    const user = { username: 'testuser', password: 'testpassword' };
    const result = await authService.login(user);

    expect(jwtService.sign).toHaveBeenCalledWith({
      username: 'testuser',
      sub: 'testpassword',
    });

    expect(result).toEqual({
      access_token: mockToken,
    });
  });
});
