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
    gemini: string | null;
    mistral: string | null;
    llama: string | null;
  };
  
  constructor() {
    this.apiKeys = {
      claude: process.env.ANTHROPIC_API_KEY || null,
      openai: process.env.OPENAI_API_KEY || null,
      perplexity: process.env.PERPLEXITY_API_KEY || null,
      gemini: process.env.GEMINI_API_KEY || null,
      mistral: process.env.MISTRAL_API_KEY || null,
      llama: process.env.LLAMA_API_KEY || null
    };
  }
  
  /**
   * Set an API key for a service
   */
  setApiKey(service: 'claude' | 'openai' | 'perplexity' | 'gemini' | 'mistral' | 'llama', key: string): void {
    this.apiKeys[service] = key;
  }
  
  /**
   * Get an API key for a service
   */
  getApiKey(service: 'claude' | 'openai' | 'perplexity' | 'gemini' | 'mistral' | 'llama'): string | null {
    return this.apiKeys[service];
  }
  
  /**
   * Check if any API keys are available
   */
  hasAnyKey(): boolean {
    return Object.values(this.apiKeys).some(key => !!key);
  }

  /**
   * Check if a specific API key is available
   */
  hasKey(service: 'claude' | 'openai' | 'perplexity' | 'gemini' | 'mistral' | 'llama'): boolean {
    return !!this.apiKeys[service];
  }
  
  /**
   * Get object with all API keys
   */
  getAllKeys(): {
    claude: string | null;
    openai: string | null;
    perplexity: string | null;
    gemini: string | null;
    mistral: string | null;
    llama: string | null;
  } {
    return { ...this.apiKeys };
  }
}

export const apiKeyManager = new ApiKeyManager();