/**
 * Question Transform Service
 * 
 * This service transforms questions into verifiable statements
 * and extracts implicit claims from questions.
 */

export class QuestionTransformService {
  /**
   * Transform a question into a verifiable statement
   * @param question The question to transform
   * @returns Object with transformed statement and array of implicit claims
   */
  async transformToStatement(question: string): Promise<{
    statement: string;
    implicitClaims: string[];
  }> {
    // Remove question mark if present
    const cleanQuestion = question.trim().replace(/\?$/, '');
    
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
      }
    ];
    
    // Try to match against patterns
    for (const pattern of patterns) {
      const match = cleanQuestion.match(pattern.regex);
      if (match) {
        return {
          statement: pattern.transform(match),
          implicitClaims: [
            // Generate implicit claims based on question type
            `The question assumes ${match[0].toLowerCase()} is a meaningful inquiry.`,
            `There exists factual information regarding ${match[match.length - 1].toLowerCase()}.`
          ]
        };
      }
    }
    
    // Default transformation if no patterns match
    return {
      statement: `The answer to '${cleanQuestion}' is factually verifiable.`,
      implicitClaims: [
        `The question '${cleanQuestion}' has a factual answer.`,
        `There exists consensus information on this topic.`
      ]
    };
  }
}

export const questionTransformService = new QuestionTransformService();