import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function key() {
  const encoded = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!encoded) throw new Error('Document encryption is not configured.');
  const value = Buffer.from(encoded, 'base64url');
  if (value.length !== 32) throw new Error('DOCUMENT_ENCRYPTION_KEY must contain 32 bytes.');
  return value;
}

export function encryptDocument(bytes: Uint8Array) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), authTag: cipher.getAuthTag().toString('base64') };
}

export function decryptDocument(ciphertext: string, iv: string, authTag: string) {
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]);
}
