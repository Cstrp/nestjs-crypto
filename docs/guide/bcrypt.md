# Bcrypt Service Guide

Learn how to use bcrypt for secure password hashing in your NestJS application.

## What is Bcrypt?

Bcrypt is a password hashing function designed to be slow and computationally expensive, making it resistant to brute-force attacks. It automatically handles salt generation and includes the salt in the hash output.

## Basic Usage

### Hashing Passwords

```typescript
import { Injectable } from '@nestjs/common';
import { BcryptService } from 'nestjs-crypto';

@Injectable()
export class AuthService {
  constructor(private readonly bcryptService: BcryptService) {}

  async register(email: string, password: string) {
    // Hash the password
    const hashedPassword = await this.bcryptService.hash(password);

    // Store in database
    return this.userRepository.create({
      email,
      password: hashedPassword,
    });
  }
}
```

### Verifying Passwords

```typescript
async login(email: string, password: string) {
  const user = await this.userRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Compare password with hash
  const isValid = await this.bcryptService.compare(password, user.password);

  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  return this.generateToken(user);
}
```

## Configuration

### Salt Rounds

Salt rounds determine the computational cost of hashing. Higher values are more secure but slower.

```typescript
CryptoModule.forRoot({
  bcrypt: {
    saltRounds: 12, // Recommended for production
  },
})
```

**Recommended Values:**

| Environment | Salt Rounds | Time | Security |
|-------------|-------------|------|----------|
| Development | 10 | ~100ms | Basic |
| Production | 12 | ~250ms | Standard |
| High Security | 14 | ~600ms | High |

### Environment-based Configuration

```typescript
const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;

CryptoModule.forRoot({
  bcrypt: {
    saltRounds,
  },
})
```

## Advanced Usage

### Custom Salt Rounds Per Request

```typescript
async hashWithCustomRounds(password: string, rounds: number) {
  return this.bcryptService.hash(password, rounds);
}

// High security for admin accounts
const adminHash = await this.hashWithCustomRounds(password, 14);

// Standard security for regular users
const userHash = await this.hashWithCustomRounds(password, 12);
```

### Password Strength Validation

```typescript
@Injectable()
export class PasswordService {
  validateStrength(password: string): boolean {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }

  async hashSecure(password: string): Promise<string> {
    if (!this.validateStrength(password)) {
      throw new BadRequestException('Password does not meet security requirements');
    }

    return this.bcryptService.hash(password);
  }
}
```

### Checking Hash Details

```typescript
async getHashInfo(hash: string) {
  const saltRounds = await this.bcryptService.getSaltRounds(hash);

  return {
    algorithm: 'bcrypt',
    saltRounds,
    strength: saltRounds >= 12 ? 'strong' : 'weak',
  };
}
```

## Best Practices

### ✅ Do

- Use at least 12 salt rounds in production
- Validate password strength before hashing
- Use async methods (`hash`, `compare`)
- Handle errors appropriately
- Never store plain-text passwords
- Use environment-based configuration

### ❌ Don't

- Use sync methods in production (blocking)
- Use salt rounds below 10
- Hash already-hashed passwords
- Compare plain text passwords
- Log passwords or hashes
- Implement your own hashing

## Common Patterns

### Password Reset

```typescript
@Injectable()
export class PasswordResetService {
  async resetPassword(userId: string, newPassword: string) {
    // Validate new password
    if (!this.isStrongPassword(newPassword)) {
      throw new BadRequestException('Weak password');
    }

    // Hash new password
    const hash = await this.bcryptService.hash(newPassword);

    // Update in database
    await this.userRepository.update(userId, {
      password: hash,
      passwordChangedAt: new Date(),
    });

    // Invalidate existing sessions
    await this.sessionService.invalidateAllSessions(userId);
  }
}
```

### Password Change with Verification

```typescript
async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await this.userRepository.findById(userId);

  // Verify current password
  const isValid = await this.bcryptService.compare(
    currentPassword,
    user.password,
  );

  if (!isValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  // Prevent reusing old password
  const isSamePassword = await this.bcryptService.compare(
    newPassword,
    user.password,
  );

  if (isSamePassword) {
    throw new BadRequestException('New password must be different');
  }

  // Hash and update
  const newHash = await this.bcryptService.hash(newPassword);
  await this.userRepository.update(userId, { password: newHash });
}
```

### Rate Limiting Login Attempts

```typescript
@Injectable()
export class AuthService {
  private attempts = new Map<string, number>();

  async login(email: string, password: string) {
    const attempts = this.attempts.get(email) || 0;

    if (attempts >= 5) {
      throw new TooManyRequestsException('Too many failed attempts');
    }

    const user = await this.findByEmail(email);
    const isValid = await this.bcryptService.compare(password, user.password);

    if (!isValid) {
      this.attempts.set(email, attempts + 1);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset on successful login
    this.attempts.delete(email);
    return this.generateToken(user);
  }
}
```

## Performance Optimization

### Caching Hash Checks (Not Recommended)

```typescript
// ⚠️ Use with extreme caution
// Only for read-heavy scenarios with rate limiting
@Injectable()
export class CachedAuthService {
  private cache = new Map<string, boolean>();

  async compareWithCache(password: string, hash: string): Promise<boolean> {
    const cacheKey = `${password}:${hash}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.bcryptService.compare(password, hash);

    // Cache for 1 minute max
    this.cache.set(cacheKey, result);
    setTimeout(() => this.cache.delete(cacheKey), 60000);

    return result;
  }
}
```

### Async Processing

```typescript
// Hash multiple passwords in parallel
async hashMultiple(passwords: string[]): Promise<string[]> {
  return Promise.all(
    passwords.map(pwd => this.bcryptService.hash(pwd))
  );
}
```

## Error Handling

```typescript
@Injectable()
export class SafeAuthService {
  async safeHash(password: string): Promise<string | null> {
    try {
      return await this.bcryptService.hash(password);
    } catch (error) {
      this.logger.error('Hash failed', error);
      return null;
    }
  }

  async safeCompare(password: string, hash: string): Promise<boolean> {
    try {
      return await this.bcryptService.compare(password, hash);
    } catch (error) {
      this.logger.error('Compare failed', error);
      return false;
    }
  }
}
```

## Testing

```typescript
describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should hash and verify password', async () => {
    const password = 'SecurePass123!';
    const hash = await service.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);

    const isValid = await service.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hash = await service.hash('correct');
    const isValid = await service.compare('wrong', hash);

    expect(isValid).toBe(false);
  });
});
```

## See Also

- [BcryptService API](/api/bcrypt-service)
- [Security Best Practices](/guide/security)
- [Authentication Example](/examples/authentication)
- [Configuration Guide](/guide/configuration)
