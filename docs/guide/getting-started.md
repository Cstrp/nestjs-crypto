# Getting Started

This guide will help you install and configure NestJS Crypto in your NestJS application.

## Prerequisites

- Node.js 18 or higher
- NestJS 10 or 11
- TypeScript 4.1.2 or higher

## Installation

Install the package and its peer dependencies:

::: code-group

```bash [npm]
npm install nestjs-crypto bcrypt reflect-metadata
```

```bash [yarn]
yarn add nestjs-crypto bcrypt reflect-metadata
```

```bash [pnpm]
pnpm add nestjs-crypto bcrypt reflect-metadata
```

:::

## Basic Setup

### 1. Import the Module

Import `CryptoModule` in your application module:

```typescript
import { Module } from '@nestjs/common';
import { CryptoModule } from 'nestjs-crypto';

@Module({
  imports: [
    CryptoModule.forRoot({
      useBcrypt: true,
      bcryptSaltRounds: 12,
      useAes: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Inject Services

Inject the services where you need them:

```typescript
import { Injectable } from '@nestjs/common';
import { BcryptService, AesService } from 'nestjs-crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly aesService: AesService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.bcryptService.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.bcryptService.compare(password, hash);
  }
}
```

## Configuration Options

### Basic Configuration

```typescript
CryptoModule.forRoot({
  // Global module (optional)
  isGlobal: true,

  // Enable/disable services
  useBcrypt: true,
  useAes: true,

  // Bcrypt configuration
  bcryptSaltRounds: 12, // Recommended: 10-12

  // Custom AES key and IV (optional)
  aesKey: process.env.AES_KEY,
  aesIv: process.env.AES_IV,

  // Debug mode (development only)
  debug: false,
})
```

### Global Module

Make the crypto services available globally without importing in each module:

```typescript
CryptoModule.forRoot({
  isGlobal: true,
  useBcrypt: true,
  useAes: true,
})
```

### Partial Service Registration

Only register the services you need:

```typescript
// Only Bcrypt
CryptoModule.forRoot({
  useBcrypt: true,
  useAes: false,
  bcryptSaltRounds: 12,
})

// Only AES
CryptoModule.forRoot({
  useBcrypt: false,
  useAes: true,
})
```

## Async Configuration

For dynamic configuration using ConfigService or other providers:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from 'nestjs-crypto';

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
        debug: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Environment Variables

Create a `.env` file for sensitive configuration:

```env
# Bcrypt Configuration
BCRYPT_ROUNDS=12

# AES Configuration (optional - auto-generated if not provided)
AES_KEY=your-64-character-hex-key
AES_IV=your-32-character-hex-iv

# Debug mode
NODE_ENV=development
```

::: warning Security Note
Never commit `.env` files to version control. Add `.env` to your `.gitignore` file.
:::

## Verification

Test your setup:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BcryptService, AesService } from 'nestjs-crypto';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly aesService: AesService,
  ) {}

  async onModuleInit() {
    // Test Bcrypt
    const password = 'test123';
    const hash = await this.bcryptService.hash(password, 12);
    const isValid = await this.bcryptService.compare(password, hash);
    console.log('Bcrypt test:', isValid ? '✅ PASSED' : '❌ FAILED');

    // Test AES
    const data = 'Hello, World!';
    const { encrypted, key, iv } = this.aesService.encrypt(data);
    const decrypted = this.aesService.decrypt(encrypted, key, iv);
    console.log('AES test:', decrypted === data ? '✅ PASSED' : '❌ FAILED');
  }
}
```

## Next Steps

Now that you have NestJS Crypto installed and configured, explore:

- [Module Configuration](/guide/configuration) - Detailed configuration options
- [Bcrypt Service](/guide/bcrypt) - Password hashing guide
- [AES Service](/guide/aes) - Data encryption guide
- [Security Best Practices](/guide/security) - Security recommendations
- [Examples](/examples/authentication) - Real-world examples

## Troubleshooting

### Common Issues

#### Module not found

```bash
npm install --save nestjs-crypto bcrypt reflect-metadata
```

#### TypeScript errors

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

#### Bcrypt installation errors

On some systems, you may need build tools:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools
```

For more help, see the [Troubleshooting](/guide/troubleshooting) guide.
