import { apiKeyManager } from './apiKeyManager';
import { Source } from '@shared/schema';

/**
 * Service to interact with the Mistral AI API for fact checking
 */
export class MistralService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.mistral.ai/v1';
  private model: string = 'mistral-large-latest';
  
  constructor() {
    this.apiKey = apiKeyManager.getApiKey('mistral');
  }
  
  /**
   * Initialize the Mistral client with an API key
   */
  initializeClient(apiKey: string): void {
    this.apiKey = apiKey;
    apiKeyManager.setApiKey('mistral', apiKey);
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
      console.log("Mistral API key not available, using simulated response");
      return this.simulatedResponse(statement);
    }
    
    try {
      const prompt = `
        You are a rigorous fact checker analyzing the following statement for factual accuracy:
        
        Statement: "${statement}"
        
        Respond only with a JSON object with these fields:
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
              content: "You are a fact-checking assistant. Respond only with JSON output, no explanations outside of the JSON."
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
        console.error("Mistral API error:", data);
        throw new Error(`Mistral API error: ${data.error?.message || 'Unknown error'}`);
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
      console.error("Error checking fact with Mistral:", error);
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
    const isTrue = !statement.toLowerCase().includes("false") && 
                  Math.random() > 0.3;
    
    const lowercaseStatement = statement.toLowerCase();
    
    // Domain detection for appropriate simulated response
    let domain = "general knowledge";
    if (lowercaseStatement.includes("history") || 
        lowercaseStatement.includes("war") || 
        lowercaseStatement.includes("ancient")) {
      domain = "historical";
    } else if (lowercaseStatement.includes("economy") || 
              lowercaseStatement.includes("market") || 
              lowercaseStatement.includes("finance")) {
      domain = "financial";
    } else if (lowercaseStatement.includes("tech") || 
              lowercaseStatement.includes("computer") || 
              lowercaseStatement.includes("software")) {
      domain = "technical";
    }
    
    return {
      isTrue: isTrue,
      explanation: `[SIMULATED MISTRAL RESPONSE] After analyzing the statement: "${statement}", the evidence suggests this claim is ${isTrue ? 'accurate' : 'inaccurate'}. This simulated response would normally include detailed reasoning with specific points of evidence. To get actual verification results, please add your Mistral API key.`,
      historicalContext: `[SIMULATED MISTRAL RESPONSE] This ${domain} topic has important context that would normally be explained here, including its origins and significance. Add your Mistral API key to receive proper historical background on your queries.`,
      sources: [
        {
          name: "MIT Technology Review",
          url: "https://www.technologyreview.com/"
        },
        {
          name: "JSTOR",
          url: "https://www.jstor.org/"
        },
        {
          name: "Reuters",
          url: "https://www.reuters.com/"
        }
      ],
      confidence: isTrue ? 0.82 : 0.76
    };
  }
}

export const mistralService = new MistralService();