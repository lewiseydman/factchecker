import { apiKeyManager } from './apiKeyManager';
import { Source } from '@shared/schema';

/**
 * Service to interact with the OpenAI API for fact checking
 */
export class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  
  constructor() {
    this.apiKey = apiKeyManager.getApiKey('openai');
  }
  
  /**
   * Initialize the OpenAI client with an API key
   */
  initializeClient(apiKey: string): void {
    this.apiKey = apiKey;
    apiKeyManager.setApiKey('openai', apiKey);
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
    // If no API key, throw error
    if (!this.apiKey) {
      throw new Error("OpenAI API key not available");
    }
    
    try {
      const prompt = `
        You are a rigorous fact checker analyzing the following statement for factual accuracy:
        
        Statement: "${statement}"
        
        Respond with a JSON object with these fields:
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
              content: "You are a fact-checking assistant. You always provide accurate information with sources."
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
        console.error("OpenAI API error:", data);
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
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
      console.error("Error checking fact with OpenAI:", error);
      // Re-throw the error so this service gets excluded from results
      throw error;
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
    if (lowercaseStatement.includes("science") || 
        lowercaseStatement.includes("physics") || 
        lowercaseStatement.includes("research")) {
      domain = "scientific";
    } else if (lowercaseStatement.includes("code") || 
              lowercaseStatement.includes("programming") || 
              lowercaseStatement.includes("software")) {
      domain = "technical";
    } else if (lowercaseStatement.includes("history") || 
              lowercaseStatement.includes("ancient") || 
              lowercaseStatement.includes("war")) {
      domain = "historical";
    }
    
    return {
      isTrue: isTrue,
      explanation: `[SIMULATED GPT-4 RESPONSE] Based on comprehensive analysis of the statement: "${statement}", I've determined it is ${isTrue ? 'factually accurate' : 'not supported by available evidence'}. This simulated response would normally include detailed reasoning with specific evidence points. To get actual verification, please add your OpenAI API key.`,
      historicalContext: `[SIMULATED GPT-4 RESPONSE] Regarding this ${domain} topic, the relevant historical context would be provided here. This would normally include key background information that helps understand the origin and development of the concepts mentioned. Add your OpenAI API key to get accurate historical context.`,
      sources: [
        {
          name: "Encyclopaedia Britannica",
          url: "https://www.britannica.com/"
        },
        {
          name: "Science Direct",
          url: "https://www.sciencedirect.com/"
        },
        {
          name: "The New York Times",
          url: "https://www.nytimes.com/"
        }
      ],
      confidence: isTrue ? 0.85 : 0.72
    };
  }
}

export const openAIService = new OpenAIService();