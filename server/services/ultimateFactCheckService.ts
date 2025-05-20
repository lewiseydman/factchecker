import { Source } from "@shared/schema";
import { enhancedInFactService } from "./enhancedInFactService";
import { enhancedDEFAMEService } from "./enhancedDEFAMEService";
import { domainDetectionService, Domain } from "./domainDetectionService";
import { questionTransformService } from "./questionTransformService";

/**
 * Ultimate Fact Check Service
 * 
 * This service combines the results from InFact (factual information) and 
 * DEFAME (misinformation detection) to provide the most comprehensive
 * fact-checking result possible.
 */
export class UltimateFactCheckService {
  /**
   * Initialize the service clients with API keys
   */
  initializeServices(apiKeys: {
    claude?: string;
    openai?: string;
    perplexity?: string;
  }): void {
    // This method would initialize all the underlying services
    // when you're ready to add your API keys
  }
  
  /**
   * Performs the ultimate fact check using a two-layer approach:
   * 1. Multiple AI services check the fact (Claude, GPT, Perplexity)
   * 2. Two specialized systems analyze these results (InFact, DEFAME)
   */
  async checkFact(statement: string): Promise<{
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidenceScore: number;
    serviceBreakdown: Array<{
      name: string;
      verdict: string;
      confidence: number;
    }>;
    factualConsensus: number;
    manipulationScore: number;
    contradictionIndex: number;
  }> {
    try {
      // Get results from both specialized systems
      const [inFactResult, defameResult] = await Promise.all([
        enhancedInFactService.aggregateFactCheckInfo(statement),
        enhancedDEFAMEService.analyzeForMisinformation(statement)
      ]);
      
      // Calculate final truth value balancing factual accuracy and manipulation detection
      // We weigh InFact more heavily for factual determination (60%) and DEFAME for confidence (40%)
      const weightedTruthValue = (inFactResult.isTrue ? 0.6 : 0) + (defameResult.isTrue ? 0.4 : 0);
      const finalVerdict = weightedTruthValue >= 0.5;
      
      // Calculate final confidence considering both factual confidence and manipulation detection
      // Lower confidence when manipulation is detected or contradictions are high
      let finalConfidence = (inFactResult.confidence * 0.6) + (defameResult.confidence * 0.4);
      // Reduce confidence if high manipulation or contradiction
      finalConfidence *= (1 - (defameResult.manipulationScore * 0.3));
      finalConfidence *= (1 - (defameResult.contradictionIndex * 0.3));
      
      // Combine explanations to highlight both factual information and potential manipulation
      const combinedExplanation = this.combineExplanations(
        inFactResult.explanation, 
        defameResult.explanation,
        defameResult.manipulationScore,
        inFactResult.factualConsensus
      );
      
      // Get the most relevant historical context
      const historicalContext = this.selectBestContext(
        inFactResult.historicalContext,
        defameResult.historicalContext
      );
      
      // Consolidate sources from both systems, prioritizing more credible ones
      const consolidatedSources = this.prioritizeSources(
        inFactResult.sources,
        defameResult.sources
      );
      
      // Create service breakdown for UI display
      const serviceBreakdown = [
        {
          name: "Claude",
          verdict: inFactResult.serviceSummary["Claude"].verdict,
          confidence: inFactResult.serviceSummary["Claude"].confidence
        },
        {
          name: "GPT",
          verdict: inFactResult.serviceSummary["GPT"].verdict,
          confidence: inFactResult.serviceSummary["GPT"].confidence
        },
        {
          name: "Perplexity",
          verdict: inFactResult.serviceSummary["Perplexity"].verdict,
          confidence: inFactResult.serviceSummary["Perplexity"].confidence
        }
      ];
      
      return {
        isTrue: finalVerdict,
        explanation: combinedExplanation,
        historicalContext,
        sources: consolidatedSources,
        confidenceScore: finalConfidence,
        serviceBreakdown,
        factualConsensus: inFactResult.factualConsensus,
        manipulationScore: defameResult.manipulationScore,
        contradictionIndex: defameResult.contradictionIndex
      };
    } catch (error) {
      console.error('Error in ultimate fact check:', error);
      throw error;
    }
  }
  
  /**
   * Combines explanations from both systems into one comprehensive explanation
   */
  private combineExplanations(
    factualExplanation: string,
    misinformationExplanation: string,
    manipulationScore: number,
    factualConsensus: number
  ): string {
    let combined = "## Multi-System Fact Check Result\n\n";
    
    // Add factual assessment
    combined += "### Factual Assessment\n";
    combined += factualExplanation + "\n\n";
    
    // Add manipulation assessment if significant
    if (manipulationScore > 0.3) {
      combined += "### Misinformation Analysis\n";
      combined += misinformationExplanation + "\n\n";
    }
    
    // Add conclusion that weighs both aspects
    combined += "### Conclusion\n";
    if (factualConsensus > 0.7 && manipulationScore < 0.3) {
      combined += "The statement appears to be factually sound with strong agreement across multiple AI systems and no significant manipulative language patterns detected.";
    } else if (factualConsensus < 0.3 && manipulationScore < 0.3) {
      combined += "The statement appears to be factually incorrect with strong agreement across multiple AI systems, though no significant manipulative language patterns were detected.";
    } else if (factualConsensus > 0.7 && manipulationScore > 0.3) {
      combined += "While the core facts of the statement appear accurate, our analysis detected potentially misleading language patterns that could affect interpretation.";
    } else if (factualConsensus < 0.3 && manipulationScore > 0.3) {
      combined += "The statement appears to be factually incorrect and contains potentially misleading language patterns.";
    } else {
      combined += "The statement contains mixed factual elements with some disagreement between AI systems. Exercise caution and consult additional sources.";
    }
    
    return combined;
  }
  
  /**
   * Selects the most relevant historical context
   */
  private selectBestContext(context1: string, context2: string): string {
    // Prioritize longer, more detailed context
    if (!context1 || context1.length < 20) return context2;
    if (!context2 || context2.length < 20) return context1;
    
    return context1.length > context2.length ? context1 : context2;
  }
  
  /**
   * Prioritizes sources from both systems, removing duplicates
   */
  private prioritizeSources(sources1: Source[], sources2: Source[]): Source[] {
    // Combine all sources
    const allSources = [...sources1, ...sources2];
    
    // Remove duplicates by URL
    const uniqueSources = new Map<string, Source>();
    allSources.forEach(source => {
      if (source.url && !uniqueSources.has(source.url)) {
        uniqueSources.set(source.url, source);
      }
    });
    
    // Return as array (max 5 sources)
    return Array.from(uniqueSources.values()).slice(0, 5);
  }
}

export const ultimateFactCheckService = new UltimateFactCheckService();