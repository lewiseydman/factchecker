import { Source } from '@shared/schema';
import { questionTransformService } from './questionTransformService';
import { domainDetectionService } from './domainDetectionService';
import { enhancedPerplexityService } from './enhancedPerplexityService';
import { claudeService } from './claudeService';
import { openAIService } from './openaiService';
import { geminiService } from './geminiService';
import { mistralService } from './mistralService';
import { llamaService } from './llamaService';
import { enhancedInFactService } from './enhancedInFactService';
import { enhancedDEFAMEService } from './enhancedDEFAMEService';
import { apiKeyManager } from './apiKeyManager';

/**
 * Unified service that processes both questions and statements
 * and leverages multiple AI models with domain-specific weighting
 */
export class UltimateFactCheckService {
  
  /**
   * Initialize all services with provided API keys
   */
  initializeServices(apiKeys: {
    claude?: string | null;
    openai?: string | null;
    perplexity?: string | null;
    gemini?: string | null;
    mistral?: string | null;
    llama?: string | null;
  }): void {
    if (apiKeys.claude) claudeService.initializeClient(apiKeys.claude);
    if (apiKeys.openai) openAIService.initializeClient(apiKeys.openai);
    if (apiKeys.perplexity) enhancedPerplexityService.initializeClient(apiKeys.perplexity);
    if (apiKeys.gemini) geminiService.initializeClient(apiKeys.gemini);
    if (apiKeys.mistral) mistralService.initializeClient(apiKeys.mistral);
    if (apiKeys.llama) llamaService.initializeClient(apiKeys.llama);
  }
  
  /**
   * Process user input with a specific number of models based on subscription tier
   */
  async processInputWithModels(input: string, modelCount: number = 6): Promise<{
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
    isQuestion: boolean;
    transformedStatement?: string;
    implicitClaims?: string[];
    domainInfo?: {
      detectedDomains: string[];
      modelWeights: Record<string, number>;
      explanation: string;
    };
  }> {
    // This internal implementation will be using the specific number of models
    return this._processInputInternal(input, modelCount);
  }

  /**
   * Process user input (statement or question) and perform fact checking
   * Default implementation using all available models
   */
  async processInput(input: string): Promise<{
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
    isQuestion: boolean;
    transformedStatement?: string;
    implicitClaims?: string[];
    domainInfo?: {
      detectedDomains: string[];
      modelWeights: Record<string, number>;
      explanation: string;
    };
  }> {
    // Use the internal implementation with all available models (6)
    return this._processInputInternal(input, 6);
  }

  /**
   * Internal method to process input with a specific number of models
   * This is the core implementation that both public methods use
   */
  private async _processInputInternal(input: string, modelCount: number = 6): Promise<{
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
    isQuestion: boolean;
    transformedStatement?: string;
    implicitClaims?: string[];
    domainInfo?: {
      detectedDomains: string[];
      modelWeights: Record<string, number>;
      explanation: string;
    };
  }> {
    console.log("Processing input:", input);
    
    // Step 1: Determine if input is a question
    const isQuestion = domainDetectionService.isQuestion(input);
    let statement = input;
    let implicitClaims: string[] = [];
    
    // Step 2: Transform questions into statements if needed
    if (isQuestion) {
      const transformation = await questionTransformService.transformToStatement(input);
      statement = transformation.statement;
      implicitClaims = transformation.implicitClaims;
      console.log("Transformed question to statement:", statement);
    }
    
    // Step 3: Detect domains in the statement
    const detectedDomains = domainDetectionService.detectDomains(statement);
    console.log("Detected domains:", detectedDomains);
    
    // Step 4: Calculate weights for AI models based on their domain strengths
    const modelWeights = domainDetectionService.calculateModelWeights(detectedDomains);
    console.log("Model weights:", modelWeights);
    
    // Step 5: Generate weight explanation
    const weightExplanation = domainDetectionService.getWeightExplanation(detectedDomains, modelWeights);
    
    // Step 6: Gather available API keys and prepare services list
    const allPossibleServices = [
      {
        name: "Claude",
        service: claudeService,
        weight: modelWeights.claude,
        hasRealKey: apiKeyManager.hasKey('claude')
      },
      {
        name: "GPT-4",
        service: openAIService,
        weight: modelWeights.openai,
        hasRealKey: apiKeyManager.hasKey('openai')
      },
      {
        name: "Perplexity",
        service: enhancedPerplexityService,
        weight: modelWeights.perplexity,
        hasRealKey: apiKeyManager.hasKey('perplexity')
      },
      {
        name: "Gemini",
        service: geminiService,
        weight: modelWeights.gemini,
        hasRealKey: apiKeyManager.hasKey('gemini')
      },
      {
        name: "Mistral",
        service: mistralService,
        weight: modelWeights.mistral,
        hasRealKey: apiKeyManager.hasKey('mistral')
      },
      {
        name: "Llama",
        service: llamaService,
        weight: modelWeights.llama,
        hasRealKey: apiKeyManager.hasKey('llama')
      }
    ];
    
    // Sort services by weight to prioritize the most relevant ones
    allPossibleServices.sort((a, b) => b.weight - a.weight);
    
    // Limit to the specified model count (based on subscription tier)
    const availableServices = allPossibleServices.slice(0, modelCount);
    
    // Step 7: Run fact-checking in parallel with all available services
    const serviceResults = await Promise.all(
      availableServices.map(async ({ name, service, weight, hasRealKey }) => {
        try {
          const result = await service.checkFact(statement);
          return {
            name,
            isTrue: result.isTrue,
            explanation: result.explanation,
            historicalContext: result.historicalContext,
            sources: result.sources,
            confidence: result.confidence,
            weight,
            hasRealKey
          };
        } catch (error) {
          console.error(`Error with ${name} service:`, error);
          // Return fallback result if a service fails
          return {
            name,
            isTrue: false,
            explanation: `Error: ${name} service could not process this statement.`,
            historicalContext: "",
            sources: [],
            confidence: 0.5,
            weight,
            hasRealKey: false
          };
        }
      })
    );
    
    // Step 8: Process results through InFact (factual consensus) layer
    const inFactResult = await enhancedInFactService.aggregateFactCheckInfo(statement);
    
    // Step 9: Process results through DEFAME (misinformation detection) layer
    const defameResult = await enhancedDEFAMEService.analyzeForMisinformation(statement);
    
    // Step 10: Create service breakdown for UI display with normalized confidence
    const totalConfidence = serviceResults.reduce((sum, result) => sum + result.confidence, 0);
    const serviceBreakdown = serviceResults.map(result => ({
      name: result.name,
      verdict: result.isTrue ? "TRUE" : "FALSE",
      confidence: totalConfidence > 0 ? (result.confidence / totalConfidence) : (1 / serviceResults.length)
    }));
    
    // Step 11: Calculate final verdict and confidence by weighted average
    let weightedTrueScore = 0;
    let totalWeight = 0;
    
    for (const result of serviceResults) {
      const effectiveWeight = result.weight * (result.hasRealKey ? 1 : 0.7); // Give more weight to services with real API keys
      weightedTrueScore += (result.isTrue ? 1 : 0) * effectiveWeight;
      totalWeight += effectiveWeight;
    }
    
    const weightedIsTrue = weightedTrueScore / totalWeight > 0.5;
    
    // Calculate average confidence score (simple average to ensure it stays between 0-1)
    let totalConfidence = 0;
    for (const result of serviceResults) {
      totalConfidence += result.confidence;
    }
    const confidenceScore = serviceResults.length > 0 ? totalConfidence / serviceResults.length : 0.5;
    
    // Step 12: Return comprehensive results
    return {
      isTrue: weightedIsTrue,
      explanation: inFactResult.consolidatedExplanation,
      historicalContext: inFactResult.bestHistoricalContext,
      sources: inFactResult.consolidatedSources,
      confidenceScore,
      serviceBreakdown,
      // Advanced analysis
      factualConsensus: inFactResult.factualConsensus,
      manipulationScore: defameResult.manipulationScore,
      contradictionIndex: defameResult.contradictionIndex,
      isQuestion,
      transformedStatement: isQuestion ? statement : undefined,
      implicitClaims: implicitClaims.length > 0 ? implicitClaims : undefined,
      domainInfo: {
        detectedDomains: detectedDomains,
        modelWeights,
        explanation: weightExplanation
      }
    };
  }
}

export const ultimateFactCheckService = new UltimateFactCheckService();