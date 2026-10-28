/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Enterprise Cryptographic Engine & PII Data Protection (SIH 2026)
 * Implements Authenticated AES-256-GCM Encryption, SHA-256 Indexing & PII Masking
 * =========================================================================
 */

const crypto = require('crypto');
const config = require('../config/env');

// Derive 32-byte binary key from hex master key or hash
function getMasterKey() {
    const rawKey = config.security.masterKey;
    if (rawKey.length === 64) {
        return Buffer.from(rawKey, 'hex');
    }
    return crypto.createHash('sha256').update(String(rawKey)).digest();
}

const MASTER_KEY = getMasterKey();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

/**
 * Encrypt sensitive plain text using authenticated AES-256-GCM
 * @param {string} plainText
 * @returns {string} Serialized encrypted token: "enc:ivHex:tagHex:cipherHex"
 */
function encryptPII(plainText) {
    if (!plainText || typeof plainText !== 'string') return plainText;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
        
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        const ivHex = iv.toString('hex');

        return `enc:${ivHex}:${authTag}:${encrypted}`;
    } catch (err) {
        console.error('[Encryption Engine] Encryption error:', err.message);
        return plainText; // Fallback gracefully if error
    }
}

/**
 * Decrypt serialized AES-256-GCM encrypted token
 * @param {string} token - "enc:ivHex:tagHex:cipherHex"
 * @returns {string} Plain text or original token if not encrypted
 */
function decryptPII(token) {
    if (!token || typeof token !== 'string' || !token.startsWith('enc:')) {
        return token;
    }

    try {
        const parts = token.split(':');
        if (parts.length !== 4) return token;

        const [, ivHex, tagHex, cipherHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(tagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.warn('[Encryption Engine] Decryption failed or data tampered:', err.message);
        return token;
    }
}

/**
 * Deterministic One-Way Hash for indexing/searching encrypted columns (SHA-256)
 * @param {string} text
 * @returns {string}
 */
function hashPII(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(String(text).trim().toLowerCase()).digest('hex');
}

/**
 * Mask email for privacy-preserving UI display
 * e.g., "rahul.verma@gmail.com" -> "ra***a@gmail.com"
 */
function maskEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) return email;
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user.slice(0, 2)}${'*'.repeat(Math.min(user.length - 2, 4))}${user.slice(-1)}@${domain}`;
}

/**
 * Mask phone number for privacy-preserving UI display
 * e.g., "+91 9876543210" -> "+91 ******3210"
 */
function maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return phone;
    const clean = phone.trim();
    if (clean.length < 6) return '******';
    return `${clean.slice(0, 3)} ${'*'.repeat(clean.length - 7)} ${clean.slice(-4)}`;
}

module.exports = {
    encryptPII,
    decryptPII,
    hashPII,
    maskEmail,
    maskPhone
};
