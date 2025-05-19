import { Source } from "@shared/schema";
import { claudeService } from "./claudeService";
import { openAIService } from "./openaiService";
import { enhancedPerplexityService } from "./enhancedPerplexityService";

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
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidence: number;
    factualConsensus: number; // 0-1 scale showing agreement on facts
    serviceSummary: {
      [key: string]: {
        verdict: string;
        confidence: number;
      }
    }
  }> {
    try {
      // Collect results from all three AI services
      const [claudeResult, openaiResult, perplexityResult] = await Promise.all([
        claudeService.checkFact(statement),
        openAIService.checkFact(statement),
        enhancedPerplexityService.checkFact(statement)
      ]);
      
      // Calculate the factual consensus score (how much the services agree)
      const allResults = [claudeResult, openaiResult, perplexityResult];
      const trueCount = allResults.filter(result => result.isTrue).length;
      const factualConsensus = trueCount / allResults.length;
      
      // Calculate consensus confidence using weighted average
      let weightedConfidenceSum = 0;
      let totalConfidenceWeight = 0;
      
      allResults.forEach(result => {
        weightedConfidenceSum += result.confidence;
        totalConfidenceWeight += 1;
      });
      
      const confidenceScore = totalConfidenceWeight > 0 
        ? weightedConfidenceSum / totalConfidenceWeight 
        : 0.5;
      
      // Determine verdict based on majority and confidence
      const finalVerdict = factualConsensus >= 0.5;
      
      // Consolidate explanations
      const mainExplanation = this.consolidateExplanations(
        claudeResult.explanation,
        openaiResult.explanation,
        perplexityResult.explanation
      );
      
      // Select the most detailed historical context
      const historicalContext = this.selectBestHistoricalContext([
        claudeResult.historicalContext,
        openaiResult.historicalContext,
        perplexityResult.historicalContext
      ]);
      
      // Consolidate sources and remove duplicates
      const consolidatedSources = this.consolidateSources([
        ...claudeResult.sources,
        ...openaiResult.sources,
        ...perplexityResult.sources
      ]);
      
      // Create summary of each service's assessment
      const serviceSummary = {
        'Claude': {
          verdict: claudeResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: claudeResult.confidence
        },
        'GPT': {
          verdict: openaiResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: openaiResult.confidence
        },
        'Perplexity': {
          verdict: perplexityResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: perplexityResult.confidence
        }
      };
      
      return {
        isTrue: finalVerdict,
        explanation: mainExplanation,
        historicalContext,
        sources: consolidatedSources,
        confidence: confidenceScore,
        factualConsensus: Math.max(factualConsensus, 1 - factualConsensus), // Make it reflect strength of consensus either way
        serviceSummary
      };
    } catch (error) {
      console.error('Error in InFact aggregation:', error);
      throw error;
    }
  }
  
  /**
   * Combines explanations from multiple sources into one coherent explanation
   */
  private consolidateExplanations(...explanations: string[]): string {
    // Filter out empty explanations
    const validExplanations = explanations.filter(exp => exp && exp.length > 0);
    
    if (validExplanations.length === 0) {
      return "No explanation available.";
    }
    
    // For now, a simple implementation that highlights points of agreement
    return "Analysis of factual information from multiple AI sources:\n\n" + 
      validExplanations.map((exp, i) => {
        const source = i === 0 ? "Claude" : i === 1 ? "GPT" : "Perplexity";
        return `${source}: ${exp}`;
      }).join("\n\n");
  }
  
  /**
   * Selects the most detailed and informative historical context
   */
  private selectBestHistoricalContext(contexts: string[]): string {
    // Filter valid contexts
    const validContexts = contexts.filter(ctx => ctx && ctx.length > 0);
    
    if (validContexts.length === 0) {
      return "No historical context available.";
    }
    
    // Select the longest (presumably most detailed) context
    return validContexts.sort((a, b) => b.length - a.length)[0];
  }
  
  /**
   * Consolidates sources from multiple services and removes duplicates
   */
  private consolidateSources(sources: Source[]): Source[] {
    if (!sources || sources.length === 0) {
      return [];
    }
    
    // Remove duplicates by URL
    const uniqueSources = new Map<string, Source>();
    
    sources.forEach(source => {
      if (source.url && !uniqueSources.has(source.url)) {
        uniqueSources.set(source.url, source);
      }
    });
    
    // Return as array and limit to top 5 sources
    return Array.from(uniqueSources.values()).slice(0, 5);
  }
}

export const enhancedInFactService = new EnhancedInFactService();