# BcryptService API

The `BcryptService` provides methods for secure password hashing using the bcrypt algorithm.

## Methods

### hash()

Hash data using bcrypt with specified salt rounds.

```typescript
async hash(data: string, saltRounds: number): Promise<string>
```

#### Parameters

- `data` (string) - The data to hash (required, non-empty)
- `saltRounds` (number) - Number of salt rounds (4-31, recommended: 12)

#### Returns

`Promise<string>` - The bcrypt hash

#### Throws

- `ValidationError` - If data is empty or saltRounds is invalid
- `HashingError` - If hashing fails

#### Example

```typescript
const password = 'userPassword123';
const hash = await bcryptService.hash(password, 12);
// $2b$12$K3F8...
```

---

### hashSync()

Synchronously hash data using bcrypt.

```typescript
async hashSync(data: string, saltRounds: number): Promise<string>
```

#### Parameters

- `data` (string) - The data to hash
- `saltRounds` (number) - Number of salt rounds (4-31)

#### Returns

`Promise<string>` - The bcrypt hash

#### Example

```typescript
const hash = await bcryptService.hashSync('password', 12);
```

---

### compare()

Compare plain text data with a bcrypt hash.

```typescript
async compare(data: string, encrypted: string): Promise<boolean>
```

#### Parameters

- `data` (string) - Plain text data to compare
- `encrypted` (string) - Bcrypt hash to compare against

#### Returns

`Promise<boolean>` - `true` if data matches hash, `false` otherwise

#### Throws

- `ValidationError` - If inputs are invalid
- `HashingError` - If comparison fails

#### Example

```typescript
const password = 'userPassword123';
const hash = await bcryptService.hash(password, 12);

const isValid = await bcryptService.compare(password, hash);
// true

const isInvalid = await bcryptService.compare('wrongPassword', hash);
// false
```

---

### compareSync()

Synchronously compare data with hash.

```typescript
async compareSync(data: string, encrypted: string): Promise<boolean>
```

#### Parameters

- `data` (string) - Plain text data
- `encrypted` (string) - Bcrypt hash

#### Returns

`Promise<boolean>` - Match result

---

### genSalt()

Generate a bcrypt salt.

```typescript
async genSalt(saltRounds: number): Promise<string>
```

#### Parameters

- `saltRounds` (number) - Number of rounds (4-31)

#### Returns

`Promise<string>` - Generated salt

#### Example

```typescript
const salt = await bcryptService.genSalt(12);
// $2b$12$abc123...
```

---

### getSaltRounds()

Extract the number of salt rounds from a bcrypt hash.

```typescript
async getSaltRounds(encrypted: string): Promise<number>
```

#### Parameters

- `encrypted` (string) - Bcrypt hash

#### Returns

`Promise<number>` - Number of salt rounds used

#### Throws

- `ValidationError` - If hash format is invalid

#### Example

```typescript
const hash = await bcryptService.hash('password', 12);
const rounds = await bcryptService.getSaltRounds(hash);
// 12
```

## Configuration

Configure bcrypt salt rounds in module setup:

```typescript
CryptoModule.forRoot({
  useBcrypt: true,
  bcryptSaltRounds: 12, // Default salt rounds
})
```

## Salt Rounds Guide

| Rounds | Time   | Use Case |
|--------|--------|----------|
| 8      | ~40ms  | Development/Testing |
| 10     | ~150ms | Low security requirements |
| 12     | ~600ms | **Recommended** - Production |
| 14     | ~2.5s  | High security |
| 16     | ~10s   | Maximum security |

## Best Practices

### ✅ Do

- Use 12 salt rounds for production
- Always use async methods in request handlers
- Handle validation errors appropriately
- Store only hashes, never plain passwords

### ❌ Don't

- Use salt rounds below 10 in production
- Use the same salt for all passwords
- Log password hashes
- Compare passwords with `===` (always use `compare()`)

## Error Handling

```typescript
import { ValidationError, HashingError } from 'nestjs-crypto';

try {
  const hash = await bcryptService.hash(password, 12);
} catch (error) {
  if (error instanceof ValidationError) {
    // Invalid input (empty string, invalid salt rounds)
    console.error('Invalid input:', error.message);
  } else if (error instanceof HashingError) {
    // Hashing operation failed
    console.error('Hashing failed:', error.message);
  }
}
```

## Complete Example

```typescript
import { Injectable } from '@nestjs/common';
import { BcryptService } from 'nestjs-crypto';

@Injectable()
export class AuthService {
  constructor(private readonly bcryptService: BcryptService) {}

  async registerUser(email: string, password: string) {
    // Validate password strength first
    if (password.length < 8) {
      throw new Error('Password too short');
    }

    // Hash password
    const hash = await this.bcryptService.hash(password, 12);

    // Store user with hash
    return this.userRepository.create({
      email,
      password: hash, // Store only the hash
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    // Compare provided password with stored hash
    const isValid = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (!isValid) {
      return null;
    }

    return user;
  }

  async checkPasswordStrength(hash: string) {
    const rounds = await this.bcryptService.getSaltRounds(hash);

    if (rounds < 12) {
      console.warn('Password hash uses weak salt rounds');
    }

    return rounds;
  }
}
```

## See Also

- [Getting Started](/guide/getting-started)
- [Security Best Practices](/guide/security)
- [Authentication Example](/examples/authentication)
