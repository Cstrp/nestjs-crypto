export const CRYPTO_TYPES = {
  BCRYPT: 'BCRYPT',
  AES: 'AES',
  NONE: 'NONE',
} as const;

export type CryptoType = (typeof CRYPTO_TYPES)[keyof typeof CRYPTO_TYPES];
