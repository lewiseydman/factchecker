import { perplexityService } from './perplexityService';
import { FactCheckAggregator, TrustedSource } from './factCheckingServices';
import { Source } from '@shared/schema';

/**
 * AggregatedFactCheckService
 * Service that combines multiple fact-checking sources into a single unified result
 */
export class AggregatedFactCheckService {
  private aggregator: FactCheckAggregator;
  
  constructor() {
    this.aggregator = new FactCheckAggregator(perplexityService);
  }
  
  /**
   * Check if a statement is factually correct using multiple services
   * @param statement The statement to check
   * @returns Aggregated result from multiple fact-checking services
   */
  async checkFact(statement: string): Promise<{
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidenceScore: number;
    serviceBreakdown: {
      name: string;
      verdict: string;
      confidence: number;
    }[];
  }> {
    try {
      // Get the aggregated results
      const aggregatedResult = await this.aggregator.aggregateFactCheck(statement);
      
      // Format source display to top 3 most trusted sources
      const formattedSources = aggregatedResult.sources.map(source => ({
        name: source.name,
        url: source.url
      }));
      
      // Create a breakdown of each service's result
      const serviceBreakdown = aggregatedResult.individualResults.map(result => ({
        name: result.serviceUsed,
        verdict: result.isTrue ? 'TRUE' : 'FALSE',
        confidence: result.confidence || 0.5
      }));
      
      return {
        isTrue: aggregatedResult.isTrue,
        explanation: aggregatedResult.explanation,
        historicalContext: aggregatedResult.historicalContext,
        sources: formattedSources,
        confidenceScore: aggregatedResult.confidenceScore,
        serviceBreakdown
      };
    } catch (error) {
      console.error('Error in aggregated fact checking:', error);
      throw error;
    }
  }
}

export const aggregatedFactCheckService = new AggregatedFactCheckService();