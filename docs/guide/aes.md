# AES Service Guide

Learn how to use AES-256-CBC encryption for protecting sensitive data in your NestJS application.

## What is AES?

AES (Advanced Encryption Standard) with 256-bit keys in CBC (Cipher Block Chaining) mode is a symmetric encryption algorithm. It's reversible, meaning you can encrypt and decrypt data using the same key.

## When to Use AES

- Encrypting sensitive user data (PII, SSN, etc.)
- Protecting database fields
- Securing file contents
- API key encryption
- Configuration secrets

## Basic Usage

### Encrypting Data

```typescript
import { Injectable } from '@nestjs/common';
import { AesService } from 'nestjs-crypto';

@Injectable()
export class DataService {
  constructor(private readonly aesService: AesService) {}

  async saveEncryptedData(data: string) {
    // Encrypt with auto-generated key and IV
    const result = this.aesService.encrypt(data);

    // Store encrypted data, key, and IV securely
    return {
      encrypted: result.encrypted,
      keyId: await this.storeKey(result.key),
      ivId: await this.storeIv(result.iv),
    };
  }
}
```

### Decrypting Data

```typescript
async getDecryptedData(encryptedData: string, keyId: string, ivId: string) {
  // Retrieve key and IV from secure storage
  const key = await this.retrieveKey(keyId);
  const iv = await this.retrieveIv(ivId);

  // Decrypt
  const decrypted = this.aesService.decrypt(encryptedData, key, iv);
  return decrypted;
}
```

## Key Management

### Using Environment Variables

```typescript
// For development only
const key = process.env.AES_KEY; // 64 hex characters
const result = this.aesService.encrypt(data, key);
```

### Using a Key Management Service

```typescript
@Injectable()
export class KeyManagementService {
  async getEncryptionKey(): Promise<string> {
    // AWS KMS example
    const response = await this.kms.decrypt({
      CiphertextBlob: Buffer.from(process.env.ENCRYPTED_KEY, 'base64'),
    }).promise();

    return response.Plaintext.toString('hex');
  }
}
```

### Key Rotation

```typescript
@Injectable()
export class KeyRotationService {
  async rotateKeys(userId: string) {
    // Get current key version
    const currentVersion = await this.getCurrentKeyVersion(userId);
    const oldKey = await this.getKey(currentVersion);

    // Generate new key
    const newKey = this.aesService.generateKey();
    const newVersion = currentVersion + 1;

    // Re-encrypt all user data
    const userData = await this.getAllUserData(userId);

    for (const data of userData) {
      // Decrypt with old key
      const decrypted = this.aesService.decrypt(
        data.encrypted,
        oldKey.toString('hex'),
        data.iv,
      );

      // Encrypt with new key
      const iv = this.aesService.generateIv();
      const result = this.aesService.encrypt(
        decrypted,
        newKey.toString('hex'),
        iv,
      );

      // Update database
      await this.updateData(data.id, {
        encrypted: result.encrypted,
        iv: result.iv,
        keyVersion: newVersion,
      });
    }

    // Store new key
    await this.storeKey(newVersion, newKey.toString('hex'));
  }
}
```

## IV (Initialization Vector) Usage

### Always Generate New IVs

```typescript
// ✅ CORRECT - New IV for each encryption
async encryptMultiple(items: string[]) {
  const key = await this.getKey();

  return items.map(item => {
    const iv = this.aesService.generateIv(); // New IV each time
    return this.aesService.encrypt(item, key, iv);
  });
}

// ❌ WRONG - Reusing IV
async encryptMultipleWrong(items: string[]) {
  const key = await this.getKey();
  const iv = this.aesService.generateIv(); // Only generated once

  return items.map(item => {
    return this.aesService.encrypt(item, key, iv); // INSECURE!
  });
}
```

### Storing IVs

IVs can be stored alongside encrypted data (they're not secret):

```typescript
interface EncryptedField {
  encrypted: string;
  iv: string; // Can be stored in plain text
  keyVersion: number; // Reference to key (stored securely)
}
```

## Advanced Patterns

### Encrypting Database Fields

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // Store as JSONB
  @Column('jsonb')
  encryptedSSN: {
    encrypted: string;
    iv: string;
    keyVersion: number;
  };

  @Column('jsonb', { nullable: true })
  encryptedCreditCard: {
    encrypted: string;
    iv: string;
    keyVersion: number;
  } | null;
}
```

### Encryption Service

```typescript
@Injectable()
export class EncryptionService {
  constructor(
    private readonly aesService: AesService,
    private readonly keyService: KeyManagementService,
  ) {}

  async encryptField(value: string, userId: string) {
    const key = await this.keyService.getUserKey(userId);
    const iv = this.aesService.generateIv();

    const result = this.aesService.encrypt(value, key, iv);

    return {
      encrypted: result.encrypted,
      iv: result.iv,
      keyVersion: await this.keyService.getCurrentVersion(userId),
    };
  }

  async decryptField(
    field: { encrypted: string; iv: string; keyVersion: number },
    userId: string,
  ) {
    const key = await this.keyService.getUserKey(userId, field.keyVersion);
    return this.aesService.decrypt(field.encrypted, key, field.iv);
  }
}
```

### File Encryption

```typescript
@Injectable()
export class FileEncryptionService {
  async encryptFile(filePath: string): Promise<string> {
    // Read file
    const content = await fs.readFile(filePath, 'utf8');

    // Encrypt
    const key = await this.getFileEncryptionKey();
    const result = this.aesService.encrypt(content, key);

    // Save encrypted file
    const encryptedPath = `${filePath}.encrypted`;
    await fs.writeFile(encryptedPath, JSON.stringify({
      encrypted: result.encrypted,
      iv: result.iv,
    }));

    return encryptedPath;
  }

  async decryptFile(encryptedPath: string): Promise<string> {
    // Read encrypted file
    const data = JSON.parse(await fs.readFile(encryptedPath, 'utf8'));

    // Decrypt
    const key = await this.getFileEncryptionKey();
    const content = this.aesService.decrypt(data.encrypted, key, data.iv);

    // Save decrypted file
    const originalPath = encryptedPath.replace('.encrypted', '');
    await fs.writeFile(originalPath, content);

    return originalPath;
  }
}
```

### Batch Operations

```typescript
async encryptBatch(items: string[]): Promise<Array<{ encrypted: string; iv: string }>> {
  const key = await this.getKey();

  return Promise.all(
    items.map(async item => {
      const iv = this.aesService.generateIv();
      return this.aesService.encrypt(item, key, iv);
    })
  );
}

async decryptBatch(
  items: Array<{ encrypted: string; iv: string }>
): Promise<string[]> {
  const key = await this.getKey();

  return Promise.all(
    items.map(item =>
      this.aesService.decrypt(item.encrypted, key, item.iv)
    )
  );
}
```

## Best Practices

### ✅ Do

- Generate new IV for every encryption
- Use 256-bit keys (32 bytes)
- Store keys in KMS/vault
- Implement key rotation
- Validate input before encryption
- Handle errors appropriately
- Use HTTPS for transmission
- Log access (not data)

### ❌ Don't

- Reuse IVs with the same key
- Hardcode keys in source code
- Store keys with encrypted data
- Use predictable IVs
- Encrypt already encrypted data
- Log decrypted values
- Share keys between environments

## Performance Tips

### Cache Keys (Carefully)

```typescript
@Injectable()
export class CachedKeyService {
  private keyCache = new Map<number, string>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getKey(version: number): Promise<string> {
    const cached = this.keyCache.get(version);
    if (cached) return cached;

    const key = await this.loadFromVault(version);
    this.keyCache.set(version, key);

    // Clear after TTL
    setTimeout(() => this.keyCache.delete(version), this.CACHE_TTL);

    return key;
  }
}
```

### Parallel Processing

```typescript
async encryptMultiple(items: string[]): Promise<Array<EncryptedData>> {
  const key = await this.getKey();

  // Process in parallel
  return Promise.all(
    items.map(async item => {
      const iv = this.aesService.generateIv();
      return this.aesService.encrypt(item, key, iv);
    })
  );
}
```

## Testing

```typescript
describe('AesService', () => {
  let service: AesService;

  beforeEach(() => {
    service = new AesService();
  });

  it('should encrypt and decrypt', () => {
    const data = 'sensitive information';
    const { encrypted, key, iv } = service.encrypt(data);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(data);

    const decrypted = service.decrypt(encrypted, key, iv);
    expect(decrypted).toEqual(data);
  });

  it('should use unique IVs', () => {
    const data = 'same data';
    const key = service.generateKey().toString('hex');

    const result1 = service.encrypt(data, key);
    const result2 = service.encrypt(data, key);

    expect(result1.iv).not.toEqual(result2.iv);
    expect(result1.encrypted).not.toEqual(result2.encrypted);
  });
});
```

## See Also

- [AesService API](/api/aes-service)
- [Security Best Practices](/guide/security)
- [Data Encryption Example](/examples/data-encryption)
- [Configuration Guide](/guide/configuration)
