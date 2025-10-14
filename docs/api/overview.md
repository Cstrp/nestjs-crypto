# API Overview

This section provides a comprehensive reference for all APIs provided by NestJS Crypto.

## Core Services

### BcryptService

Password hashing service using bcrypt algorithm.

- [Full API Reference](/api/bcrypt-service)
- **Use Case**: Password hashing, user authentication
- **Algorithm**: bcrypt with configurable salt rounds

### AesService

Data encryption/decryption service using AES-256-CBC.

- [Full API Reference](/api/aes-service)
- **Use Case**: Data encryption, sensitive information storage
- **Algorithm**: AES-256-CBC with auto-generated keys and IVs

## Utility Functions

Helper functions for key and secret generation.

- [Full API Reference](/api/utilities)
- `generateAesKey()` - Generate AES encryption key
- `generateAesIv()` - Generate initialization vector
- `generateSecret()` - Generate random secret

## Module Configuration

### CryptoModule

Main module for configuring and registering services.

#### Static Configuration

```typescript
CryptoModule.forRoot(options: CryptoModuleOptions)
```

#### Async Configuration

```typescript
CryptoModule.forRootAsync(options: CryptoModuleAsyncOptions)
```

See [Configuration Guide](/guide/configuration) for details.

## Type Definitions

### CryptoModuleOptions

```typescript
interface CryptoModuleOptions {
  isGlobal?: boolean;
  useBcrypt?: boolean;
  useAes?: boolean;
  bcryptSaltRounds?: number;
  aesKey?: string | Buffer;
  aesIv?: string | Buffer;
  debug?: boolean;
  showSecret?: boolean;
}
```

### CryptoModuleAsyncOptions

```typescript
interface CryptoModuleAsyncOptions {
  imports?: any[];
  useFactory?: (...args: any[]) => Promise<CryptoModuleOptions> | CryptoModuleOptions;
  inject?: any[];
  useClass?: Type<CryptoModuleOptionsFactory>;
  useExisting?: Type<CryptoModuleOptionsFactory>;
}
```

## Error Classes

Custom error classes for better error handling:

- `CryptoError` - Base error class
- `ValidationError` - Input validation errors
- `EncryptionError` - Encryption operation errors
- `DecryptionError` - Decryption operation errors
- `HashingError` - Hashing operation errors
- `InvalidKeyError` - Invalid key/IV format errors

### Error Handling Example

```typescript
import { ValidationError, EncryptionError } from 'nestjs-crypto';

try {
  const hash = await bcryptService.hash(password, 12);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof HashingError) {
    // Handle hashing error
  }
}
```

## Quick Reference

### BcryptService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `hash(data, saltRounds)` | Hash data with bcrypt | `Promise<string>` |
| `hashSync(data, saltRounds)` | Hash data synchronously | `Promise<string>` |
| `compare(data, hash)` | Compare data with hash | `Promise<boolean>` |
| `compareSync(data, hash)` | Compare synchronously | `Promise<boolean>` |
| `genSalt(saltRounds)` | Generate salt | `Promise<string>` |
| `getSaltRounds(hash)` | Extract salt rounds | `Promise<number>` |

### AesService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `encrypt(data, key?, iv?)` | Encrypt data | `{encrypted, key, iv}` |
| `decrypt(encrypted, key, iv)` | Decrypt data | `string` |
| `generateKey()` | Generate AES key | `Buffer` |
| `generateIv()` | Generate IV | `Buffer` |

## TypeDoc API Documentation

For complete TypeScript API documentation with all types, interfaces, and detailed method signatures, visit:

**[TypeDoc API Reference →](https://nestjs-crypto-api.pages.dev/)**

## Next Steps

- [BcryptService API](/api/bcrypt-service) - Detailed Bcrypt API
- [AesService API](/api/aes-service) - Detailed AES API
- [Utility Functions](/api/utilities) - Helper utilities
- [Examples](/examples/authentication) - Real-world examples
