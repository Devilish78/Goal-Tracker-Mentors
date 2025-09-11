// Client-side secrets management using localStorage
// Note: This is for demo purposes only. In production, use proper server-side secret management.

class ClientSecretsManager {
  constructor() {
    this.storageKey = 'goalTracker_secrets'
  }

  async getSecret(key) {
    try {
      const secrets = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      return secrets[key] || null
    } catch (error) {
      console.error('Error getting secret:', error)
      return null
    }
  }

  async setSecret(key, value) {
    try {
      const secrets = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      secrets[key] = value
      localStorage.setItem(this.storageKey, JSON.stringify(secrets))
      return true
    } catch (error) {
      console.error('Error setting secret:', error)
      return false
    }
  }

  async removeSecret(key) {
    try {
      const secrets = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      delete secrets[key]
      localStorage.setItem(this.storageKey, JSON.stringify(secrets))
      return true
    } catch (error) {
      console.error('Error removing secret:', error)
      return false
    }
  }
}

const secretsManager = new ClientSecretsManager()

export function useSecrets() {
  return {
    getSecret: (key) => secretsManager.getSecret(key),
    setSecret: (key, value) => secretsManager.setSecret(key, value),
    removeSecret: (key) => secretsManager.removeSecret(key)
  }
}
