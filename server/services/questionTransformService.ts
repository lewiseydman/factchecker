/**
 * Question Transform Service
 * 
 * This service transforms questions into verifiable statements
 * and extracts implicit claims from questions. It handles both
 * typed and voice input, with special handling for speech recognition
 * output that may include filler words or incomplete phrases.
 */

export class QuestionTransformService {
  /**
   * Clean up input text, especially for speech-to-text input
   * @param input The raw input text
   * @returns Cleaned input text
   */
  cleanInput(input: string): string {
    return input
      .trim()
      .replace(/\?+$/, '') // Remove question marks
      .replace(/^(um|uh|er|like|so)\s+/i, '') // Remove common speech filler words at beginning
      .replace(/\s+(um|uh|er|like)\s+/g, ' ') // Remove filler words in the middle
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Detect if input is a question or a statement
   * @param input The input text
   * @returns Boolean indicating if input is a question
   */
  isQuestion(input: string): boolean {
    // Check for question mark
    if (input.trim().endsWith('?')) return true;
    
    // Check for question words
    const questionStarters = [
      /^(is|are|was|were|do|does|did|has|have|had|can|could|will|would|should|may|might)\s/i,
      /^(what|who|where|when|why|how|which|whose)\s/i
    ];
    
    return questionStarters.some(pattern => pattern.test(input.trim()));
  }
  
  /**
   * Transform a question into a verifiable statement
   * @param input The question to transform
   * @returns Object with transformed statement and array of implicit claims
   */
  async transformToStatement(input: string): Promise<{
    statement: string;
    implicitClaims: string[];
    wasQuestion: boolean;
  }> {
    const cleanQuestion = this.cleanInput(input);
    const wasQuestion = this.isQuestion(cleanQuestion);
    
    // If it's already a statement, return it as is
    if (!wasQuestion) {
      return {
        statement: cleanQuestion,
        implicitClaims: [],
        wasQuestion: false
      };
    }
    
    // Common question patterns and their transformations
    const patterns = [
      // Yes/No questions
      {
        regex: /^(is|are|was|were|do|does|did|has|have|had|can|could|will|would|should|may|might)\s(.+)/i,
        transform: (match: RegExpMatchArray) => `${match[2]} ${match[1] === 'is' ? 'is' : match[1] === 'are' ? 'are' : 'does'} true`
      },
      // What is/are questions
      {
        regex: /^what\s(is|are)\s(.+)/i,
        transform: (match: RegExpMatchArray) => `${match[2]} ${match[1]} a specific thing or concept`
      },
      // Who is/was questions
      {
        regex: /^who\s(is|was)\s(.+)/i,
        transform: (match: RegExpMatchArray) => `${match[2]} ${match[1]} a specific person`
      },
      // Where is/are questions
      {
        regex: /^where\s(is|are)\s(.+)/i,
        transform: (match: RegExpMatchArray) => `${match[2]} ${match[1]} located in a specific place`
      },
      // When did/was questions
      {
        regex: /^when\s(did|was)\s(.+)/i,
        transform: (match: RegExpMatchArray) => `${match[2]} occurred at a specific time`
      },
      // Why questions
      {
        regex: /^why\s(.+)/i,
        transform: (match: RegExpMatchArray) => `There is a specific reason why ${match[1]}`
      },
      // How questions
      {
        regex: /^how\s(.+)/i,
        transform: (match: RegExpMatchArray) => `There is a specific method or process for ${match[1]}`
      },
      // Which questions
      {
        regex: /^which\s(.+)/i,
        transform: (match: RegExpMatchArray) => `There is a specific ${match[1]} that can be identified`
      }
    ];
    
    // Try to match against patterns
    for (const pattern of patterns) {
      const match = cleanQuestion.match(pattern.regex);
      if (match) {
        return {
          statement: pattern.transform(match),
          implicitClaims: [
            `The question assumes ${match[0].toLowerCase()} is a meaningful inquiry.`,
            `There exists factual information regarding ${match[match.length - 1].toLowerCase()}.`
          ],
          wasQuestion: true
        };
      }
    }
    
    // Default transformation if no patterns match
    return {
      statement: `The answer to '${cleanQuestion}' is factually verifiable.`,
      implicitClaims: [
        `The question '${cleanQuestion}' has a factual answer.`,
        `There exists consensus information on this topic.`
      ],
      wasQuestion: true
    };
  }
}

export const questionTransformService = new QuestionTransformService();