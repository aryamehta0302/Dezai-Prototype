import * as crypto from 'crypto';

/**
 * Generates a SHA-256 hash of a userId and the environment salt.
 * Used to anonymize user identifiers in audit logs.
 */
export function hashUserId(userId: string): string {
  if (!userId) return '';
  const salt = process.env.AUDIT_HASH_SALT || 'default_audit_salt_2026';
  return crypto
    .createHash('sha256')
    .update(userId + salt)
    .digest('hex');
}
