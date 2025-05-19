import { Source } from "@shared/schema";

/**
 * Enhanced service to interact with the Perplexity API for fact checking
 */
export class EnhancedPerplexityService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.perplexity.ai/chat/completions';
  private model: string = 'llama-3.1-sonar-small-128k-online';
  
  constructor() {
    // Will initialize this with your API key when you're ready
    this.apiKey = null;
  }

  /**
   * Initialize the Perplexity client with an API key
   */
  initializeClient(apiKey: string): void {
    if (!apiKey) {
      throw new Error('Perplexity API key is required');
    }
    
    this.apiKey = apiKey;
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
      if (!this.apiKey) {
        return this.simulatedResponse(statement);
      }
      
      const systemPrompt = `
        You are a professional fact-checker tasked with verifying the accuracy of statements using real-time information.
        For the given statement, determine if it is TRUE or FALSE based on reliable online sources.
        Follow these guidelines:
        1. Search for accurate, up-to-date information from credible sources
        2. Provide a clear verdict (TRUE or FALSE)
        3. Give a detailed explanation of your reasoning
        4. Include your confidence level as a decimal between 0.0 and 1.0
        5. Provide historical context for the statement
        6. List all sources consulted with name and URL
        7. Be objective and thorough
        
        Format your response exactly as follows:
        VERDICT: [TRUE or FALSE]
        CONFIDENCE: [A number between 0.0 and 1.0]
        EXPLANATION: [detailed explanation]
        HISTORICAL_CONTEXT: [relevant historical background that helps understand the statement]
        SOURCES: [list of sources with names and URLs, one per line in format "name|url"]
      `;

      const userPrompt = `Fact check this statement using online information: "${statement}"`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          max_tokens: 800,
          search_recency_filter: "month",
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Extract the content from the completion
      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in Perplexity response');
      }

      // Parse the response format
      const verdictMatch = content.match(/VERDICT:\s*(TRUE|FALSE)/i);
      const confidenceMatch = content.match(/CONFIDENCE:\s*(0\.\d+)/i);
      const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)(?=HISTORICAL_CONTEXT:|SOURCES:|$)/i);
      const contextMatch = content.match(/HISTORICAL_CONTEXT:\s*([\s\S]*?)(?=SOURCES:|$)/i);
      
      // Extract sources from the content
      const sources: Source[] = [];
      const sourcesMatch = content.match(/SOURCES:\s*([\s\S]*?)$/i);
      
      if (sourcesMatch && sourcesMatch[1]) {
        const sourcesText = sourcesMatch[1].trim();
        
        // Extract sources from citations in the Perplexity API response
        if (data.citations && Array.isArray(data.citations)) {
          data.citations.forEach((citation: string, index: number) => {
            // Extract domain name as source name
            const urlObj = new URL(citation);
            const domainParts = urlObj.hostname.split('.');
            const domain = domainParts.length >= 2 
              ? domainParts[domainParts.length - 2] 
              : urlObj.hostname;
            
            sources.push({
              name: domain.charAt(0).toUpperCase() + domain.slice(1),
              url: citation
            });
          });
        }
        
        // If no citations in the API response, try to parse from the text
        if (sources.length === 0) {
          const sourcesList = sourcesText.split('\n');
          sourcesList.forEach((sourceText: string) => {
            const match = sourceText.match(/(?:"([^"]+)"|([^|]+))\s*\|\s*(\bhttps?:\/\/\S+\b)/i);
            if (match) {
              const name = (match[1] || match[2]).trim();
              const url = match[3].trim();
              sources.push({ name, url });
            }
          });
        }
      }
      
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
      
      return {
        isTrue: verdictMatch ? verdictMatch[1].toUpperCase() === 'TRUE' : false,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided',
        historicalContext: contextMatch ? contextMatch[1].trim() : 'No historical context available for this statement',
        sources: sources.length > 0 ? sources : [],
        confidence
      };
    } catch (error) {
      console.error('Error checking fact with Perplexity:', error);
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
      isTrue: statement.length > 15 && statement.split(' ').length > 3, // Arbitrary logic for demo
      explanation: "Perplexity would search the web for the most recent information about this statement, providing specific and up-to-date verification.",
      historicalContext: "Perplexity would examine how this information has evolved recently and provide the latest context around this statement.",
      sources: [
        {
          name: "Recent News Source",
          url: "https://news-example.com/article"
        },
        {
          name: "Current Research",
          url: "https://research-example.org/paper"
        }
      ],
      confidence: 0.82
    };
  }
}

export const enhancedPerplexityService = new EnhancedPerplexityService();