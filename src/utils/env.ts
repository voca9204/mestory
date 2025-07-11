/**
 * Environment variable validation and type-safe access
 */

interface EnvConfig {
  // Firebase Configuration
  VITE_FIREBASE_API_KEY: string
  VITE_FIREBASE_AUTH_DOMAIN: string
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_STORAGE_BUCKET: string
  VITE_FIREBASE_MESSAGING_SENDER_ID: string
  VITE_FIREBASE_APP_ID: string
  VITE_FIREBASE_MEASUREMENT_ID?: string
  
  // Firebase Emulator
  VITE_USE_FIREBASE_EMULATOR?: string
  
  // App Mode
  VITE_APP_MODE?: 'development' | 'production' | 'demo'
}

class EnvironmentValidator {
  private config: EnvConfig
  
  constructor() {
    this.config = this.validateAndParse()
  }
  
  private validateAndParse(): EnvConfig {
    const errors: string[] = []
    
    // Required Firebase configuration
    const requiredKeys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ] as const
    
    // Check for required keys
    requiredKeys.forEach(key => {
      if (!import.meta.env[key]) {
        errors.push(`Missing required environment variable: ${key}`)
      }
    })
    
    // Log errors if any
    if (errors.length > 0) {
      console.error('Environment validation errors:', errors)
      
      // In development, throw error
      if (import.meta.env.DEV) {
        throw new Error('Environment validation failed:\n' + errors.join('\n'))
      }
      
      // In production, log warning
      console.warn('Running with missing environment variables. Some features may not work correctly.')
    }
    
    return {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
      VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      VITE_USE_FIREBASE_EMULATOR: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
      VITE_APP_MODE: import.meta.env.VITE_APP_MODE as 'development' | 'production' | 'demo'
    }
  }
  
  get(key: keyof EnvConfig): string | undefined {
    return this.config[key]
  }
  
  getRequired(key: keyof EnvConfig): string {
    const value = this.config[key]
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value
  }
  
  isEmulatorEnabled(): boolean {
    return this.config.VITE_USE_FIREBASE_EMULATOR === 'true'
  }
  
  isDevelopment(): boolean {
    return import.meta.env.DEV || this.config.VITE_APP_MODE === 'development'
  }
  
  isProduction(): boolean {
    return import.meta.env.PROD || this.config.VITE_APP_MODE === 'production'
  }
  
  isDemo(): boolean {
    return this.config.VITE_APP_MODE === 'demo'
  }
}

// Export singleton instance
export const env = new EnvironmentValidator()

// Export type-safe environment variables
export const ENV = {
  firebase: {
    apiKey: () => env.getRequired('VITE_FIREBASE_API_KEY'),
    authDomain: () => env.getRequired('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: () => env.getRequired('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: () => env.getRequired('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: () => env.getRequired('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: () => env.getRequired('VITE_FIREBASE_APP_ID'),
    measurementId: () => env.get('VITE_FIREBASE_MEASUREMENT_ID')
  },
  features: {
    useEmulator: () => env.isEmulatorEnabled()
  },
  mode: {
    isDevelopment: () => env.isDevelopment(),
    isProduction: () => env.isProduction(),
    isDemo: () => env.isDemo()
  }
}