# AesService API

The `AesService` provides methods for encrypting and decrypting data using AES-256-CBC.

## Methods

### encrypt()

Encrypt data using AES-256-CBC encryption.

```typescript
encrypt(
  data: string,
  key?: Buffer | string,
  iv?: Buffer | string
): { encrypted: string; key: string; iv: string }
```

**Parameters:**
- `data` (string) - Data to encrypt (required, non-empty)
- `key` (Buffer | string, optional) - 32-byte encryption key or 64-char hex string
- `iv` (Buffer | string, optional) - 16-byte IV or 32-char hex string

**Returns:**
```typescript
{
  encrypted: string; // Hex-encoded encrypted data
  key: string;       // Hex-encoded key (64 characters)
  iv: string;        // Hex-encoded IV (32 characters)
}
```

**Throws:**
- `ValidationError` - If data is empty
- `InvalidKeyError` - If key/IV format or length is invalid
- `EncryptionError` - If encryption fails

**Examples:**

```typescript
// Auto-generate key and IV
const result = aesService.encrypt('sensitive data');
console.log(result.encrypted); // Hex string
console.log(result.key);       // 64-char hex
console.log(result.iv);        // 32-char hex

// With custom key and IV
const key = aesService.generateKey();
const iv = aesService.generateIv();
const result = aesService.encrypt('data', key, iv);

// With hex string key and IV
const result = aesService.encrypt(
  'data',
  '0123...', // 64 hex chars
  'abcd...'  // 32 hex chars
);
```

---

### decrypt()

Decrypt AES-256-CBC encrypted data.

```typescript
decrypt(
  encryptedData: string,
  key: string,
  iv: string
): string
```

**Parameters:**
- `encryptedData` (string) - Hex-encoded encrypted data
- `key` (string) - 64-character hex string
- `iv` (string) - 32-character hex string

**Returns:**
`string` - Decrypted plain text

**Throws:**
- `ValidationError` - If inputs are empty or invalid format
- `InvalidKeyError` - If key/IV format is invalid
- `DecryptionError` - If decryption fails (wrong key/IV)

**Example:**

```typescript
const { encrypted, key, iv } = aesService.encrypt('secret message');

// Later, decrypt with the same key and IV
const decrypted = aesService.decrypt(encrypted, key, iv);
console.log(decrypted); // 'secret message'
```

---

### generateKey()

Generate a cryptographically secure random 32-byte AES key.

```typescript
generateKey(): Buffer
```

**Returns:**
`Buffer` - 32-byte (256-bit) random key

**Throws:**
- `EncryptionError` - If key generation fails

**Example:**

```typescript
const key = aesService.generateKey();
console.log(key.length); // 32
console.log(key.toString('hex').length); // 64
```

---

### generateIv()

Generate a cryptographically secure random 16-byte initialization vector.

```typescript
generateIv(): Buffer
```

**Returns:**
`Buffer` - 16-byte (128-bit) random IV

**Throws:**
- `EncryptionError` - If IV generation fails

**Example:**

```typescript
const iv = aesService.generateIv();
console.log(iv.length); // 16
console.log(iv.toString('hex').length); // 32
```

## Key Specifications

### Key Requirements

- **Length:** 32 bytes (256 bits)
- **Format:** Buffer or 64-character hex string
- **Generation:** Use `generateKey()` or Node.js `crypto.randomBytes(32)`

### IV Requirements

- **Length:** 16 bytes (128 bits)
- **Format:** Buffer or 32-character hex string
- **Generation:** Use `generateIv()` or Node.js `crypto.randomBytes(16)`
- **Uniqueness:** Use a different IV for each encryption operation

## Complete Example

```typescript
import { Injectable } from '@nestjs/common';
import { AesService } from 'nestjs-crypto';

@Injectable()
export class DataEncryptionService {
  constructor(private readonly aesService: AesService) {}

  // Encrypt user data
  encryptUserData(data: any) {
    const jsonData = JSON.stringify(data);
    const { encrypted, key, iv } = this.aesService.encrypt(jsonData);

    // Store key and IV securely (e.g., AWS KMS, Azure Key Vault)
    return {
      encrypted,
      keyId: this.storeKey(key),
      ivId: this.storeIv(iv),
    };
  }

  // Decrypt user data
  decryptUserData(encrypted: string, keyId: string, ivId: string) {
    const key = this.retrieveKey(keyId);
    const iv = this.retrieveIv(ivId);

    const decrypted = this.aesService.decrypt(encrypted, key, iv);
    return JSON.parse(decrypted);
  }

  // Encrypt with persistent key (stored in environment)
  encryptWithPersistentKey(data: string) {
    const key = process.env.AES_KEY; // From environment
    const iv = this.aesService.generateIv(); // New IV each time

    const { encrypted } = this.aesService.encrypt(data, key, iv);
    return { encrypted, iv: iv.toString('hex') };
  }

  // Helper methods
  private storeKey(key: string): string {
    // Store in KMS and return key ID
    return 'key-id';
  }

  private storeIv(iv: string): string {
    // Store IV (can be in database, less sensitive than key)
    return 'iv-id';
  }

  private retrieveKey(keyId: string): string {
    // Retrieve from KMS
    return 'hex-key';
  }

  private retrieveIv(ivId: string): string {
    // Retrieve from storage
    return 'hex-iv';
  }
}
```

## Best Practices

### ✅ Do

- Generate a new IV for each encryption
- Store keys in secure key management systems
- Use 256-bit (32-byte) keys
- Validate input data before encryption
- Handle errors appropriately
- Use HTTPS when transmitting encrypted data

### ❌ Don't

- Reuse IVs with the same key
- Store keys in source code
- Use short or predictable keys
- Store keys alongside encrypted data
- Ignore error handling
- Transmit keys in plain text

## Error Handling

```typescript
import { ValidationError, EncryptionError, DecryptionError } from 'nestjs-crypto';

try {
  const result = aesService.encrypt(data, key, iv);
} catch (error) {
  if (error instanceof ValidationError) {
    // Invalid input (empty data, wrong key/IV length)
    console.error('Validation error:', error.message);
  } else if (error instanceof EncryptionError) {
    // Encryption failed
    console.error('Encryption error:', error.message);
  }
}

try {
  const decrypted = aesService.decrypt(encrypted, key, iv);
} catch (error) {
  if (error instanceof DecryptionError) {
    // Wrong key/IV or corrupted data
    console.error('Decryption failed:', error.message);
  }
}
```

## Security Considerations

### Key Management

1. **Never hardcode keys** in source code
2. **Use environment variables** for development
3. **Use KMS** (AWS KMS, Azure Key Vault) for production
4. **Rotate keys** periodically
5. **Implement key versioning** for smooth rotation

### IV Management

1. **Generate new IV** for each encryption
2. **Never reuse** IV with the same key
3. **IVs can be stored** with encrypted data (less sensitive than keys)
4. **IVs should be random** and unpredictable

### Data Handling

1. **Validate input** before encryption
2. **Use HTTPS** for transmission
3. **Implement access controls**
4. **Log access** (but never log keys or decrypted data)
5. **Handle errors** without leaking sensitive info

## See Also

- [Getting Started](/guide/getting-started)
- [Security Best Practices](/guide/security)
- [Data Encryption Example](/examples/data-encryption)
- [File Encryption Example](/examples/file-encryption)
