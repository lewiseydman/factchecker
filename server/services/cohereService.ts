import { apiKeyManager } from './apiKeyManager';
import { Source } from '@shared/schema';

/**
 * Service to interact with the Cohere API for fact checking
 * Uses Command R+ for maximum bias reduction and enterprise-grade accuracy
 */
export class CohereService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.cohere.ai/v1';
  private model: string = 'command-r-plus'; // Best model for fact-checking with bias reduction
  
  constructor() {
    this.apiKey = apiKeyManager.getApiKey('cohere');
  }
  
  /**
   * Initialize the Cohere client with an API key
   */
  initializeClient(apiKey: string): void {
    this.apiKey = apiKey;
    apiKeyManager.setApiKey('cohere', apiKey);
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
      console.log("Cohere API key not available, using simulated response");
      return this.simulatedResponse(statement);
    }

    try {
      const prompt = `
You are an expert fact-checker with a focus on reducing bias and providing objective analysis.
Your task is to analyze the following statement for factual accuracy with maximum objectivity.

Statement to analyze: "${statement}"

Please provide your analysis in the following format:
VERDICT: [TRUE or FALSE]
CONFIDENCE: [A number between 0.0 and 1.0]
EXPLANATION: [Detailed, unbiased reasoning behind your verdict]
HISTORICAL_CONTEXT: [Relevant background information that helps understand the context]
SOURCES: [List reliable sources in format "name|url" with each source on a new line]

Focus on:
- Objective analysis without political or cultural bias
- Verifiable facts from reputable sources
- Clear reasoning for your conclusion
- Acknowledging uncertainty when evidence is limited
      `;

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          max_tokens: 1000,
          temperature: 0.2,
          stop_sequences: [],
          return_likelihoods: 'NONE'
        })
      });

      if (!response.ok) {
        console.error("Cohere API error:", await response.text());
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.generations[0].text;
      
      // Parse the response
      const verdictMatch = text.match(/VERDICT:\s*(TRUE|FALSE)/i);
      const confidenceMatch = text.match(/CONFIDENCE:\s*([\d.]+)/);
      const explanationMatch = text.match(/EXPLANATION:\s*(.*?)(?=HISTORICAL_CONTEXT:|$)/s);
      const contextMatch = text.match(/HISTORICAL_CONTEXT:\s*(.*?)(?=SOURCES:|$)/s);
      const sourcesMatch = text.match(/SOURCES:\s*(.*?)$/s);
      
      const isTrue = verdictMatch?.[1]?.toUpperCase() === 'TRUE';
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
      const explanation = explanationMatch?.[1]?.trim() || 'Analysis completed with bias reduction focus';
      const historicalContext = contextMatch?.[1]?.trim() || '';
      
      // Parse sources
      const sources: Source[] = [];
      if (sourcesMatch?.[1]) {
        const sourceLines = sourcesMatch[1].split('\n').filter(line => line.trim());
        sourceLines.forEach(line => {
          const parts = line.split('|');
          if (parts.length >= 2) {
            sources.push({
              name: parts[0].trim(),
              url: parts[1].trim()
            });
          }
        });
      }
      
      return {
        isTrue,
        explanation,
        historicalContext,
        sources,
        confidence
      };
    } catch (error) {
      console.error("Error checking fact with Cohere:", error);
      return this.simulatedResponse(statement);
    }
  }
  
  /**
   * Simulated response for when API key is not available
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
    if (lowercaseStatement.includes("political") || 
        lowercaseStatement.includes("election") || 
        lowercaseStatement.includes("government")) {
      domain = "political analysis";
    } else if (lowercaseStatement.includes("medical") || 
              lowercaseStatement.includes("health") || 
              lowercaseStatement.includes("disease")) {
      domain = "medical information";
    } else if (lowercaseStatement.includes("scientific") ||
              lowercaseStatement.includes("research") ||
              lowercaseStatement.includes("study")) {
      domain = "scientific research";
    }
    
    return {
      isTrue,
      explanation: `[SIMULATED - Cohere] This ${domain} statement has been analyzed with focus on bias reduction. ${isTrue ? 'Evidence supports' : 'Evidence does not support'} the claim. This analysis prioritizes objective evaluation and source verification.`,
      historicalContext: `[SIMULATED] Historical context shows this topic has been subject to various interpretations. Cohere's bias reduction approach emphasizes factual accuracy over subjective interpretations.`,
      sources: [
        {
          name: "Bias-Reduced Analysis Database",
          url: "https://example.com/bias-reduced-sources"
        },
        {
          name: "Objective Fact Verification",
          url: "https://example.com/objective-verification"
        }
      ],
      confidence: 0.75
    };
  }
}

export const cohereService = new CohereService();