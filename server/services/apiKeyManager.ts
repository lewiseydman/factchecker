/**
 * API Key Manager
 * 
 * This service manages the API keys for all external services.
 * It provides a central place to store and retrieve keys.
 */
export class ApiKeyManager {
  private apiKeys: {
    claude: string | null;
    openai: string | null;
    perplexity: string | null;
  };
  
  constructor() {
    this.apiKeys = {
      claude: process.env.ANTHROPIC_API_KEY || null,
      openai: process.env.OPENAI_API_KEY || null,
      perplexity: process.env.PERPLEXITY_API_KEY || null
    };
  }
  
  /**
   * Set an API key for a service
   */
  setApiKey(service: 'claude' | 'openai' | 'perplexity', key: string): void {
    this.apiKeys[service] = key;
  }
  
  /**
   * Get an API key for a service
   */
  getApiKey(service: 'claude' | 'openai' | 'perplexity'): string | null {
    return this.apiKeys[service];
  }
  
  /**
   * Check if all required API keys are available
   */
  hasAllKeys(): boolean {
    return (
      !!this.apiKeys.claude &&
      !!this.apiKeys.openai &&
      !!this.apiKeys.perplexity
    );
  }
  
  /**
   * Get object with all API keys
   */
  getAllKeys(): {
    claude: string | null;
    openai: string | null;
    perplexity: string | null;
  } {
    return { ...this.apiKeys };
  }
}

export const apiKeyManager = new ApiKeyManager();