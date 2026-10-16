import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generate cryptographically secure random token (default 32 bytes = 64 hex characters)
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash token using SHA-256 for secure database lookup
 */
export function hashToken(token) {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Mask phone number for logging and display, never exposing full phone in plain logs
 */
export function maskPhone(phone) {
  if (!phone) return '';
  const cleaned = String(phone).trim();
  if (cleaned.length <= 4) return '****';
  return cleaned.slice(0, 3) + '*****' + cleaned.slice(-4);
}

// AES-256-GCM for optional encryption at rest
const ALGORITHM = 'aes-256-gcm';
const getKey = () => {
  // Ensure exactly 32 bytes buffer
  return crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
};

export function encryptString(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decryptString(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const [ivHex, tagHex, contentHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return encryptedText; // Fallback if plain or invalid
  }
}
