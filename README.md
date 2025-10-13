# NestJS Crypto

[![npm version](https://badge.fury.io/js/nestjs-crypto.svg)](https://badge.fury.io/js/nestjs-crypto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive crypto module for NestJS applications, providing both irreversible (bcrypt) and reversible (AES) encryption methods with automatic secret generation, performance benchmarks, and extensive documentation.

## Features

- 🔐 **Dual Encryption Support**: Bcrypt for password hashing and AES for data encryption/decryption
- ⚡ **High Performance**: Optimized AES encryption with benchmark comparisons
- 🔑 **Automatic Secret Generation**: Secure random key and IV generation
- 🛡️ **Security First**: Industry-standard encryption algorithms with configurable options
- 📚 **Full Documentation**: VitePress docs with API references and examples
- 🔧 **TypeScript Native**: Strict typing and full IntelliSense support
- 🧪 **Benchmarks**: Built-in performance testing tools
- 🚀 **NestJS Integration**: Seamless module integration with async configuration support

## Installation

```bash
npm install nestjs-crypto
```

### Peer Dependencies

```bash
npm install @nestjs/common @nestjs/core bcrypt reflect-metadata typescript
```

## Quick Start

### Basic Setup

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

### Using the Services

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

  encryptData(data: string): { encrypted: string; key: string; iv: string } {
    return this.aesService.encrypt(data);
  }

  decryptData(encrypted: string, key: string, iv: string): string {
    return this.aesService.decrypt(encrypted, key, iv);
  }
}
```

## Configuration Options

### Module Options

```typescript
interface CryptoModuleOptions {
  isGlobal?: boolean;           // Make services globally available
  secret?: string;              // Custom secret (auto-generated if not provided)
  showSecret?: boolean;         // Log generated secrets (development only)
  useBcrypt?: boolean;          // Enable bcrypt service (default: true)
  bcryptSaltRounds?: number;    // Salt rounds for bcrypt (default: 10)
  useAes?: boolean;             // Enable AES service (default: true)
  aesKey?: string;              // Custom AES key (auto-generated if not provided)
  aesIv?: string;               // Custom AES IV (auto-generated if not provided)
  debug?: boolean;              // Enable debug logging
}
```

### Async Configuration

For dynamic configuration from external sources:

```typescript
import { CryptoModule } from 'nestjs-crypto';

@Module({
  imports: [
    CryptoModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('CRYPTO_SECRET'),
        bcryptSaltRounds: configService.get('BCRYPT_ROUNDS', 12),
        useAes: configService.get('USE_AES', true),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## API Reference

### BcryptService

- `hash(data: string, saltRounds: number): Promise<string>`
- `hashSync(data: string, saltRounds: number): string`
- `compare(data: string, encrypted: string): Promise<boolean>`
- `compareSync(data: string, encrypted: string): boolean`
- `genSalt(saltRounds: number): Promise<string>`
- `getSaltRounds(encrypted: string): number`

### AesService

- `encrypt(data: string, key?, iv?): { encrypted: string; key: string; iv: string }`
- `decrypt(encrypted: string, key: string, iv: string): string`
- `encryptSync(data: string, key?, iv?): { encrypted: string; key: string; iv: string }`
- `decryptSync(encrypted: string, key: string, iv: string): string`
- `generateKey(): Buffer`
- `generateIv(): Buffer`

### Utility Functions

- `generateAesKey(length?: number): string`
- `generateAesIv(length?: number): string`
- `generateSecret(length?: number): string`

## Performance Benchmarks

Run performance benchmarks:

```bash
npm run benchmark
```

Example output:

```text
Benchmarking Bcrypt...
Bcrypt hash (100 iterations): 3577ms
Bcrypt compare (100 iterations): 3514ms

Benchmarking AES...
AES encrypt (1000 iterations): 9ms
AES decrypt (1000 iterations): 4ms
```

## Documentation

- 📖 [Full Documentation](https://cstrp.github.io/nestjs-crypto/)
- 🔗 [API Reference](https://nestjs-crypto-api.pages.dev/)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/cstrp/nestjs-crypto.git
cd nestjs-crypto
npm install
```

### Available Scripts

```bash
npm run build          # Build the library
npm run lint           # Run ESLint
npm run benchmark      # Run performance benchmarks
npm run docs:dev       # Start documentation server
npm run docs:build     # Build documentation
npm run typedoc:build  # Build API documentation
```

### Testing

```bash
npm run build
npm run benchmark
```

## Security Considerations

- **Bcrypt**: Use for password hashing only. Higher salt rounds increase security but impact performance.
- **AES**: Keep keys and IVs secure. Never hardcode them in source code.
- **Secrets**: The library generates secure random secrets, but consider using environment variables for production.
- **Key Management**: Rotate encryption keys periodically and implement proper key lifecycle management.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (Prettier + ESLint)
- Add tests for new features
- Update documentation
- Run benchmarks to ensure performance
- Use conventional commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: [0x467@pm.me](mailto:0x467@pm.me)
- 🐛 Issues: [GitHub Issues](https://github.com/cstrp/nestjs-crypto/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/cstrp/nestjs-crypto/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ for the NestJS community
