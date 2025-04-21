import crypto from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-cbc';
// Use environment variable for encryption key or a fallback
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-32-chars';
// Make sure the key is the correct length for AES-256
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));

/**
 * Encrypts sensitive data
 * @param text The text to encrypt
 * @returns Encrypted data as a string (IV + encrypted text)
 */
export const encrypt = (text: string): string => {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Combine IV and encrypted text (IV is needed for decryption)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts encrypted data
 * @param encryptedData The data to decrypt (IV + encrypted text)
 * @returns Decrypted text
 */
export const decrypt = (encryptedData: string): string => {
  try {
    // Split IV and encrypted text
    const [ivHex, encryptedText] = encryptedData.split(':');
    // Convert IV from hex to Buffer
    const iv = Buffer.from(ivHex, 'hex');
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hashes a text using SHA-256
 * @param text The text to hash
 * @returns Hashed text
 */
export const hash = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generates a random API key
 * @returns Random API key
 */
export const generateApiKey = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generates a random API secret
 * @returns Random API secret
 */
export const generateApiSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
