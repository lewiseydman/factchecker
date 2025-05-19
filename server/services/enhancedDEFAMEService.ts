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
 * Enhanced DEFAME (Digital Evidence Forensics and Media Evaluation) service
 * This service specializes in detecting potential misinformation or misleading content
 * by analyzing patterns across multiple AI responses
 */
export class EnhancedDEFAMEService {
  /**
   * Analyzes responses from multiple AI services to detect potential misinformation
   * and assess overall reliability
   */
  async analyzeForMisinformation(statement: string): Promise<{
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: Source[];
    confidence: number;
    manipulationScore: number; // 0-1 scale, higher means more likely to be manipulative
    contradictionIndex: number; // 0-1 scale, higher means more contradictions between sources
    serviceSummary: {
      [key: string]: {
        verdict: string;
        confidence: number;
        reliabilityScore: number;
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
      
      // Calculate manipulation score based on linguistic patterns
      const manipulationScore = this.assessManipulationScore(statement);
      
      // Calculate contradiction index (how much services disagree with each other)
      const allResults = [claudeResult, openaiResult, perplexityResult];
      const trueCount = allResults.filter(result => result.isTrue).length;
      const falseCount = allResults.length - trueCount;
      const contradictionIndex = Math.min(trueCount, falseCount) / allResults.length * 2; // Scale to 0-1
      
      // Assess reliability of each service for this particular query
      const reliabilityScores = {
        'claude': this.calculateReliabilityScore(claudeResult, [openaiResult, perplexityResult]),
        'openai': this.calculateReliabilityScore(openaiResult, [claudeResult, perplexityResult]),
        'perplexity': this.calculateReliabilityScore(perplexityResult, [claudeResult, openaiResult])
      };
      
      // Calculate weighted verdict based on reliability
      let weightedTruthSum = 0;
      let totalWeight = 0;
      
      weightedTruthSum += claudeResult.isTrue ? reliabilityScores.claude : 0;
      weightedTruthSum += openaiResult.isTrue ? reliabilityScores.openai : 0;
      weightedTruthSum += perplexityResult.isTrue ? reliabilityScores.perplexity : 0;
      
      totalWeight = reliabilityScores.claude + reliabilityScores.openai + reliabilityScores.perplexity;
      
      // Determine final verdict based on weighted assessment
      const truthRatio = totalWeight > 0 ? weightedTruthSum / totalWeight : 0.5;
      const finalVerdict = truthRatio >= 0.5;
      
      // Calculate confidence based on contradiction and manipulation scores
      const confidence = Math.max(0.5, 1 - (contradictionIndex * 0.5 + manipulationScore * 0.5));
      
      // Generate explanation focused on potential misinformation
      const mainExplanation = this.generateMisinformationAnalysis(
        statement, 
        claudeResult, 
        openaiResult, 
        perplexityResult,
        manipulationScore,
        contradictionIndex
      );
      
      // Identify the most relevant historical context
      const historicalContext = this.identifyRelevantContext([
        claudeResult.historicalContext,
        openaiResult.historicalContext,
        perplexityResult.historicalContext
      ]);
      
      // Evaluate sources for credibility
      const evaluatedSources = this.evaluateSourceCredibility([
        ...claudeResult.sources,
        ...openaiResult.sources,
        ...perplexityResult.sources
      ]);
      
      // Create service summary with reliability scores
      const serviceSummary = {
        'Claude': {
          verdict: claudeResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: claudeResult.confidence,
          reliabilityScore: reliabilityScores.claude
        },
        'GPT': {
          verdict: openaiResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: openaiResult.confidence,
          reliabilityScore: reliabilityScores.openai
        },
        'Perplexity': {
          verdict: perplexityResult.isTrue ? 'TRUE' : 'FALSE',
          confidence: perplexityResult.confidence,
          reliabilityScore: reliabilityScores.perplexity
        }
      };
      
      return {
        isTrue: finalVerdict,
        explanation: mainExplanation,
        historicalContext,
        sources: evaluatedSources,
        confidence,
        manipulationScore,
        contradictionIndex,
        serviceSummary
      };
    } catch (error) {
      console.error('Error in DEFAME analysis:', error);
      throw error;
    }
  }
  
  /**
   * Assesses how likely the statement contains manipulative language
   */
  private assessManipulationScore(statement: string): number {
    // Look for manipulative linguistic patterns
    const manipulativePatterns = [
      /\balways\b/i,
      /\bnever\b/i,
      /\beveryone\b/i,
      /\bnobody\b/i,
      /\ball\b/i,
      /\bnone\b/i,
      /\bguaranteed\b/i,
      /\bproven\b/i,
      /\bundeniable\b/i,
      /\bexclusive\b/i,
      /\bonly\b/i,
      /\bsecret\b/i,
      /\bhidden\b/i,
      /\bthey don't want you to know\b/i,
      /\bexperts agree\b/i,
      /\bstudies show\b/i
    ];
    
    // Count matches
    let matches = 0;
    manipulativePatterns.forEach(pattern => {
      if (pattern.test(statement)) {
        matches++;
      }
    });
    
    // Calculate score (0-1)
    return Math.min(1, matches / 5); // Cap at 1
  }
  
  /**
   * Calculates a reliability score for a service based on how its response
   * compares with other services
   */
  private calculateReliabilityScore(
    serviceResult: AIServiceResult, 
    otherResults: AIServiceResult[]
  ): number {
    // Start with base reliability
    let reliability = 0.7;
    
    // Check if this service agrees with others
    const agreementCount = otherResults.filter(
      other => other.isTrue === serviceResult.isTrue
    ).length;
    
    // Adjust based on agreement
    reliability += (agreementCount / otherResults.length) * 0.2;
    
    // Adjust based on provided sources (more sources = more reliability)
    reliability += Math.min(0.1, serviceResult.sources.length * 0.02);
    
    // Cap at 0-1 range
    return Math.max(0, Math.min(1, reliability));
  }
  
  /**
   * Generates an analysis focused on potential misinformation
   */
  private generateMisinformationAnalysis(
    statement: string,
    claudeResult: AIServiceResult,
    openaiResult: AIServiceResult,
    perplexityResult: AIServiceResult,
    manipulationScore: number,
    contradictionIndex: number
  ): string {
    // Construct analysis based on detected patterns
    let analysis = "";
    
    analysis += `DEFAME analysis identified the following in this statement:\n\n`;
    
    // Comment on linguistic patterns
    if (manipulationScore > 0.5) {
      analysis += `✗ The statement contains potentially manipulative language patterns that could be misleading.\n`;
    } else {
      analysis += `✓ The statement uses mostly neutral language without manipulative patterns.\n`;
    }
    
    // Comment on contradictions between services
    if (contradictionIndex > 0.5) {
      analysis += `✗ There are significant contradictions between AI services in evaluating this statement.\n`;
    } else {
      analysis += `✓ AI services show general agreement in their evaluation of this statement.\n`;
    }
    
    // Add service-specific insights
    analysis += `\nIndividual service assessments:\n`;
    analysis += `- Claude: ${claudeResult.isTrue ? 'TRUE' : 'FALSE'} (confidence: ${(claudeResult.confidence * 100).toFixed(0)}%)\n`;
    analysis += `- GPT: ${openaiResult.isTrue ? 'TRUE' : 'FALSE'} (confidence: ${(openaiResult.confidence * 100).toFixed(0)}%)\n`;
    analysis += `- Perplexity: ${perplexityResult.isTrue ? 'TRUE' : 'FALSE'} (confidence: ${(perplexityResult.confidence * 100).toFixed(0)}%)\n`;
    
    // Add overall verdict explanation
    analysis += `\nConsidering the ${contradictionIndex > 0.3 ? 'contradictory' : 'consistent'} assessments and ${manipulationScore > 0.3 ? 'concerning language patterns' : 'neutral language'}, the statement appears to be ${manipulationScore > 0.5 || contradictionIndex > 0.5 ? 'potentially misleading' : 'generally reliable'}.\n`;
    
    return analysis;
  }
  
  /**
   * Identifies the most relevant historical context from multiple options
   */
  private identifyRelevantContext(contexts: string[]): string {
    // Filter valid contexts
    const validContexts = contexts.filter(ctx => ctx && ctx.length > 0);
    
    if (validContexts.length === 0) {
      return "No historical context available for evaluating potential misinformation.";
    }
    
    // For now, select the most detailed context
    return validContexts.sort((a, b) => b.length - a.length)[0];
  }
  
  /**
   * Evaluates sources for credibility and returns the most reliable ones
   */
  private evaluateSourceCredibility(sources: Source[]): Source[] {
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
    
    // Convert to array
    const sourceArray = Array.from(uniqueSources.values());
    
    // In a real system, we would evaluate each source's credibility
    // For now, just return the unique sources (maximum 5)
    return sourceArray.slice(0, 5);
  }
}

export const enhancedDEFAMEService = new EnhancedDEFAMEService();