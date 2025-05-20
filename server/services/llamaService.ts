import { apiKeyManager } from './apiKeyManager';
import { Source } from '@shared/schema';

/**
 * Service to interact with the Meta Llama API for fact checking
 */
export class LlamaService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://llama-api.meta.ai/v1';
  private model: string = 'llama-3-sonar-70b-chat';
  
  constructor() {
    this.apiKey = apiKeyManager.getApiKey('llama');
  }
  
  /**
   * Initialize the Llama client with an API key
   */
  initializeClient(apiKey: string): void {
    this.apiKey = apiKey;
    apiKeyManager.setApiKey('llama', apiKey);
  }
  
  /**
   * Check if a statement is factually correct
   * @param statement The statement to check
   * @returns Object with verdict, explanation, historical context, and sources
   */
  async checkFact(statement: string): Promise<{
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidence: number;
  }> {
    // If no API key, return simulated response
    if (!this.apiKey) {
      console.log("Llama API key not available, using simulated response");
      return this.simulatedResponse(statement);
    }
    
    try {
      const prompt = `
        You are a rigorous fact checker analyzing the following statement for factual accuracy:
        
        Statement: "${statement}"
        
        Respond with only a JSON object with these fields:
        - isTrue: a boolean indicating if the statement is factually accurate
        - explanation: a detailed explanation of why the statement is true or false (150-300 words)
        - historicalContext: background information that helps understand the context (100-200 words)
        - sources: an array of objects each containing "name" (source name) and "url" (source URL)
        - confidence: a number from 0 to 1 indicating your confidence in this assessment
        
        Base your assessment solely on verifiable facts from reputable sources. Include at least 3 sources.
      `;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are a fact-checking assistant. You always provide only JSON output in response to queries, with no additional explanations outside the JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Llama API error:", data);
        throw new Error(`Llama API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      // Extract the response content and parse the JSON
      const textResponse = data.choices[0].message.content;
      const parsedResponse = JSON.parse(textResponse);
      
      return {
        isTrue: parsedResponse.isTrue,
        explanation: parsedResponse.explanation,
        historicalContext: parsedResponse.historicalContext,
        sources: parsedResponse.sources,
        confidence: parsedResponse.confidence
      };
    } catch (error) {
      console.error("Error checking fact with Llama:", error);
      // Fall back to simulated response if API call fails
      return this.simulatedResponse(statement);
    }
  }
  
  /**
   * Simulated response for when API key is not available
   * This will be replaced by actual API calls when you add your key
   */
  private simulatedResponse(statement: string): {
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidence: number;
  } {
    const isTrue = !statement.toLowerCase().includes("not") && 
                  Math.random() > 0.4;
    
    const lowercaseStatement = statement.toLowerCase();
    
    // Domain detection for tailored simulated response
    let domain = "general knowledge";
    if (lowercaseStatement.includes("sports") || 
        lowercaseStatement.includes("athlete") || 
        lowercaseStatement.includes("game")) {
      domain = "sports";
    } else if (lowercaseStatement.includes("movie") || 
              lowercaseStatement.includes("tv") || 
              lowercaseStatement.includes("actor")) {
      domain = "entertainment";
    } else if (lowercaseStatement.includes("news") || 
              lowercaseStatement.includes("recent") || 
              lowercaseStatement.includes("today")) {
      domain = "current events";
    }
    
    return {
      isTrue: isTrue,
      explanation: `[SIMULATED LLAMA RESPONSE] After thorough analysis of the claim: "${statement}", our assessment concludes it is ${isTrue ? 'substantiated by evidence' : 'contradicted by available evidence'}. This simulated explanation would include specific details supporting this conclusion. To get actual verification, please add your Llama API key.`,
      historicalContext: `[SIMULATED LLAMA RESPONSE] Context for this ${domain} topic would typically include its development over time and key related events. Add your Llama API key to get accurate historical context for your statements.`,
      sources: [
        {
          name: "The Associated Press",
          url: "https://apnews.com/"
        },
        {
          name: "Wikipedia",
          url: "https://www.wikipedia.org/"
        },
        {
          name: "Scientific American",
          url: "https://www.scientificamerican.com/"
        }
      ],
      confidence: isTrue ? 0.85 : 0.73
    };
  }
}

export const llamaService = new LlamaService();