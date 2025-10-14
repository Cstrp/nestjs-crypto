import { ValidationError, InvalidKeyError } from '../errors';

/**
 * Validates that a value is a non-empty string
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string,
): asserts value is string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string, received ${typeof value}`,
    );
  }
  if (value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates that a value is a positive number
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
): asserts value is number {
  if (typeof value !== 'number') {
    throw new ValidationError(
      `${fieldName} must be a number, received ${typeof value}`,
    );
  }
  if (!Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a finite number`);
  }
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`);
  }
}

/**
 * Validates that a value is a valid integer within range
 */
export function validateIntegerInRange(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
): asserts value is number {
  validatePositiveNumber(value, fieldName);
  if (!Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}, received ${value}`,
    );
  }
}

/**
 * Validates a Buffer or converts hex string to Buffer
 */
export function validateAndConvertToBuffer(
  value: Buffer | string | undefined,
  fieldName: string,
  expectedLength?: number,
): Buffer | undefined {
  if (value === undefined) {
    return undefined;
  }

  let buffer: Buffer;

  if (Buffer.isBuffer(value)) {
    buffer = value;
  } else if (typeof value === 'string') {
    // Validate hex string
    if (!/^[0-9a-fA-F]*$/.test(value)) {
      throw new InvalidKeyError(
        `${fieldName} must be a valid hexadecimal string`,
      );
    }
    if (value.length % 2 !== 0) {
      throw new InvalidKeyError(
        `${fieldName} hex string must have even length`,
      );
    }
    buffer = Buffer.from(value, 'hex');
  } else {
    throw new ValidationError(
      `${fieldName} must be a Buffer or hex string, received ${typeof value}`,
    );
  }

  if (expectedLength !== undefined && buffer.length !== expectedLength) {
    throw new InvalidKeyError(
      `${fieldName} must be ${expectedLength} bytes, received ${buffer.length} bytes`,
    );
  }

  return buffer;
}

/**
 * Validates bcrypt hash format
 */
export function validateBcryptHash(hash: unknown): asserts hash is string {
  validateNonEmptyString(hash, 'hash');

  // Bcrypt hash format: $2a$, $2b$, or $2y$ followed by cost and salt+hash
  const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

  if (!bcryptRegex.test(hash)) {
    throw new ValidationError(
      'Invalid bcrypt hash format. Expected format: $2a$10$...',
    );
  }
}

/**
 * Validates AES encrypted data format
 */
export function validateEncryptedData(data: unknown): asserts data is string {
  validateNonEmptyString(data, 'encrypted data');

  // Should be valid hex string
  if (!/^[0-9a-fA-F]+$/.test(data)) {
    throw new ValidationError(
      'Encrypted data must be a valid hexadecimal string',
    );
  }
}
