/**
 * Question Transform Service
 * 
 * This service handles converting questions into factual statements
 * that can be verified by the fact-checking system.
 */
import { claudeService } from "./claudeService";
import { openAIService } from "./openaiService";
import { enhancedPerplexityService } from "./enhancedPerplexityService";

interface TransformationResult {
  originalQuestion: string;
  transformedStatement: string;
  implicitClaims: string[];
  confidence: number;
}

export class QuestionTransformService {
  /**
   * Transform a question into a factual statement that can be verified
   * 
   * @param question The user's question
   * @returns Object with the transformed statement and metadata
   */
  async transformQuestionToStatement(question: string): Promise<TransformationResult> {
    // For now, we'll use a simulated transformation since API keys aren't set up
    // In production, this would use the actual AI services

    try {
      // We'll simulate what would happen with real AI services
      const transformedStatement = await this.simulateTransformation(question);
      const implicitClaims = await this.extractImplicitClaims(question);
      
      return {
        originalQuestion: question,
        transformedStatement,
        implicitClaims,
        confidence: 0.85 // Confidence in the transformation
      };
    } catch (error) {
      console.error("Error transforming question:", error);
      
      // Fallback transformation for when AI services fail
      return this.fallbackTransformation(question);
    }
  }

  /**
   * Extracts multiple implicit claims that might be present in a question
   * 
   * @param question The user's question
   * @returns Array of implicit claims
   */
  private async extractImplicitClaims(question: string): Promise<string[]> {
    // This would use an AI service in production
    return this.simulateImplicitClaimsExtraction(question);
  }

  /**
   * Simulates question transformation for development purposes
   * Will be replaced by actual AI call in production
   */
  private async simulateTransformation(question: string): Promise<string> {
    // Simple rule-based transformations for common question patterns
    question = question.trim();
    
    // Remove question mark
    if (question.endsWith('?')) {
      question = question.slice(0, -1);
    }
    
    // Transform common question starters
    if (/^is /i.test(question)) {
      return question;
    } else if (/^are /i.test(question)) {
      return question;
    } else if (/^does /i.test(question)) {
      return question.replace(/^does /i, '');
    } else if (/^do /i.test(question)) {
      return question.replace(/^do /i, '');
    } else if (/^did /i.test(question)) {
      return question.replace(/^did /i, '');
    } else if (/^has /i.test(question)) {
      return question;
    } else if (/^have /i.test(question)) {
      return question;
    } else if (/^can /i.test(question)) {
      return question;
    } else if (/^could /i.test(question)) {
      return question;
    } else if (/^will /i.test(question)) {
      return question;
    } else if (/^would /i.test(question)) {
      return question;
    }
    
    // For "wh" questions, try to extract the core claim
    if (/^(what|when|where|who|why|how) /i.test(question)) {
      if (question.toLowerCase().includes(' is ')) {
        // Extract part after "is"
        const parts = question.split(' is ');
        if (parts.length > 1) {
          return parts.slice(1).join(' is ');
        }
      }
      
      // More complex wh-questions would need AI transformation
      return `The statement implied in the question "${question}" is factual`;
    }
    
    // Default for questions we can't easily transform
    return `The information requested in "${question}" is accurate`;
  }

  /**
   * Simulates extracting implicit claims
   * Will be replaced by actual AI call in production
   */
  private simulateImplicitClaimsExtraction(question: string): string[] {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Example pattern matching for common implicit claims
    if (lowerQuestion.includes('covid') || lowerQuestion.includes('vaccine')) {
      return [
        "COVID-19 vaccines are generally safe and effective",
        "COVID-19 is a serious disease"
      ];
    }
    
    if (lowerQuestion.includes('climate change') || lowerQuestion.includes('global warming')) {
      return [
        "Climate change is occurring and primarily caused by human activities",
        "Climate change has significant environmental impacts"
      ];
    }
    
    if (lowerQuestion.includes('moon landing')) {
      return [
        "The Apollo moon landings occurred as reported by NASA",
        "There is a conspiracy theory claiming the moon landings were faked"
      ];
    }
    
    // Default case
    return ["The implicit claim requires verification"];
  }

  /**
   * Fallback transformation when AI services are unavailable
   */
  private fallbackTransformation(question: string): TransformationResult {
    return {
      originalQuestion: question,
      transformedStatement: question.replace(/\?$/, ''),
      implicitClaims: ["This statement requires verification"],
      confidence: 0.5
    };
  }
}

export const questionTransformService = new QuestionTransformService();