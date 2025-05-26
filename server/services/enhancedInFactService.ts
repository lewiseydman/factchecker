import { Source } from '@shared/schema';
import { InFactService } from './factCheckingServices';

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
    // Get authentic database verification results
    const authenticResults = await this.getAuthenticDatabaseVerification(statement);
    
    // If we have authentic results, use them; otherwise abstain
    if (authenticResults.length === 0) {
      return {
        consolidatedExplanation: "InFact abstains from verification - no matching records found in authoritative databases for this specific claim.",
        bestHistoricalContext: "Database verification requires specific, factual claims that can be cross-referenced with authoritative sources.",
        consolidatedSources: [
          { name: "NASA Open Data Portal", url: "https://api.nasa.gov" },
          { name: "Wikidata Knowledge Base", url: "https://www.wikidata.org" },
          { name: "Google Fact Check Tools", url: "https://toolbox.google.com/factcheck/" }
        ],
        factualConsensus: 0.5 // Neutral when abstaining
      };
    }

    // Use authentic database results
    const consolidatedExplanation = this.consolidateExplanations(
      ...authenticResults.map(result => result.explanation)
    );
    
    const bestHistoricalContext = this.selectBestHistoricalContext(
      authenticResults.map(result => result.historicalContext)
    );
    
    const allSources = authenticResults.flatMap(result => result.sources);
    const consolidatedSources = this.consolidateSources(allSources);
    
    // Calculate factual consensus (agreement between authentic services)
    const verdicts = authenticResults.map(result => result.isTrue);
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
   * Get verification results from authentic database sources
   */
  private async getAuthenticDatabaseVerification(statement: string): Promise<AIServiceResult[]> {
    const results: AIServiceResult[] = [];

    try {
      // Try NASA verification for space/science statements
      const nasaResult = await nasaService.checkFact(statement);
      if (nasaResult) {
        results.push({
          isTrue: nasaResult.isTrue,
          explanation: nasaResult.explanation,
          historicalContext: nasaResult.historicalContext,
          sources: nasaResult.sources,
          confidence: nasaResult.confidence
        });
      }

      // Try Wikidata verification for general factual claims
      const wikidataResult = await wikidataService.checkFact(statement);
      if (wikidataResult) {
        results.push({
          isTrue: wikidataResult.isTrue,
          explanation: wikidataResult.explanation,
          historicalContext: wikidataResult.historicalContext,
          sources: wikidataResult.sources,
          confidence: wikidataResult.confidence
        });
      }

      // Try Google Fact Check for previously fact-checked claims
      const googleResult = await googleFactCheckService.checkFact(statement);
      if (googleResult) {
        results.push({
          isTrue: googleResult.isTrue,
          explanation: googleResult.explanation,
          historicalContext: googleResult.historicalContext,
          sources: googleResult.sources,
          confidence: googleResult.confidence
        });
      }

    } catch (error) {
      console.error("Error getting authentic database verification:", error);
    }

    return results;
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