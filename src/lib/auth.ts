import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LEN = 64;
const SCRYPT_COST = { N: 16384, r: 8, p: 1 };

/** Hash a password with scrypt. Format: `scrypt$<saltHex>$<keyHex>`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password.normalize('NFKC'), salt, KEY_LEN, SCRYPT_COST);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

/** Constant-time password check. Returns false on any malformed stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (expected.length !== KEY_LEN) return false;

  const actual = scryptSync(password.normalize('NFKC'), salt, KEY_LEN, SCRYPT_COST);
  return timingSafeEqual(actual, expected);
}

export function newSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/** Normalise a display name into a URL handle. */
export function toHandle(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
}

export const HANDLE_RE = /^[a-z0-9_-]{3,24}$/;
