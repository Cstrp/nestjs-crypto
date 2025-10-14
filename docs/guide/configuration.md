# Module Configuration

Learn how to configure the NestJS Crypto module for your application needs.

## Configuration Options

### CryptoModuleOptions

```typescript
interface CryptoModuleOptions {
  // Global module registration
  isGlobal?: boolean;

  // Service toggles
  useBcrypt?: boolean;
  useAes?: boolean;

  // Bcrypt configuration
  bcryptSaltRounds?: number;

  // AES configuration
  aesKey?: string | Buffer;
  aesIv?: string | Buffer;

  // Debugging
  debug?: boolean;
  showSecret?: boolean;
}
```

## Configuration Methods

### Static Configuration

Use `forRoot()` for static configuration:

```typescript
import { CryptoModule } from 'nestjs-crypto';

@Module({
  imports: [
    CryptoModule.forRoot({
      isGlobal: true,
      useBcrypt: true,
      bcryptSaltRounds: 12,
      useAes: true,
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

Use `forRootAsync()` for dynamic configuration:

```typescript
import { CryptoModule } from 'nestjs-crypto';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CryptoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        useBcrypt: true,
        bcryptSaltRounds: configService.get('BCRYPT_ROUNDS', 12),
        useAes: true,
        aesKey: configService.get('AES_KEY'),
        aesIv: configService.get('AES_IV'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Configuration Examples

### Global Module

Make services available everywhere without importing:

```typescript
CryptoModule.forRoot({
  isGlobal: true,
  useBcrypt: true,
  useAes: true,
})
```

### Only Password Hashing

```typescript
CryptoModule.forRoot({
  useBcrypt: true,
  useAes: false,
  bcryptSaltRounds: 12,
})
```

### Only Data Encryption

```typescript
CryptoModule.forRoot({
  useBcrypt: false,
  useAes: true,
  aesKey: process.env.AES_KEY,
  aesIv: process.env.AES_IV,
})
```

### Development Mode

```typescript
CryptoModule.forRoot({
  useBcrypt: true,
  useAes: true,
  debug: true,
  showSecret: true, // Shows generated keys in console
})
```

## Bcrypt Configuration

### Salt Rounds

The number of rounds affects security and performance:

```typescript
{
  bcryptSaltRounds: 12, // Recommended: 10-12
}
```

| Salt Rounds | Time per Hash | Security Level |
|-------------|---------------|----------------|
| 8           | ~40ms         | Low            |
| 10          | ~150ms        | Medium         |
| 12          | ~600ms        | High ⭐        |
| 14          | ~2.5s         | Very High      |
| 16          | ~10s          | Extreme        |

::: tip Recommendation
Use **12 rounds** for most applications. This provides excellent security while maintaining reasonable performance.
:::

::: warning Performance Impact
Higher salt rounds increase security but significantly impact performance. Test with your expected load.
:::

## AES Configuration

### Custom Keys and IVs

Provide your own encryption keys:

```typescript
{
  aesKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // 64 hex chars
  aesIv: '0123456789abcdef0123456789abcdef', // 32 hex chars
}
```

### Auto-Generated Keys

If not provided, keys are automatically generated:

```typescript
{
  useAes: true,
  // aesKey and aesIv auto-generated
  showSecret: true, // Log generated keys (dev only)
}
```

::: danger Security Warning
**Never hardcode keys in source code!** Always use environment variables or secure key management systems.
:::

## Environment-Based Configuration

### Production Configuration

```typescript
// .env.production
BCRYPT_ROUNDS=12
AES_KEY=your-production-key
AES_IV=your-production-iv
DEBUG=false
```

```typescript
CryptoModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    isGlobal: true,
    useBcrypt: true,
    bcryptSaltRounds: config.get('BCRYPT_ROUNDS', 12),
    useAes: true,
    aesKey: config.get('AES_KEY'),
    aesIv: config.get('AES_IV'),
    debug: config.get('DEBUG', false),
  }),
  inject: [ConfigService],
})
```

### Development Configuration

```typescript
// .env.development
BCRYPT_ROUNDS=8
DEBUG=true
SHOW_SECRET=true
```

```typescript
CryptoModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    isGlobal: true,
    useBcrypt: true,
    bcryptSaltRounds: config.get('BCRYPT_ROUNDS', 8),
    useAes: true,
    debug: config.get('DEBUG', true),
    showSecret: config.get('SHOW_SECRET', true),
  }),
  inject: [ConfigService],
})
```

## Multi-Module Configuration

### Feature Modules

Use in specific feature modules:

```typescript
// auth.module.ts
@Module({
  imports: [
    CryptoModule.forRoot({
      useBcrypt: true,
      useAes: false,
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}

// data.module.ts
@Module({
  imports: [
    CryptoModule.forRoot({
      useBcrypt: false,
      useAes: true,
    }),
  ],
  providers: [DataService],
})
export class DataModule {}
```

## Best Practices

### ✅ Do

- Use environment variables for sensitive configuration
- Use 12 salt rounds for bcrypt in production
- Enable debug mode only in development
- Rotate encryption keys periodically
- Store keys in secure key management systems (AWS KMS, Azure Key Vault, etc.)

### ❌ Don't

- Hardcode keys in source code
- Commit `.env` files to version control
- Use low salt rounds in production
- Share keys between environments
- Log sensitive data in production

## Next Steps

- [Bcrypt Service Guide](/guide/bcrypt) - Learn about password hashing
- [AES Service Guide](/guide/aes) - Learn about data encryption
- [Security Best Practices](/guide/security) - Security recommendations
- [Async Configuration](/async-configuration) - Advanced async setup
