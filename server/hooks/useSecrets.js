const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const SECRETS_FILE = path.join(__dirname, '..', '.secrets.enc');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32-chars';

class SecretsManager {
  constructor() {
    this.secrets = new Map();
    this.loaded = false;
  }

  async loadSecrets() {
    if (this.loaded) return;
    
    try {
      const encryptedData = await fs.readFile(SECRETS_FILE);
      const decrypted = this.decrypt(encryptedData);
      const secrets = JSON.parse(decrypted);
      
      for (const [key, value] of Object.entries(secrets)) {
        this.secrets.set(key, value);
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('Starting with empty secrets vault');
    }
    
    this.loaded = true;
  }

  async saveSecrets() {
    const secretsObj = Object.fromEntries(this.secrets);
    const encrypted = this.encrypt(JSON.stringify(secretsObj));
    await fs.writeFile(SECRETS_FILE, encrypted);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    const textParts = encryptedData.toString().split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getSecret(key) {
    await this.loadSecrets();
    return this.secrets.get(key);
  }

  async setSecret(key, value) {
    await this.loadSecrets();
    this.secrets.set(key, value);
    await this.saveSecrets();
  }
}

const secretsManager = new SecretsManager();

export function useSecrets() {
  return {
    getSecret: (key) => secretsManager.getSecret(key),
    setSecret: (key, value) => secretsManager.setSecret(key, value)
  };
}
