# Utility Functions API

Helper functions for common cryptographic operations.

## generateAesKey()

Generate a cryptographically secure 32-byte AES encryption key.

```typescript
import { generateAesKey } from 'nestjs-crypto';

const key = generateAesKey();
console.log(key.length); // 32 bytes
console.log(key.toString('hex').length); // 64 characters
```

**Returns:** `Buffer` - 32-byte (256-bit) random key

**Example:**

```typescript
import { generateAesKey, generateAesIv } from 'nestjs-crypto';

const key = generateAesKey();
const iv = generateAesIv();

// Store securely
await keyVault.store('aes-key-v1', key.toString('hex'));
await keyVault.store('aes-iv-v1', iv.toString('hex'));
```

---

## generateAesIv()

Generate a cryptographically secure 16-byte initialization vector for AES.

```typescript
import { generateAesIv } from 'nestjs-crypto';

const iv = generateAesIv();
console.log(iv.length); // 16 bytes
console.log(iv.toString('hex').length); // 32 characters
```

**Returns:** `Buffer` - 16-byte (128-bit) random IV

**Important:** Always generate a new IV for each encryption operation!

**Example:**

```typescript
import { AesService, generateAesIv } from 'nestjs-crypto';

@Injectable()
export class EncryptionService {
  constructor(private readonly aesService: AesService) {}

  async encrypt(data: string) {
    const key = process.env.AES_KEY;
    const iv = generateAesIv(); // New IV each time!

    const result = this.aesService.encrypt(data, key, iv);
    return {
      encrypted: result.encrypted,
      iv: result.iv,
    };
  }
}
```

---

## generateSecret()

Generate a cryptographically secure random secret of specified length.

```typescript
import { generateSecret } from 'nestjs-crypto';

// Generate 32-byte secret
const secret = generateSecret(32);
console.log(secret.toString('hex'));

// Generate 64-byte secret
const longSecret = generateSecret(64);
```

**Parameters:**
- `length` (number) - Byte length of the secret (default: 32)

**Returns:** `Buffer` - Random bytes of specified length

**Example:**

```typescript
import { generateSecret } from 'nestjs-crypto';

// Generate API key
const apiKey = generateSecret(32).toString('hex');
console.log(apiKey); // 64 hex characters

// Generate session token
const sessionToken = generateSecret(48).toString('base64');

// Generate salt
const salt = generateSecret(16).toString('hex');
```

---

## Validation Helpers

### isValidHexKey()

Check if a string is a valid 64-character hex key (32 bytes).

```typescript
import { isValidHexKey } from 'nestjs-crypto';

const key = '0123456789abcdef...'; // 64 hex chars
console.log(isValidHexKey(key)); // true

const invalidKey = 'short';
console.log(isValidHexKey(invalidKey)); // false
```

### isValidHexIv()

Check if a string is a valid 32-character hex IV (16 bytes).

```typescript
import { isValidHexIv } from 'nestjs-crypto';

const iv = '0123456789abcdef0123456789abcdef'; // 32 hex chars
console.log(isValidHexIv(iv)); // true
```

---

## Complete Example

```typescript
import { Injectable } from '@nestjs/common';
import {
  AesService,
  generateAesKey,
  generateAesIv,
  generateSecret,
} from 'nestjs-crypto';

@Injectable()
export class CryptoUtilService {
  constructor(private readonly aesService: AesService) {}

  /**
   * Generate new encryption keys for a user
   */
  async generateUserKeys(userId: string) {
    const encryptionKey = generateAesKey();
    const apiKey = generateSecret(32);

    return {
      userId,
      encryptionKey: encryptionKey.toString('hex'),
      apiKey: apiKey.toString('hex'),
      createdAt: new Date(),
    };
  }

  /**
   * Encrypt data with auto-generated IV
   */
  async encryptWithNewIv(data: string, key: string) {
    const iv = generateAesIv();
    const result = this.aesService.encrypt(data, key, iv);

    return {
      encrypted: result.encrypted,
      iv: result.iv,
    };
  }

  /**
   * Generate secure token
   */
  generateToken(length: number = 32): string {
    return generateSecret(length).toString('base64url');
  }

  /**
   * Generate API key with prefix
   */
  generateApiKey(prefix: string = 'sk'): string {
    const secret = generateSecret(32).toString('hex');
    return `${prefix}_${secret}`;
  }
}
```

## Best Practices

### ✅ Do

- Use `generateAesKey()` for new encryption keys
- Generate new IV with `generateAesIv()` for each encryption
- Use `generateSecret()` for API keys, tokens, salts
- Store generated keys securely (KMS, vault)
- Use appropriate byte lengths (32 for keys, 16 for IVs)

### ❌ Don't

- Reuse IVs with the same key
- Generate keys using simple random functions
- Store keys in plain text
- Use predictable key generation
- Share keys between environments

## Security Notes

All utility functions use Node.js `crypto.randomBytes()` which provides cryptographically strong pseudo-random data suitable for cryptographic purposes.

```typescript
// Under the hood (simplified):
import { randomBytes } from 'crypto';

export function generateAesKey(): Buffer {
  return randomBytes(32); // Secure random bytes
}
```

## See Also

- [AesService API](/api/aes-service)
- [BcryptService API](/api/bcrypt-service)
- [Security Best Practices](/guide/security)
- [Getting Started](/guide/getting-started)
