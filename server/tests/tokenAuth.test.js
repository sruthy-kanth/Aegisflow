import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateSecureToken, hashToken, maskPhone, encryptString, decryptString } from '../src/utils/crypto.js';

describe('Cryptographic & Token Authorisation Logic', () => {
  test('generateSecureToken generates high-entropy random tokens of requested byte size', () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    assert.strictEqual(typeof token1, 'string');
    assert.strictEqual(token1.length, 64); // 32 bytes = 64 hex characters
    assert.notStrictEqual(token1, token2, 'Two generated tokens must never be equal');
  });

  test('hashToken produces deterministic SHA-256 hash', () => {
    const rawToken = '5ff1fb6dec93bec5b36c4792feea1839e9cbe9581b0e888281288aa16df824b8';
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64); // SHA-256 produces 64 hex characters
    assert.notStrictEqual(hash1, rawToken, 'Hash must not equal raw token');
  });

  test('hashToken returns null if token is falsy', () => {
    assert.strictEqual(hashToken(null), null);
    assert.strictEqual(hashToken(''), null);
  });

  test('maskPhone conceals sensitive digits in compliance with safety standards', () => {
    const phone = '+919447100001';
    const masked = maskPhone(phone);

    assert.ok(masked.startsWith('+91'));
    assert.ok(masked.endsWith('0001'));
    assert.ok(masked.includes('*****'));
    assert.ok(!masked.includes('944710'), 'Middle digits must be completely concealed');
  });

  test('AES-256-GCM encryption and decryption at rest works reversibly with auth tag', () => {
    const originalText = '+91 94471 23456';
    const encrypted = encryptString(originalText);

    assert.notStrictEqual(encrypted, originalText);
    assert.ok(encrypted.includes(':'), 'Encrypted representation must contain iv:tag:ciphertext');

    const decrypted = decryptString(encrypted);
    assert.strictEqual(decrypted, originalText);
  });
});
