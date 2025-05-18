import { Source } from "@shared/schema";

/**
 * Service to interact with the Perplexity API for fact checking
 */
export class PerplexityService {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai/chat/completions';
  private model: string = 'llama-3.1-sonar-small-128k-online';

  constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
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
  }> {
    try {
      const systemPrompt = `
        You are a professional fact-checker tasked with verifying the accuracy of statements.
        For the given statement, determine if it is TRUE or FALSE based on reliable sources.
        Follow these guidelines:
        1. Search for accurate, up-to-date information from credible sources
        2. Provide a clear verdict (TRUE or FALSE)
        3. Give a detailed explanation of your reasoning
        4. Provide historical context for the statement, especially if it relates to complex topics, events, or claims
        5. List all sources consulted with name and URL
        6. Be objective and thorough
        7. If the statement is partially true, determine if it's more TRUE or FALSE overall
        8. Format your response exactly as follows:
          VERDICT: [TRUE or FALSE]
          EXPLANATION: [detailed explanation]
          HISTORICAL CONTEXT: [relevant historical background that helps understand the statement]
          SOURCES: [list of sources]
      `;

      const userPrompt = `Fact check this statement: "${statement}"`;

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
      const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)(?=HISTORICAL CONTEXT:|SOURCES:|$)/i);
      const contextMatch = content.match(/HISTORICAL CONTEXT:\s*([\s\S]*?)(?=SOURCES:|$)/i);
      
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
            const match = sourceText.match(/(?:"([^"]+)"|([^,]+))(?:,\s*|\s+)(?:URL:)?\s*(\bhttps?:\/\/\S+\b)/i);
            if (match) {
              const name = (match[1] || match[2]).trim();
              const url = match[3].trim();
              sources.push({ name, url });
            }
          });
        }
      }
      
      return {
        isTrue: verdictMatch ? verdictMatch[1].toUpperCase() === 'TRUE' : false,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided',
        historicalContext: contextMatch ? contextMatch[1].trim() : 'No historical context available for this statement',
        sources: sources.length > 0 ? sources : []
      };
    } catch (error) {
      console.error('Error checking fact:', error);
      throw error;
    }
  }
}

export const perplexityService = new PerplexityService();