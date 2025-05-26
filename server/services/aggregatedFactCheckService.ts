import { perplexityService } from './perplexityService';
import { FactCheckAggregator, TrustedSource } from './factCheckingServices';
import { statementProcessingService, ProcessedInput } from './statementProcessingService';
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
   * @param userInput The original user input (statement, question, or opinion)
   * @returns Aggregated result from multiple fact-checking services with processing context
   */
  async checkFact(userInput: string): Promise<{
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
    inputProcessing: {
      originalInput: string;
      inputType: string;
      verifiableStatement: string;
      processingContext: string;
      isFactCheckable: boolean;
    };
  }> {
    try {
      // Process the input to handle questions, opinions, and statements
      const processedInput: ProcessedInput = statementProcessingService.processInput(userInput);
      
      // If the input is not fact-checkable, return appropriate response
      if (!processedInput.isFactCheckable) {
        return {
          isTrue: false,
          explanation: `This appears to be ${processedInput.inputType === 'opinion' ? 'a subjective opinion' : 'a speculative claim'} rather than an objective fact that can be verified. ${processedInput.context}`,
          historicalContext: processedInput.reasoning,
          sources: [],
          confidenceScore: 0.1,
          serviceBreakdown: [],
          inputProcessing: {
            originalInput: processedInput.originalInput,
            inputType: processedInput.inputType,
            verifiableStatement: processedInput.verifiableStatement,
            processingContext: processedInput.context,
            isFactCheckable: processedInput.isFactCheckable
          }
        };
      }
      
      // Use the processed verifiable statement for fact-checking
      const statementToCheck = processedInput.verifiableStatement;
      
      // Get the aggregated results
      const aggregatedResult = await this.aggregator.aggregateFactCheck(statementToCheck);
      
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
      
      // Enhanced explanation that includes processing context
      let enhancedExplanation = aggregatedResult.explanation;
      
      if (processedInput.inputType === 'question') {
        enhancedExplanation = `**Original Question:** "${processedInput.originalInput}"\n\n**Converted Statement:** "${processedInput.verifiableStatement}"\n\n${aggregatedResult.explanation}`;
      } else if (processedInput.inputType === 'opinion' && processedInput.confidence < 0.8) {
        enhancedExplanation = `**Note:** This input contains subjective elements. We've focused on verifiable facts.\n\n${aggregatedResult.explanation}`;
      } else if (processedInput.inputType === 'speculative') {
        enhancedExplanation = `**Speculative Claim Analysis:** We've reframed this to focus on available evidence.\n\n${aggregatedResult.explanation}`;
      }

      return {
        isTrue: aggregatedResult.isTrue,
        explanation: enhancedExplanation,
        historicalContext: aggregatedResult.historicalContext,
        sources: formattedSources,
        confidenceScore: aggregatedResult.confidenceScore * processedInput.confidence, // Adjust confidence based on processing
        serviceBreakdown,
        inputProcessing: {
          originalInput: processedInput.originalInput,
          inputType: processedInput.inputType,
          verifiableStatement: processedInput.verifiableStatement,
          processingContext: processedInput.context,
          isFactCheckable: processedInput.isFactCheckable
        }
      };
    } catch (error) {
      console.error('Error in aggregated fact checking:', error);
      throw error;
    }
  }
}

export const aggregatedFactCheckService = new AggregatedFactCheckService();