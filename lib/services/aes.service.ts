import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '../utils';
import {
  validateNonEmptyString,
  validateAndConvertToBuffer,
  validateEncryptedData,
} from '../utils/validation';
import { EncryptionError, DecryptionError, InvalidKeyError } from '../errors';
import { Logger } from 'pino';

@Injectable()
export class AesService {
  private readonly logger: Logger = logger;
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  /**
   * Generates a random AES key
   * @returns A Buffer containing a cryptographically secure random key
   */
  public generateKey(): Buffer {
    try {
      return randomBytes(this.keyLength);
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate AES key');
      throw new EncryptionError('Failed to generate AES key', error as Error);
    }
  }

  /**
   * Generates a random initialization vector
   * @returns A Buffer containing a cryptographically secure random IV
   */
  public generateIv(): Buffer {
    try {
      return randomBytes(this.ivLength);
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate IV');
      throw new EncryptionError(
        'Failed to generate initialization vector',
        error as Error,
      );
    }
  }

  /**
   * Encrypts data using AES-256-CBC
   * @param data - The data to encrypt (must be non-empty string)
   * @param key - The encryption key (32 bytes / 64 hex chars, will generate if not provided)
   * @param iv - The initialization vector (16 bytes / 32 hex chars, will generate if not provided)
   * @returns Object containing encrypted data, key, and iv as hex strings
   * @throws {ValidationError} If data is invalid
   * @throws {InvalidKeyError} If key or IV format is invalid
   * @throws {EncryptionError} If encryption fails
   */
  public encrypt(
    data: string,
    key?: Buffer | string,
    iv?: Buffer | string,
  ): { encrypted: string; key: string; iv: string } {
    try {
      // Validate input data
      validateNonEmptyString(data, 'data');

      // Validate and convert key
      const encryptionKey = key
        ? validateAndConvertToBuffer(key, 'key', this.keyLength)!
        : this.generateKey();

      // Validate and convert IV
      const initializationVector = iv
        ? validateAndConvertToBuffer(iv, 'IV', this.ivLength)!
        : this.generateIv();

      // Perform encryption
      const cipher = createCipheriv(
        this.algorithm,
        encryptionKey,
        initializationVector,
      );
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      this.logger.debug({ dataLength: data.length }, 'Data encrypted with AES');

      return {
        encrypted,
        key: encryptionKey.toString('hex'),
        iv: initializationVector.toString('hex'),
      };
    } catch (error) {
      if (
        error instanceof InvalidKeyError ||
        error instanceof EncryptionError
      ) {
        throw error;
      }
      this.logger.error({ error }, 'Encryption failed');
      throw new EncryptionError('Failed to encrypt data', error as Error);
    }
  }

  /**
   * Decrypts data using AES-256-CBC
   * @param encryptedData - The encrypted data as hex string
   * @param key - The encryption key (32 bytes / 64 hex chars)
   * @param iv - The initialization vector (16 bytes / 32 hex chars)
   * @returns The decrypted data as string
   * @throws {ValidationError} If inputs are invalid
   * @throws {InvalidKeyError} If key or IV format is invalid
   * @throws {DecryptionError} If decryption fails
   */
  public decrypt(encryptedData: string, key: string, iv: string): string {
    try {
      // Validate inputs
      validateEncryptedData(encryptedData);

      const decryptionKey = validateAndConvertToBuffer(
        key,
        'key',
        this.keyLength,
      )!;
      const initializationVector = validateAndConvertToBuffer(
        iv,
        'IV',
        this.ivLength,
      )!;

      // Perform decryption
      const decipher = createDecipheriv(
        this.algorithm,
        decryptionKey,
        initializationVector,
      );
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      this.logger.debug('Data decrypted with AES');

      return decrypted;
    } catch (error) {
      if (
        error instanceof InvalidKeyError ||
        error instanceof DecryptionError
      ) {
        throw error;
      }
      this.logger.error({ error }, 'Decryption failed');
      throw new DecryptionError(
        'Failed to decrypt data. Ensure the key, IV, and encrypted data are correct.',
        error as Error,
      );
    }
  }

  /**
   * Encrypts data synchronously using AES
   * @param data - The data to encrypt
   * @param key - The encryption key (will generate if not provided)
   * @param iv - The initialization vector (will generate if not provided)
   * @returns Object containing encrypted data, key, and iv
   */
  public encryptSync(
    data: string,
    key?: Buffer | string,
    iv?: Buffer | string,
  ): { encrypted: string; key: string; iv: string } {
    return this.encrypt(data, key, iv);
  }

  /**
   * Decrypts data synchronously using AES
   * @param encryptedData - The encrypted data
   * @param key - The encryption key
   * @param iv - The initialization vector
   * @returns The decrypted data
   */
  public decryptSync(encryptedData: string, key: string, iv: string): string {
    return this.decrypt(encryptedData, key, iv);
  }
}
