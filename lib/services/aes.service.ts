import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '../utils';
import { Logger } from 'pino';

@Injectable()
export class AesService {
  private readonly logger: Logger = logger;
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  /**
   * Generates a random AES key
   */
  public generateKey(): Buffer {
    return randomBytes(this.keyLength);
  }

  /**
   * Generates a random initialization vector
   */
  public generateIv(): Buffer {
    return randomBytes(this.ivLength);
  }

  /**
   * Encrypts data using AES
   * @param data - The data to encrypt
   * @param key - The encryption key (will generate if not provided)
   * @param iv - The initialization vector (will generate if not provided)
   * @returns Object containing encrypted data, key, and iv
   */
  public encrypt(
    data: string,
    key?: Buffer | string,
    iv?: Buffer | string,
  ): { encrypted: string; key: string; iv: string } {
    const encryptionKey = key
      ? typeof key === 'string'
        ? Buffer.from(key, 'hex')
        : key
      : this.generateKey();
    const initializationVector = iv
      ? typeof iv === 'string'
        ? Buffer.from(iv, 'hex')
        : iv
      : this.generateIv();

    const cipher = createCipheriv(
      this.algorithm,
      encryptionKey,
      initializationVector,
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    this.logger.debug('Data encrypted with AES');

    return {
      encrypted,
      key: encryptionKey.toString('hex'),
      iv: initializationVector.toString('hex'),
    };
  }

  /**
   * Decrypts data using AES
   * @param encryptedData - The encrypted data
   * @param key - The encryption key
   * @param iv - The initialization vector
   * @returns The decrypted data
   */
  public decrypt(encryptedData: string, key: string, iv: string): string {
    const decryptionKey = Buffer.from(key, 'hex');
    const initializationVector = Buffer.from(iv, 'hex');

    const decipher = createDecipheriv(
      this.algorithm,
      decryptionKey,
      initializationVector,
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    this.logger.debug('Data decrypted with AES');

    return decrypted;
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
