import { Test, TestingModule } from '@nestjs/testing';
import { AesService } from '../aes.service';
import { DecryptionError, InvalidKeyError } from '../../errors';

describe('AesService', () => {
  let service: AesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AesService],
    }).compile();
    service = module.get<AesService>(AesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateKey', () => {
    it('should generate a 32-byte key', () => {
      const key = service.generateKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should generate different keys each time', () => {
      const key1 = service.generateKey();
      const key2 = service.generateKey();
      expect(key1).not.toEqual(key2);
    });
  });

  describe('generateIv', () => {
    it('should generate a 16-byte IV', () => {
      const iv = service.generateIv();
      expect(iv).toBeInstanceOf(Buffer);
      expect(iv.length).toBe(16);
    });

    it('should generate different IVs each time', () => {
      const iv1 = service.generateIv();
      const iv2 = service.generateIv();
      expect(iv1).not.toEqual(iv2);
    });
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      const data = 'Hello, World!';
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key, iv);
      expect(result).toBeDefined();
      expect(result.encrypted).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(typeof result.encrypted).toBe('string');
      expect(result.encrypted.length).toBeGreaterThan(0);
    });

    it('should throw error for empty string', () => {
      const key = service.generateKey();
      const iv = service.generateIv();

      expect(() => service.encrypt('', key, iv)).toThrow();
    });

    it('should throw InvalidKeyError for invalid key length', () => {
      const data = 'test';
      const shortKey = Buffer.from('tooshort');
      const iv = service.generateIv();

      expect(() => service.encrypt(data, shortKey, iv)).toThrow(
        InvalidKeyError,
      );
    });

    it('should throw InvalidKeyError for invalid IV length', () => {
      const data = 'test';
      const key = service.generateKey();
      const shortIv = Buffer.from('short');

      expect(() => service.encrypt(data, key, shortIv)).toThrow(
        InvalidKeyError,
      );
    });

    it('should accept hex string key and IV', () => {
      const data = 'test';
      const key = service.generateKey().toString('hex');
      const iv = service.generateIv().toString('hex');

      const result = service.encrypt(data, key, iv);
      expect(result.encrypted).toBeDefined();
    });

    it('should generate key and IV if not provided', () => {
      const data = 'test';
      const result = service.encrypt(data);

      expect(result.encrypted).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.key.length).toBe(64); // hex string of 32 bytes
      expect(result.iv.length).toBe(32); // hex string of 16 bytes
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data successfully', () => {
      const originalData = 'Hello, World!';
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(originalData, key, iv);
      const decrypted = service.decrypt(
        result.encrypted,
        result.key,
        result.iv,
      );

      expect(decrypted).toBe(originalData);
    });

    it('should handle special characters', () => {
      const data = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key, iv);
      const decrypted = service.decrypt(
        result.encrypted,
        result.key,
        result.iv,
      );

      expect(decrypted).toBe(data);
    });

    it('should handle unicode characters', () => {
      const data = '你好世界 🌍 مرحبا بالعالم';
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key, iv);
      const decrypted = service.decrypt(
        result.encrypted,
        result.key,
        result.iv,
      );

      expect(decrypted).toBe(data);
    });

    it('should throw error for empty encrypted data', () => {
      const keyHex = service.generateKey().toString('hex');
      const ivHex = service.generateIv().toString('hex');

      expect(() => service.decrypt('', keyHex, ivHex)).toThrow();
    });

    it('should throw error for invalid encrypted data format', () => {
      const keyHex = service.generateKey().toString('hex');
      const ivHex = service.generateIv().toString('hex');

      expect(() => service.decrypt('not-valid-hex', keyHex, ivHex)).toThrow();
    });

    it('should throw DecryptionError for wrong key', () => {
      const data = 'test';
      const key1 = service.generateKey();
      const key2 = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key1, iv);

      expect(() =>
        service.decrypt(result.encrypted, key2.toString('hex'), result.iv),
      ).toThrow(DecryptionError);
    });

    it('should throw DecryptionError for wrong IV', () => {
      const data = 'test';
      const key = service.generateKey();
      const iv1 = service.generateIv();
      const iv2 = service.generateIv();

      const result = service.encrypt(data, key, iv1);

      expect(() =>
        service.decrypt(result.encrypted, result.key, iv2.toString('hex')),
      ).toThrow(DecryptionError);
    });
  });

  describe('integration tests', () => {
    it('should handle complete encrypt/decrypt workflow', () => {
      const data = 'Sensitive Information';
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key, iv);
      expect(result.encrypted).not.toBe(data);

      const decrypted = service.decrypt(
        result.encrypted,
        result.key,
        result.iv,
      );
      expect(decrypted).toBe(data);
    });

    it('should handle long strings', () => {
      const data = 'a'.repeat(10000);
      const key = service.generateKey();
      const iv = service.generateIv();

      const result = service.encrypt(data, key, iv);
      const decrypted = service.decrypt(
        result.encrypted,
        result.key,
        result.iv,
      );

      expect(decrypted).toBe(data);
    });

    it('should produce different ciphertexts with different IVs', () => {
      const data = 'test';
      const key = service.generateKey();
      const iv1 = service.generateIv();
      const iv2 = service.generateIv();

      const result1 = service.encrypt(data, key, iv1);
      const result2 = service.encrypt(data, key, iv2);

      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should work with hex string keys and IVs', () => {
      const data = 'test';
      const key = service.generateKey();
      const iv = service.generateIv();

      const keyHex = key.toString('hex');
      const ivHex = iv.toString('hex');

      const result = service.encrypt(data, keyHex, ivHex);
      const decrypted = service.decrypt(result.encrypted, keyHex, ivHex);

      expect(decrypted).toBe(data);
    });
  });
});
