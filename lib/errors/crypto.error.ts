/**
 * Base error class for all crypto-related errors
 */
export class CryptoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'CryptoError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends CryptoError {
  constructor(message: string, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown during encryption operations
 */
export class EncryptionError extends CryptoError {
  constructor(message: string, cause?: Error) {
    super(message, 'ENCRYPTION_ERROR', cause);
    this.name = 'EncryptionError';
  }
}

/**
 * Error thrown during decryption operations
 */
export class DecryptionError extends CryptoError {
  constructor(message: string, cause?: Error) {
    super(message, 'DECRYPTION_ERROR', cause);
    this.name = 'DecryptionError';
  }
}

/**
 * Error thrown during hashing operations
 */
export class HashingError extends CryptoError {
  constructor(message: string, cause?: Error) {
    super(message, 'HASHING_ERROR', cause);
    this.name = 'HashingError';
  }
}

/**
 * Error thrown when invalid key or IV is provided
 */
export class InvalidKeyError extends CryptoError {
  constructor(message: string, cause?: Error) {
    super(message, 'INVALID_KEY_ERROR', cause);
    this.name = 'InvalidKeyError';
  }
}
