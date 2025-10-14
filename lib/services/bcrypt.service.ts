import { Injectable } from '@nestjs/common';
import { logger } from '../utils';
import {
  validateNonEmptyString,
  validateIntegerInRange,
  validateBcryptHash,
} from '../utils/validation';
import { HashingError, ValidationError } from '../errors';
import { Logger } from 'pino';

@Injectable()
export class BcryptService {
  private readonly logger: Logger = logger;
  private readonly minSaltRounds = 4;
  private readonly maxSaltRounds = 31;
  private readonly recommendedSaltRounds = 12;

  /**
   * Hashes data using bcrypt
   * @param data - The data to hash (must be non-empty string)
   * @param saltRounds - The number of salt rounds to use (4-31, recommended: 12)
   * @returns The hashed data in bcrypt format
   * @throws {ValidationError} If inputs are invalid
   * @throws {HashingError} If hashing fails
   */
  public async hash(data: string, saltRounds: number): Promise<string> {
    try {
      // Validate inputs
      validateNonEmptyString(data, 'data');
      validateIntegerInRange(
        saltRounds,
        'saltRounds',
        this.minSaltRounds,
        this.maxSaltRounds,
      );

      // Warn if salt rounds are too low
      if (saltRounds < this.recommendedSaltRounds) {
        this.logger.warn(
          { saltRounds, recommended: this.recommendedSaltRounds },
          'Salt rounds below recommended value',
        );
      }

      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash(data, saltRounds);

      this.logger.debug({ saltRounds }, 'Generated bcrypt hash');

      return hash;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Hashing failed');
      throw new HashingError('Failed to hash data', error as Error);
    }
  }

  /**
   * Synchronous hashing using bcrypt
   * @param data - The data to hash (must be non-empty string)
   * @param saltRounds - The number of salt rounds to use (4-31, recommended: 12)
   * @returns The hashed data in bcrypt format
   * @throws {ValidationError} If inputs are invalid
   * @throws {HashingError} If hashing fails
   */
  public async hashSync(data: string, saltRounds: number): Promise<string> {
    try {
      validateNonEmptyString(data, 'data');
      validateIntegerInRange(
        saltRounds,
        'saltRounds',
        this.minSaltRounds,
        this.maxSaltRounds,
      );

      const bcrypt = await import('bcrypt');
      const hash = bcrypt.hashSync(data, saltRounds);

      this.logger.debug({ saltRounds }, 'Generated bcrypt hash (sync)');

      return hash;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Synchronous hashing failed');
      throw new HashingError(
        'Failed to hash data synchronously',
        error as Error,
      );
    }
  }

  /**
   * Compares data with a bcrypt hash
   * @param data - The data to compare (must be non-empty string)
   * @param encrypted - The bcrypt hash to compare against
   * @returns Boolean indicating if the data matches the hash
   * @throws {ValidationError} If inputs are invalid
   * @throws {HashingError} If comparison fails
   */
  public async compare(data: string, encrypted: string): Promise<boolean> {
    try {
      // Validate inputs
      validateNonEmptyString(data, 'data');
      validateBcryptHash(encrypted);

      const bcrypt = await import('bcrypt');
      const isMatch = await bcrypt.compare(data, encrypted);

      this.logger.debug({ isMatch }, 'Bcrypt compare result');

      return isMatch;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Comparison failed');
      throw new HashingError(
        'Failed to compare data with hash',
        error as Error,
      );
    }
  }

  /**
   * Synchronous comparison using bcrypt
   * @param data - The data to compare (must be non-empty string)
   * @param encrypted - The bcrypt hash to compare against
   * @returns Boolean indicating if the data matches the hash
   * @throws {ValidationError} If inputs are invalid
   * @throws {HashingError} If comparison fails
   */
  public async compareSync(data: string, encrypted: string): Promise<boolean> {
    try {
      validateNonEmptyString(data, 'data');
      validateBcryptHash(encrypted);

      const bcrypt = await import('bcrypt');
      const isMatch = bcrypt.compareSync(data, encrypted);

      this.logger.debug({ isMatch }, 'Bcrypt compare result (sync)');

      return isMatch;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Synchronous comparison failed');
      throw new HashingError(
        'Failed to compare data with hash synchronously',
        error as Error,
      );
    }
  }

  /**
   * Generates a bcrypt salt
   * @param saltRounds - The number of salt rounds to use (4-31, recommended: 12)
   * @returns The generated salt
   * @throws {ValidationError} If saltRounds is invalid
   * @throws {HashingError} If salt generation fails
   */
  public async genSalt(saltRounds: number): Promise<string> {
    try {
      validateIntegerInRange(
        saltRounds,
        'saltRounds',
        this.minSaltRounds,
        this.maxSaltRounds,
      );

      const bcrypt = await import('bcrypt');
      const salt = await bcrypt.genSalt(saltRounds);

      this.logger.debug({ saltRounds }, 'Generated bcrypt salt');

      return salt;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Salt generation failed');
      throw new HashingError('Failed to generate salt', error as Error);
    }
  }

  /**
   * Gets the number of salt rounds from a bcrypt hash
   * @param encrypted - The bcrypt hash
   * @returns The number of salt rounds used to generate the hash
   * @throws {ValidationError} If hash is invalid
   * @throws {HashingError} If extraction fails
   */
  public async getSaltRounds(encrypted: string): Promise<number> {
    try {
      validateBcryptHash(encrypted);

      const bcrypt = await import('bcrypt');
      const saltRounds = bcrypt.getRounds(encrypted);

      this.logger.debug({ saltRounds }, 'Bcrypt salt rounds extracted');

      return saltRounds;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof HashingError) {
        throw error;
      }
      this.logger.error({ error }, 'Failed to extract salt rounds');
      throw new HashingError(
        'Failed to get salt rounds from hash',
        error as Error,
      );
    }
  }
}
