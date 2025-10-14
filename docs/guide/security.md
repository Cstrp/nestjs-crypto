# Security Best Practices

Learn how to use NestJS Crypto securely in your applications.

## Overview

Security is paramount when dealing with encryption and sensitive data. This guide covers best practices for using the NestJS Crypto module securely.

## Password Hashing with Bcrypt

### Salt Rounds Configuration

Choose appropriate salt rounds based on your security requirements:

```typescript
CryptoModule.forRoot({
  bcrypt: {
    saltRounds: 12, // Recommended for production
  },
})
```

**Recommendations by Environment:**

| Environment | Salt Rounds | Hash Time | Security Level |
|-------------|-------------|-----------|----------------|
| Development | 10 | ~100ms | Basic |
| Production | 12 | ~250ms | Standard |
| High Security | 14 | ~600ms | High |
| Maximum | 16 | ~1.5s | Maximum |

### Password Policies

Implement strong password requirements:

```typescript
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
}

function validatePassword(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
}
```

## AES Encryption Security

### Key Management

**Never hardcode keys in your application:**

```typescript
// ❌ BAD - Keys in source code
const key = '0123456789abcdef...';

// ✅ GOOD - Keys from secure storage
const key = process.env.AES_KEY; // From environment
const key = await kms.decrypt(encryptedKey); // From KMS
```

### Key Storage Solutions

1. **AWS KMS** (Key Management Service)
2. **Azure Key Vault**
3. **HashiCorp Vault**
4. **Google Cloud KMS**
5. **Environment Variables** (for development only)

### Key Rotation

Implement regular key rotation:

```typescript
@Injectable()
export class KeyRotationService {
  async rotateKeys(): Promise<void> {
    const oldKey = this.getCurrentKey();
    const newKey = this.generateNewKey();

    // Re-encrypt all data with new key
    await this.reEncryptAllData(oldKey, newKey);

    // Update key version
    await this.updateKeyVersion();
  }
}
```

### IV (Initialization Vector) Usage

**Always use a unique IV for each encryption:**

```typescript
// ✅ GOOD - New IV each time
const iv1 = aesService.generateIv();
const result1 = aesService.encrypt(data, key, iv1);

const iv2 = aesService.generateIv();
const result2 = aesService.encrypt(data, key, iv2);

// ❌ BAD - Reusing IV
const iv = aesService.generateIv();
const result1 = aesService.encrypt(data1, key, iv); // OK
const result2 = aesService.encrypt(data2, key, iv); // WRONG!
```

## Data Transmission Security

### Use HTTPS

Always transmit sensitive data over HTTPS:

```typescript
// ✅ GOOD
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ encrypted }),
});

// ❌ BAD
const response = await fetch('http://api.example.com/data', { ... });
```

### Never Transmit Keys

```typescript
// ❌ BAD - Sending key in response
return {
  encrypted: result.encrypted,
  key: result.key, // NEVER DO THIS!
  iv: result.iv,
};

// ✅ GOOD - Store key securely, send reference
const keyId = await this.storeKey(result.key);
return {
  encrypted: result.encrypted,
  keyId: keyId, // Send ID, not actual key
  iv: result.iv,
};
```

## Error Handling

### Don't Leak Sensitive Information

```typescript
// ❌ BAD - Exposing details
catch (error) {
  throw new Error(`Decryption failed with key ${key}: ${error.message}`);
}

// ✅ GOOD - Generic error
catch (error) {
  logger.error('Decryption failed', { error });
  throw new Error('Decryption failed');
}
```

### Implement Rate Limiting

Protect against brute force attacks:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 requests per minute
    }),
  ],
})
export class AppModule {}
```

## Access Control

### Restrict Decryption Access

```typescript
@Injectable()
export class SecureDataService {
  async getDecryptedData(userId: string, dataId: string) {
    // Check permissions
    if (!await this.hasAccess(userId, dataId)) {
      throw new ForbiddenException('Access denied');
    }

    // Decrypt only if authorized
    return this.decryptData(dataId);
  }
}
```

### Audit Logging

Log access to sensitive data:

```typescript
@Injectable()
export class AuditService {
  async logDecryption(userId: string, dataId: string) {
    await this.auditLog.create({
      userId,
      action: 'DECRYPT',
      resource: dataId,
      timestamp: new Date(),
      ipAddress: this.getClientIp(),
    });
  }
}
```

## Environment Configuration

### Development

```bash
# .env.development
AES_KEY=your-dev-key-here
BCRYPT_SALT_ROUNDS=10
```

### Production

```bash
# Use secrets manager, not .env files
# AWS Secrets Manager
# Azure Key Vault
# HashiCorp Vault
```

### Docker Secrets

```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - aes_key

secrets:
  aes_key:
    external: true
```

## Compliance

### GDPR

- Implement right to be forgotten
- Encrypt personal data
- Log data access
- Implement data retention policies

### HIPAA

- Encrypt Protected Health Information (PHI)
- Implement audit trails
- Use strong encryption (AES-256)
- Secure key management

### PCI DSS

- Encrypt cardholder data
- Implement key rotation
- Use strong cryptography
- Maintain audit logs

## Security Checklist

### Before Deployment

- [ ] No hardcoded secrets
- [ ] Keys stored in secure vault
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error messages don't leak info
- [ ] Audit logging enabled
- [ ] Access control implemented
- [ ] Password policy enforced
- [ ] Salt rounds configured properly
- [ ] Unique IVs for each encryption
- [ ] Key rotation strategy defined
- [ ] Backup and recovery plan

### Regular Maintenance

- [ ] Rotate keys periodically
- [ ] Review audit logs
- [ ] Update dependencies
- [ ] Security vulnerability scans
- [ ] Penetration testing
- [ ] Review access controls

## Common Vulnerabilities

### 1. Key Reuse

```typescript
// ❌ VULNERABLE
const staticKey = 'abc123...';
encrypt(data1, staticKey);
encrypt(data2, staticKey);

// ✅ SECURE
const key1 = generateKey();
const key2 = generateKey();
```

### 2. IV Reuse

```typescript
// ❌ VULNERABLE
const iv = generateIv();
encrypt(data1, key, iv);
encrypt(data2, key, iv); // Same IV!

// ✅ SECURE
encrypt(data1, key, generateIv());
encrypt(data2, key, generateIv());
```

### 3. Weak Salt Rounds

```typescript
// ❌ VULNERABLE
bcrypt.hash(password, 4); // Too weak

// ✅ SECURE
bcrypt.hash(password, 12); // Strong
```

### 4. Information Leakage

```typescript
// ❌ VULNERABLE
console.log('Decrypted:', decryptedData);
logger.info('Key:', key);

// ✅ SECURE
logger.info('Decryption successful');
// Never log sensitive data
```

## Testing Security

```typescript
describe('Security Tests', () => {
  it('should not expose keys in errors', () => {
    expect(() => service.decrypt('invalid', key, iv))
      .toThrowError('Decryption failed');

    // Error should not contain key
  });

  it('should generate unique IVs', () => {
    const iv1 = service.generateIv();
    const iv2 = service.generateIv();
    expect(iv1).not.toEqual(iv2);
  });

  it('should enforce minimum salt rounds', () => {
    expect(() => service.hash('password', 4))
      .toThrowError('Invalid salt rounds');
  });
});
```

## Resources

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## See Also

- [Getting Started](/guide/getting-started)
- [Configuration](/guide/configuration)
- [BcryptService API](/api/bcrypt-service)
- [AesService API](/api/aes-service)
