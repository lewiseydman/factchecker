import { Source } from '@shared/schema';

/**
 * Interface for the result from any AI service
 */
interface AIServiceResult {
  isTrue: boolean;
  explanation: string;
  historicalContext: string;
  sources: Source[];
  confidence: number;
}

/**
 * Enhanced InFact service
 * This service aggregates and analyzes factual information from multiple AI sources
 * focusing on consolidating facts and identifying consensus
 */
export class EnhancedInFactService {
  /**
   * Aggregates factual information from multiple AI services
   * and produces a consolidated assessment
   */
  async aggregateFactCheckInfo(statement: string): Promise<{
    consolidatedExplanation: string;
    bestHistoricalContext: string;
    consolidatedSources: Source[];
    factualConsensus: number;
  }> {
    // Simulate analyzing statement with multiple services
    // This would normally come from actual API calls to multiple services
    const simulatedResults: AIServiceResult[] = [
      {
        isTrue: statement.toLowerCase().includes("false") ? false : Math.random() > 0.3,
        explanation: `Service 1 explanation for "${statement}"`,
        historicalContext: `Historical background for the statement "${statement}" from service 1.`,
        sources: [
          { name: "Source 1A", url: "https://example.com/1a" },
          { name: "Source 1B", url: "https://example.com/1b" }
        ],
        confidence: 0.82
      },
      {
        isTrue: statement.toLowerCase().includes("false") ? false : Math.random() > 0.4,
        explanation: `Service 2 explanation for "${statement}"`,
        historicalContext: `A more detailed historical context about "${statement}" including relevant dates and events.`,
        sources: [
          { name: "Source 2A", url: "https://example.com/2a" },
          { name: "Source 2B", url: "https://example.com/2b" },
          { name: "Source 2C", url: "https://example.com/2c" }
        ],
        confidence: 0.76
      },
      {
        isTrue: statement.toLowerCase().includes("false") ? false : Math.random() > 0.2,
        explanation: `Service 3 explanation for "${statement}"`,
        historicalContext: `Brief historical notes about "${statement}".`,
        sources: [
          { name: "Source 3A", url: "https://example.com/3a" },
          { name: "Source 3B", url: "https://example.com/3b" }
        ],
        confidence: 0.91
      }
    ];

    const consolidatedExplanation = this.consolidateExplanations(
      ...simulatedResults.map(result => result.explanation)
    );
    
    const bestHistoricalContext = this.selectBestHistoricalContext(
      simulatedResults.map(result => result.historicalContext)
    );
    
    const allSources = simulatedResults.flatMap(result => result.sources);
    const consolidatedSources = this.consolidateSources(allSources);
    
    // Calculate factual consensus (agreement between services)
    const verdicts = simulatedResults.map(result => result.isTrue);
    const trueCount = verdicts.filter(v => v).length;
    const factualConsensus = trueCount / verdicts.length;
    
    return {
      consolidatedExplanation,
      bestHistoricalContext,
      consolidatedSources,
      factualConsensus
    };
  }
  
  /**
   * Combines explanations from multiple sources into one coherent explanation
   */
  private consolidateExplanations(...explanations: string[]): string {
    // Filter out explanations that are too short or contain [SIMULATED]
    const validExplanations = explanations
      .filter(exp => exp.length > 15 && !exp.includes('[SIMULATED'))
      .map(exp => exp.trim());
    
    if (validExplanations.length === 0) {
      return "Multiple AI services analyzed this statement, but detailed explanations require API keys to be provided.";
    }
    
    // Use the longest explanation as the base
    const baseExplanation = validExplanations.sort((a, b) => b.length - a.length)[0];
    
    return baseExplanation;
  }
  
  /**
   * Selects the most detailed and informative historical context
   */
  private selectBestHistoricalContext(contexts: string[]): string {
    // Filter out contexts that are too short or contain [SIMULATED]
    const validContexts = contexts
      .filter(ctx => ctx.length > 15 && !ctx.includes('[SIMULATED'))
      .map(ctx => ctx.trim());
    
    if (validContexts.length === 0) {
      return "Historical context is available with API keys for the knowledge services.";
    }
    
    // Choose the longest context as it's likely the most detailed
    return validContexts.sort((a, b) => b.length - a.length)[0];
  }
  
  /**
   * Consolidates sources from multiple services and removes duplicates
   */
  private consolidateSources(sources: Source[]): Source[] {
    const uniqueSources: Record<string, Source> = {};
    
    // Remove duplicate sources by URL
    for (const source of sources) {
      // Normalize URL by removing trailing slashes and query parameters
      const normalizedUrl = source.url.replace(/\/$/, '').split('?')[0];
      
      // If we haven't seen this source yet or the current one has a longer name
      if (!uniqueSources[normalizedUrl] || 
          source.name.length > uniqueSources[normalizedUrl].name.length) {
        uniqueSources[normalizedUrl] = {
          name: source.name,
          url: source.url
        };
      }
    }
    
    // Convert back to array and sort by name
    return Object.values(uniqueSources)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const enhancedInFactService = new EnhancedInFactService();