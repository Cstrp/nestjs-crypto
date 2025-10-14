# User Authentication Example

Learn how to implement secure user authentication using NestJS Crypto.

## Overview

This example demonstrates:

- Password hashing during registration
- Password verification during login
- Secure password storage
- Password strength validation

## Implementation

### User Entity

```typescript
// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Stores bcrypt hash, never plain text

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### Auth Service

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcryptService } from 'nestjs-crypto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    // Validate password strength
    this.validatePasswordStrength(password);

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password with 12 salt rounds
    const hashedPassword = await this.bcryptService.hash(password, 12);

    // Create and save user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<User> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return user;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await this.bcryptService.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    this.validatePasswordStrength(newPassword);

    // Hash and save new password
    const hashedPassword = await this.bcryptService.hash(newPassword, 12);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Password must contain special character');
    }
  }
}
```

### Auth Controller

```typescript
// auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
  password: string;
}

class LoginDto {
  email: string;
  password: string;
}

class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.email, dto.password);

    return {
      id: user.id,
      email: user.email,
      message: 'Registration successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.login(dto.email, dto.password);

    // Generate JWT token here (using @nestjs/jwt)
    return {
      id: user.id,
      email: user.email,
      message: 'Login successful',
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    // Add @CurrentUser() decorator to get userId from JWT
  ) {
    await this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );

    return { message: 'Password changed successfully' };
  }
}
```

### Auth Module

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from 'nestjs-crypto';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CryptoModule.forRoot({
      useBcrypt: true,
      bcryptSaltRounds: 12,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

## Testing

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcryptService } from 'nestjs-crypto';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    bcryptService = module.get<BcryptService>(BcryptService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'Test123!@#';
      const hashedPassword = '$2b$12$hash';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcryptService, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        email,
        password: hashedPassword,
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        id: 1,
        email,
        password: hashedPassword,
      } as User);

      const result = await service.register(email, password);

      expect(result.email).toBe(email);
      expect(bcryptService.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Test123!@#';
      const user = {
        id: 1,
        email,
        password: '$2b$12$hash',
        isActive: true,
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(true);

      const result = await service.login(email, password);

      expect(result).toBe(user);
    });
  });
});
```

## Best Practices

### Password Requirements

```typescript
// Create a password validator service
@Injectable()
export class PasswordValidator {
  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Minimum 8 characters');
    }

    if (password.length > 128) {
      errors.push('Maximum 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Must contain lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Must contain number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Must contain special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

### Rate Limiting

```typescript
// Protect against brute force attacks
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5, // Max 5 login attempts per minute
    }),
  ],
})
export class AuthModule {}
```

## Security Checklist

- ✅ Use 12 salt rounds for bcrypt
- ✅ Never log passwords or hashes
- ✅ Implement password strength requirements
- ✅ Use HTTPS for all authentication endpoints
- ✅ Implement rate limiting on login/register
- ✅ Add email verification
- ✅ Implement account lockout after failed attempts
- ✅ Use JWT with short expiration times
- ✅ Implement password reset functionality
- ✅ Hash passwords before database storage

## See Also

- [BcryptService API](/api/bcrypt-service)
- [Security Best Practices](/guide/security)
- [Data Encryption Example](/examples/data-encryption)
