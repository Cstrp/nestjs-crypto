# Troubleshooting

Common issues and solutions when using NestJS Crypto.

## Installation Issues

### Bcrypt Installation Fails

**Problem:** `npm install bcrypt` fails with build errors.

**Solution:**

```bash
# Install build tools
# Ubuntu/Debian
sudo apt-get install build-essential python3

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools

# Then reinstall
npm install bcrypt
```

### Module Not Found

**Problem:** `Cannot find module 'nestjs-crypto'`

**Solution:**

```bash
# Ensure package is installed
npm install nestjs-crypto

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Configuration Issues

### Module Not Registered

**Problem:** `Nest can't resolve dependencies of the BcryptService`

**Solution:**

```typescript
// Ensure CryptoModule is imported
@Module({
  imports: [
    CryptoModule.forRoot({
      bcrypt: { saltRounds: 10 },
    }),
  ],
})
export class AppModule {}
```

### Services Not Available

**Problem:** Services are undefined when injected

**Solution:**

```typescript
// Import CryptoModule in your feature module
@Module({
  imports: [CryptoModule], // Add this
  providers: [YourService],
})
export class FeatureModule {}
```

## Bcrypt Issues

### Hash Validation Fails

**Problem:** `compare()` always returns false

**Solutions:**

```typescript
// 1. Check for string encoding issues
const password = 'password'.trim();
const hash = await bcryptService.hash(password);

// 2. Ensure comparing against correct hash
const isValid = await bcryptService.compare(
  password,
  user.password // Make sure this is the hash, not plain text
);

// 3. Check for bcrypt version compatibility
// If hash was created with bcrypt v4, it may not work with v5
```

### Performance Issues

**Problem:** Hashing takes too long

**Solution:**

```typescript
// Reduce salt rounds for development
const isDev = process.env.NODE_ENV === 'development';

CryptoModule.forRoot({
  bcrypt: {
    saltRounds: isDev ? 10 : 12,
  },
})
```

### ValidationError on Empty String

**Problem:** Getting validation errors

**Solution:**

```typescript
// Check input before hashing
if (!password || password.trim() === '') {
  throw new BadRequestException('Password is required');
}

const hash = await bcryptService.hash(password);
```

## AES Issues

### Decryption Fails

**Problem:** `DecryptionError: bad decrypt`

**Common Causes:**

1. **Wrong key or IV:**
```typescript
// Ensure you're using the same key/IV used for encryption
const { encrypted, key, iv } = aesService.encrypt(data);
const decrypted = aesService.decrypt(encrypted, key, iv); // ✓
```

2. **Key/IV format mismatch:**
```typescript
// If key is Buffer, convert to hex string
const keyHex = key.toString('hex');
const ivHex = iv.toString('hex');
const decrypted = aesService.decrypt(encrypted, keyHex, ivHex);
```

3. **Corrupted encrypted data:**
```typescript
// Verify data wasn't modified
console.log('Encrypted length:', encrypted.length); // Should be hex string
```

### InvalidKeyError

**Problem:** Invalid key or IV length

**Solution:**

```typescript
// Key must be 32 bytes (64 hex chars)
const key = aesService.generateKey().toString('hex');
console.log(key.length); // 64

// IV must be 16 bytes (32 hex chars)
const iv = aesService.generateIv().toString('hex');
console.log(iv.length); // 32

// Or let the service generate them
const result = aesService.encrypt(data); // Auto-generates key & IV
```

### Empty String Error

**Problem:** Cannot encrypt empty strings

**Solution:**

```typescript
// Validate before encrypting
if (!data || data.trim() === '') {
  throw new BadRequestException('Data cannot be empty');
}

const result = aesService.encrypt(data);
```

## TypeScript Issues

### Type Errors

**Problem:** TypeScript can't find types

**Solution:**

```bash
# Ensure types are installed
npm install --save-dev @types/bcrypt

# Check tsconfig.json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

### Import Errors

**Problem:** Cannot import services

**Solution:**

```typescript
// Use named imports
import { BcryptService, AesService } from 'nestjs-crypto';

// Not default imports
// import CryptoModule from 'nestjs-crypto'; // ✗
```

## Runtime Issues

### Memory Leaks

**Problem:** Memory usage increases over time

**Solution:**

```typescript
// Don't store keys in memory unnecessarily
// ❌ BAD
class BadService {
  private keys: Buffer[] = [];

  encrypt(data: string) {
    const key = this.aesService.generateKey();
    this.keys.push(key); // Memory leak!
    // ...
  }
}

// ✅ GOOD
class GoodService {
  encrypt(data: string) {
    const key = this.getKeyFromVault(); // Get from secure storage
    // Use and discard
  }
}
```

### Performance Degradation

**Problem:** Encryption/decryption becomes slower

**Solutions:**

1. **Use batch operations:**
```typescript
// Instead of encrypting one at a time
const results = await Promise.all(
  items.map(item => aesService.encrypt(item))
);
```

2. **Cache keys:**
```typescript
@Injectable()
export class CacheService {
  private keyCache = new Map<string, string>();

  getKey(version: number): string {
    const cached = this.keyCache.get(`v${version}`);
    if (cached) return cached;

    const key = this.loadKeyFromVault(version);
    this.keyCache.set(`v${version}`, key);
    return key;
  }
}
```

## Testing Issues

### Tests Fail with Timeout

**Problem:** Bcrypt tests timeout

**Solution:**

```typescript
// Increase timeout for bcrypt tests
describe('BcryptService', () => {
  jest.setTimeout(10000); // 10 seconds

  it('should hash password', async () => {
    const hash = await bcryptService.hash('password');
    expect(hash).toBeDefined();
  }, 10000); // Per-test timeout
});
```

### Mock Services

**Problem:** Need to mock services in tests

**Solution:**

```typescript
const mockBcryptService = {
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
};

const module = await Test.createTestingModule({
  providers: [
    {
      provide: BcryptService,
      useValue: mockBcryptService,
    },
  ],
}).compile();
```

## Environment Issues

### Environment Variables Not Loading

**Problem:** Keys from env vars are undefined

**Solution:**

```typescript
// Use ConfigModule
@Module({
  imports: [
    ConfigModule.forRoot(),
    CryptoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        bcrypt: {
          saltRounds: config.get('BCRYPT_SALT_ROUNDS', 10),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
```

### Docker Environment

**Problem:** Module doesn't work in Docker

**Solution:**

```dockerfile
# Install build dependencies in Dockerfile
FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]
```

## Error Messages

### "Nest can't resolve dependencies"

```
Error: Nest can't resolve dependencies of the BcryptService (?).
```

**Solution:** Import CryptoModule in your module.

### "ValidationError: Cannot hash empty string"

**Solution:** Validate input before calling hash():

```typescript
if (!password) {
  throw new BadRequestException('Password required');
}
```

### "EncryptionError: Key generation failed"

**Solution:** Ensure Node.js crypto module is available:

```typescript
const crypto = require('crypto');
console.log(crypto.randomBytes(32)); // Should work
```

## Getting Help

If you're still experiencing issues:

1. **Check the docs:** [Documentation](https://cstrp.github.io/nestjs-crypto/)
2. **Search issues:** [GitHub Issues](https://github.com/Cstrp/nestjs-crypto/issues)
3. **Ask for help:** Open a new issue with:
   - Node.js version
   - Package versions
   - Error messages
   - Minimal reproduction code

## See Also

- [Getting Started](/guide/getting-started)
- [Configuration](/guide/configuration)
- [Security Best Practices](/guide/security)
