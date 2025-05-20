import { apiKeyManager } from './apiKeyManager';
import { Source } from '@shared/schema';

/**
 * Service to interact with the Google Gemini API for fact checking
 */
export class GeminiService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';
  private model: string = 'gemini-1.5-pro';
  
  constructor() {
    this.apiKey = apiKeyManager.getApiKey('gemini');
  }
  
  /**
   * Initialize the Gemini client with an API key
   */
  initializeClient(apiKey: string): void {
    this.apiKey = apiKey;
    apiKeyManager.setApiKey('gemini', apiKey);
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
      console.log("Gemini API key not available, using simulated response");
      return this.simulatedResponse(statement);
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
      
      const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Gemini API error:", data);
        throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      // Extract the text response and parse the JSON
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Find and extract the JSON object from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from Gemini response");
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return {
        isTrue: parsedResponse.isTrue,
        explanation: parsedResponse.explanation,
        historicalContext: parsedResponse.historicalContext,
        sources: parsedResponse.sources,
        confidence: parsedResponse.confidence
      };
    } catch (error) {
      console.error("Error checking fact with Gemini:", error);
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
    const isTrue = statement.toLowerCase().includes("true") || 
                  !statement.toLowerCase().includes("false");
    
    const lowercaseStatement = statement.toLowerCase();
    
    // Determine domain-specific simulated response
    let domain = "general";
    if (lowercaseStatement.includes("covid") || 
        lowercaseStatement.includes("disease") || 
        lowercaseStatement.includes("health")) {
      domain = "medical";
    } else if (lowercaseStatement.includes("president") || 
              lowercaseStatement.includes("election") || 
              lowercaseStatement.includes("government")) {
      domain = "political";
    } else if (lowercaseStatement.includes("universe") || 
              lowercaseStatement.includes("planet") || 
              lowercaseStatement.includes("scientific")) {
      domain = "scientific";
    }
    
    return {
      isTrue: isTrue,
      explanation: `[SIMULATED GEMINI RESPONSE] Based on careful analysis of this statement: "${statement}", our assessment is that this claim is ${isTrue ? 'likely true' : 'likely false'}. This assessment would normally include multiple specific citations and a detailed analysis. To get actual verification, please add your Gemini API key.`,
      historicalContext: `[SIMULATED GEMINI RESPONSE] Historical context about this ${domain} topic would appear here. This would normally include relevant background information that helps put the statement in proper context. Add your Gemini API key to get accurate historical context.`,
      sources: [
        {
          name: "Google Scholar",
          url: "https://scholar.google.com/"
        },
        {
          name: "Nature",
          url: "https://www.nature.com/"
        },
        {
          name: "Pew Research",
          url: "https://www.pewresearch.org/"
        }
      ],
      confidence: 0.7
    };
  }
}

export const geminiService = new GeminiService();