import { Source } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Service to interact with the Anthropic Claude API for fact checking
 */
export class ClaudeService {
  private anthropic: Anthropic | null = null;
  
  constructor() {
    // Will initialize this with your API key when you're ready
    this.anthropic = null;
  }

  /**
   * Initialize the Claude client with an API key
   */
  initializeClient(apiKey: string): void {
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
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
    try {
      if (!this.anthropic) {
        return this.simulatedResponse(statement);
      }
      
      const systemPrompt = `
        You are an expert fact-checker with deep analytical capabilities.
        Your task is to analyze statements for factual accuracy using deep reasoning and critical thinking.
        Focus on complex nuances, historical context, and subtle implications in the statement.
        
        Format your response as follows:
        VERDICT: [TRUE or FALSE]
        CONFIDENCE: [A number between 0.0 and 1.0 representing your confidence]
        EXPLANATION: [Detailed reasoning behind your verdict]
        HISTORICAL_CONTEXT: [Relevant historical, cultural, or societal context]
        SOURCES: [List of reliable sources in format "name|url" with each source on a new line]
      `;

      const userPrompt = `Analyze this statement and determine if it is factually accurate: "${statement}"`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Optimal model for fact-checking
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: userPrompt
          }
        ]
      });

      const response = message.content[0].text;
      
      // Parse the response
      const verdictMatch = response.match(/VERDICT:\s*(TRUE|FALSE)/i);
      const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/);
      const explanationMatch = response.match(/EXPLANATION:\s*(.*?)(?=HISTORICAL_CONTEXT:|$)/s);
      const contextMatch = response.match(/HISTORICAL_CONTEXT:\s*(.*?)(?=SOURCES:|$)/s);
      const sourcesMatch = response.match(/SOURCES:\s*(.*?)$/s);
      
      const isTrue = verdictMatch?.[1]?.toUpperCase() === 'TRUE';
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
      const explanation = explanationMatch?.[1]?.trim() || 'Analysis completed';
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
      console.error('Error checking fact with Claude:', error);
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
    // For demonstration purposes
    return {
      isTrue: statement.length % 2 === 0, // Arbitrary logic for demo
      explanation: "Claude would analyze this statement with deep reasoning, considering logical consistency, factual accuracy, and contextual relevance.",
      historicalContext: "Claude would provide rich historical context examining the evolution of relevant concepts and their implications across different time periods and cultures.",
      sources: [
        {
          name: "Academic Journal",
          url: "https://example.edu/journal"
        },
        {
          name: "Historical Archive",
          url: "https://example.org/archives"
        }
      ],
      confidence: 0.85
    };
  }
}

export const claudeService = new ClaudeService();