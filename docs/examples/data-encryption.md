# Data Encryption Example

This example demonstrates how to implement secure data encryption in a NestJS application using the AES service.

## Use Case

Encrypt sensitive user data (PII, financial data, health records) at rest in your database while maintaining the ability to decrypt when needed.

## Implementation

### 1. Data Encryption Service

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { AesService } from 'nestjs-crypto';

interface EncryptedField {
  encrypted: string;
  iv: string;
  keyVersion: number;
}

@Injectable()
export class DataEncryptionService {
  private readonly logger = new Logger(DataEncryptionService.name);
  private readonly currentKeyVersion = 1;

  constructor(private readonly aesService: AesService) {}

  /**
   * Encrypt a single field value
   */
  encryptField(value: string): EncryptedField {
    try {
      const key = this.getEncryptionKey();
      const { encrypted, iv } = this.aesService.encrypt(value, key);

      return {
        encrypted,
        iv,
        keyVersion: this.currentKeyVersion,
      };
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt a single field value
   */
  decryptField(field: EncryptedField): string {
    try {
      const key = this.getEncryptionKey(field.keyVersion);
      return this.aesService.decrypt(field.encrypted, key, field.iv);
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encrypt multiple fields in an object
   */
  encryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[],
  ): Partial<T> {
    const encrypted: any = { ...data };

    for (const field of fieldsToEncrypt) {
      if (data[field] !== undefined && data[field] !== null) {
        encrypted[field] = this.encryptField(String(data[field]));
      }
    }

    return encrypted;
  }

  /**
   * Decrypt multiple fields in an object
   */
  decryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToDecrypt: (keyof T)[],
  ): Partial<T> {
    const decrypted: any = { ...data };

    for (const field of fieldsToDecrypt) {
      if (data[field] && typeof data[field] === 'object') {
        decrypted[field] = this.decryptField(data[field] as EncryptedField);
      }
    }

    return decrypted;
  }

  /**
   * Get encryption key based on version
   */
  private getEncryptionKey(version: number = this.currentKeyVersion): string {
    // In production, retrieve from AWS KMS, Azure Key Vault, etc.
    const keyMap: Record<number, string> = {
      1: process.env.AES_KEY_V1!,
      2: process.env.AES_KEY_V2!,
    };

    const key = keyMap[version];
    if (!key) {
      throw new Error(`Encryption key version ${version} not found`);
    }

    return key;
  }
}
```

### 2. User Entity with Encrypted Fields

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

interface EncryptedField {
  encrypted: string;
  iv: string;
  keyVersion: number;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string; // Hashed with bcrypt

  // Encrypted fields stored as JSON
  @Column('jsonb')
  encryptedSsn: EncryptedField;

  @Column('jsonb', { nullable: true })
  encryptedPhone: EncryptedField | null;

  @Column('jsonb', { nullable: true })
  encryptedAddress: EncryptedField | null;

  @Column('jsonb', { nullable: true })
  encryptedCreditCard: EncryptedField | null;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual properties for decrypted values
  ssn?: string;
  phone?: string;
  address?: string;
  creditCard?: string;
}
```

### 3. User Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { DataEncryptionService } from '../encryption/data-encryption.service';
import { BcryptService } from 'nestjs-crypto';

interface CreateUserDto {
  email: string;
  password: string;
  ssn: string;
  phone?: string;
  address?: string;
  creditCard?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly encryptionService: DataEncryptionService,
    private readonly bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // Hash password with bcrypt
    const password = await this.bcryptService.hash(dto.password);

    // Encrypt sensitive fields
    const encryptedSsn = this.encryptionService.encryptField(dto.ssn);
    const encryptedPhone = dto.phone
      ? this.encryptionService.encryptField(dto.phone)
      : null;
    const encryptedAddress = dto.address
      ? this.encryptionService.encryptField(dto.address)
      : null;
    const encryptedCreditCard = dto.creditCard
      ? this.encryptionService.encryptField(dto.creditCard)
      : null;

    // Create user entity
    const user = this.userRepository.create({
      email: dto.email,
      password,
      encryptedSsn,
      encryptedPhone,
      encryptedAddress,
      encryptedCreditCard,
    });

    return this.userRepository.save(user);
  }

  async findById(id: string, decrypt = false): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    if (decrypt) {
      return this.decryptUser(user);
    }

    return user;
  }

  async updateSensitiveData(
    userId: string,
    data: {
      phone?: string;
      address?: string;
      creditCard?: string;
    },
  ): Promise<User> {
    const user = await this.findById(userId);

    if (data.phone) {
      user.encryptedPhone = this.encryptionService.encryptField(data.phone);
    }

    if (data.address) {
      user.encryptedAddress = this.encryptionService.encryptField(data.address);
    }

    if (data.creditCard) {
      user.encryptedCreditCard = this.encryptionService.encryptField(
        data.creditCard,
      );
    }

    return this.userRepository.save(user);
  }

  /**
   * Decrypt all encrypted fields in a user
   */
  private decryptUser(user: User): User {
    return {
      ...user,
      ssn: this.encryptionService.decryptField(user.encryptedSsn),
      phone: user.encryptedPhone
        ? this.encryptionService.decryptField(user.encryptedPhone)
        : undefined,
      address: user.encryptedAddress
        ? this.encryptionService.decryptField(user.encryptedAddress)
        : undefined,
      creditCard: user.encryptedCreditCard
        ? this.encryptionService.decryptField(user.encryptedCreditCard)
        : undefined,
    };
  }

  /**
   * Re-encrypt data with a new key version (for key rotation)
   */
  async rotateEncryptionKeys(): Promise<void> {
    const users = await this.userRepository.find();

    for (const user of users) {
      // Decrypt with old key
      const decrypted = this.decryptUser(user);

      // Re-encrypt with new key
      user.encryptedSsn = this.encryptionService.encryptField(decrypted.ssn!);

      if (decrypted.phone) {
        user.encryptedPhone = this.encryptionService.encryptField(decrypted.phone);
      }

      if (decrypted.address) {
        user.encryptedAddress = this.encryptionService.encryptField(
          decrypted.address,
        );
      }

      if (decrypted.creditCard) {
        user.encryptedCreditCard = this.encryptionService.encryptField(
          decrypted.creditCard,
        );
      }

      await this.userRepository.save(user);
    }
  }
}
```

### 4. User Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from 'nestjs-crypto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DataEncryptionService } from '../encryption/data-encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CryptoModule.forRoot({
      bcrypt: { saltRounds: 10 },
    }),
  ],
  providers: [UserService, DataEncryptionService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
```

### 5. User Controller

```typescript
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);

    // Don't return encrypted fields
    const { encryptedSsn, encryptedPhone, encryptedAddress, encryptedCreditCard, ...safeUser } = user;

    return {
      message: 'User registered successfully',
      user: safeUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // Return decrypted data only for authenticated user
    return this.userService.findById(req.user.id, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/sensitive')
  async updateSensitiveData(
    @Request() req,
    @Body() data: { phone?: string; address?: string; creditCard?: string },
  ) {
    const user = await this.userService.updateSensitiveData(req.user.id, data);

    return {
      message: 'Sensitive data updated successfully',
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: any) {
    const { encryptedSsn, encryptedPhone, encryptedAddress, encryptedCreditCard, ...safe } = user;
    return safe;
  }
}
```

## Testing

```typescript
import { Test } from '@nestjs/testing';
import { AesService } from 'nestjs-crypto';
import { DataEncryptionService } from './data-encryption.service';

describe('DataEncryptionService', () => {
  let service: DataEncryptionService;
  let aesService: AesService;

  beforeEach(async () => {
    process.env.AES_KEY_V1 = 'a'.repeat(64); // 64 hex characters

    const module = await Test.createTestingModule({
      providers: [DataEncryptionService, AesService],
    }).compile();

    service = module.get<DataEncryptionService>(DataEncryptionService);
    aesService = module.get<AesService>(AesService);
  });

  describe('encryptField', () => {
    it('should encrypt a field value', () => {
      const value = '123-45-6789';
      const encrypted = service.encryptField(value);

      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.keyVersion).toBe(1);
    });

    it('should produce different ciphertexts for same value', () => {
      const value = '123-45-6789';
      const encrypted1 = service.encryptField(value);
      const encrypted2 = service.encryptField(value);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe('decryptField', () => {
    it('should decrypt an encrypted field', () => {
      const value = '123-45-6789';
      const encrypted = service.encryptField(value);
      const decrypted = service.decryptField(encrypted);

      expect(decrypted).toBe(value);
    });
  });

  describe('encryptFields', () => {
    it('should encrypt multiple fields in an object', () => {
      const data = {
        id: '123',
        ssn: '123-45-6789',
        phone: '555-1234',
        email: 'user@example.com',
      };

      const encrypted = service.encryptFields(data, ['ssn', 'phone']);

      expect(encrypted.id).toBe('123');
      expect(encrypted.email).toBe('user@example.com');
      expect(typeof encrypted.ssn).toBe('object');
      expect(typeof encrypted.phone).toBe('object');
    });
  });

  describe('decryptFields', () => {
    it('should decrypt multiple encrypted fields', () => {
      const data = {
        id: '123',
        ssn: '123-45-6789',
        phone: '555-1234',
        email: 'user@example.com',
      };

      const encrypted = service.encryptFields(data, ['ssn', 'phone']);
      const decrypted = service.decryptFields(encrypted, ['ssn', 'phone']);

      expect(decrypted.ssn).toBe('123-45-6789');
      expect(decrypted.phone).toBe('555-1234');
    });
  });
});
```

## Environment Configuration

```bash
# .env
AES_KEY_V1=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
AES_KEY_V2=fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
```

## Key Rotation Strategy

```typescript
@Injectable()
export class KeyRotationService {
  constructor(
    private readonly userService: UserService,
    private readonly encryptionService: DataEncryptionService,
  ) {}

  /**
   * Rotate encryption keys for all users
   * Run this as a scheduled task or manual operation
   */
  async rotateKeys(): Promise<void> {
    await this.userService.rotateEncryptionKeys();

    // Update current key version in environment/config
    // This ensures new data uses the new key
  }
}
```

## Best Practices

### ✅ Do

- **Store keys in KMS** (AWS KMS, Azure Key Vault, HashiCorp Vault)
- **Use different IVs** for each encryption operation
- **Implement key rotation** with version tracking
- **Encrypt at application layer** before saving to database
- **Use JSONB columns** for encrypted field storage (PostgreSQL)
- **Log access** to sensitive data (audit trail)
- **Sanitize responses** - never return encrypted fields to clients
- **Use authentication** before allowing decryption
- **Validate input** before encryption

### ❌ Don't

- **Store keys in code** or version control
- **Reuse IVs** with the same key
- **Return encrypted data** in API responses
- **Allow unauthenticated decryption**
- **Encrypt searchable fields** (consider tokenization instead)
- **Log decrypted values**
- **Share keys** between environments

## Performance Considerations

```typescript
// Bad: Decrypt all users in a list
async getAllUsers(): Promise<User[]> {
  const users = await this.userRepository.find();
  return users.map(user => this.decryptUser(user)); // Slow!
}

// Good: Only decrypt when needed
async getAllUsers(): Promise<User[]> {
  // Return without decryption for list views
  return this.userRepository.find({
    select: ['id', 'email', 'createdAt'], // Don't select encrypted fields
  });
}

// Good: Decrypt single user
async getUser(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });
  return this.decryptUser(user);
}
```

## Compliance Considerations

- **GDPR**: Right to be forgotten - ensure encrypted data can be deleted
- **HIPAA**: Encrypt PHI (Protected Health Information)
- **PCI DSS**: Encrypt credit card data, implement key rotation
- **SOC 2**: Document encryption practices and key management

## See Also

- [AesService API](/api/aes-service)
- [Security Best Practices](/guide/security)
- [Authentication Example](/examples/authentication)
- [File Encryption Example](/examples/file-encryption)
