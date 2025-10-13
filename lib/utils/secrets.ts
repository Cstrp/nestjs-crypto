import { randomBytes } from 'crypto';

/**
 * Generates a random secret key for AES encryption
 * @param length - Length of the key in bytes (default 32 for AES-256)
 * @returns Hex string of the generated key
 */
export function generateAesKey(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a random initialization vector for AES
 * @param length - Length of the IV in bytes (default 16 for AES-256-CBC)
 * @returns Hex string of the generated IV
 */
export function generateAesIv(length: number = 16): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a random secret string
 * @param length - Length of the secret in bytes (default 32)
 * @returns Hex string of the generated secret
 */
export function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex');
}
