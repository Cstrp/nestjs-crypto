# NestJS Crypto

A comprehensive NestJS module for data encryption and hashing, providing both irreversible (bcrypt) and reversible (AES) encryption methods with automatic secret generation, performance benchmarks, and strict TypeScript typing.

## Features

- **Bcrypt Hashing**: Secure password hashing with configurable salt rounds
- **AES Encryption**: Symmetric encryption for data that needs to be decrypted
- **Automatic Secret Generation**: Keys and IVs generated automatically if not provided
- **Performance Benchmarks**: Built-in benchmarking tools
- **TypeScript Support**: Full type safety and IntelliSense
- **NestJS Integration**: Easy module setup with global or feature-specific configurations

## Installation

```bash
npm install nestjs-crypto
```

## Quick Start

### Synchronous Usage

```typescript
import { CryptoModule } from 'nestjs-crypto';

@Module({
  imports: [CryptoModule.forRoot({})],
})
export class AppModule {}
```

### Service Usage

```typescript
import { BcryptService, AesService } from 'nestjs-crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcrypt: BcryptService,
    private readonly aes: AesService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.bcrypt.hash(password, 10);
  }

  async encryptData(data: string) {
    return this.aes.encrypt(data);
  }
}
```

## API Reference

See the [API Documentation](https://nestjs-crypto-api.pages.dev/) for detailed method signatures and examples.
