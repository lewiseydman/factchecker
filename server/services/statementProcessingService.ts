/**
 * Statement Processing Service
 * 
 * Handles the conversion of questions into verifiable statements and
 * distinguishes between objective facts and subjective opinions.
 */

export type InputType = 'statement' | 'question' | 'opinion' | 'speculative';

export interface ProcessedInput {
  originalInput: string;
  inputType: InputType;
  verifiableStatement: string;
  confidence: number; // How confident we are in the conversion
  context: string; // Additional context for fact-checking
  isFactCheckable: boolean; // Whether this can be objectively verified
  reasoning: string; // Why we classified it this way
}

export class StatementProcessingService {
  
  /**
   * Main processing function that handles different types of input
   */
  public processInput(input: string): ProcessedInput {
    const trimmedInput = input.trim();
    
    // Detect input type
    const inputType = this.detectInputType(trimmedInput);
    
    // Process based on type
    switch (inputType) {
      case 'question':
        return this.processQuestion(trimmedInput);
      case 'opinion':
        return this.processOpinion(trimmedInput);
      case 'speculative':
        return this.processSpeculativeClaim(trimmedInput);
      case 'statement':
      default:
        return this.processStatement(trimmedInput);
    }
  }

  /**
   * Detects the type of input based on patterns and keywords
   */
  private detectInputType(input: string): InputType {
    const lowerInput = input.toLowerCase();
    
    // Question indicators
    const questionWords = ['did', 'does', 'do', 'is', 'are', 'was', 'were', 'can', 'could', 'would', 'should', 'will', 'has', 'have', 'had'];
    const questionPatterns = [
      /^(what|where|when|why|how|who|which)\b/i,
      /\?$/,
      /^(is it true|is it correct|is it accurate)/i
    ];
    
    // Opinion indicators
    const opinionWords = ['better', 'worse', 'best', 'worst', 'should', 'ought', 'believe', 'think', 'feel', 'opinion', 'beautiful', 'ugly', 'good', 'bad', 'amazing', 'terrible'];
    const opinionPatterns = [
      /\b(i think|i believe|in my opinion|personally|seems like|appears to be)\b/i,
      /\b(more|most|less|least) .* than\b/i
    ];
    
    // Speculative indicators
    const speculativeWords = ['making', 'causing', 'leading to', 'resulting in', 'probably', 'likely', 'might', 'could be', 'seems to'];
    
    // Check for questions
    if (questionPatterns.some(pattern => pattern.test(input)) || 
        (questionWords.some(word => lowerInput.startsWith(word + ' ')) && input.includes('?'))) {
      return 'question';
    }
    
    // Check for opinions (after questions to avoid "What do you think..." being classified as opinion)
    if (opinionWords.some(word => lowerInput.includes(word)) ||
        opinionPatterns.some(pattern => pattern.test(input))) {
      return 'opinion';
    }
    
    // Check for speculative claims
    if (speculativeWords.some(word => lowerInput.includes(word))) {
      return 'speculative';
    }
    
    return 'statement';
  }

  /**
   * Process questions by converting them to verifiable statements
   */
  private processQuestion(question: string): ProcessedInput {
    const examples = this.getQuestionExamples();
    const convertedStatement = this.convertQuestionToStatement(question);
    
    return {
      originalInput: question,
      inputType: 'question',
      verifiableStatement: convertedStatement.statement,
      confidence: convertedStatement.confidence,
      context: `Original question converted to verifiable statement for fact-checking. ${convertedStatement.context}`,
      isFactCheckable: convertedStatement.isFactCheckable,
      reasoning: `Converted question format to declarative statement for objective verification.`
    };
  }

  /**
   * Process opinions by identifying subjective elements
   */
  private processOpinion(opinion: string): ProcessedInput {
    const hasFactualElements = this.extractFactualElements(opinion);
    
    if (hasFactualElements.hasFactual) {
      return {
        originalInput: opinion,
        inputType: 'opinion',
        verifiableStatement: hasFactualElements.factualStatement,
        confidence: 0.6,
        context: `Opinion contains factual elements that can be verified. Subjective elements: ${hasFactualElements.subjectiveElements.join(', ')}`,
        isFactCheckable: true,
        reasoning: `Mixed opinion/fact statement - verifying factual claims while noting subjective elements.`
      };
    }
    
    return {
      originalInput: opinion,
      inputType: 'opinion',
      verifiableStatement: opinion,
      confidence: 0.3,
      context: `This appears to be a subjective opinion rather than an objective fact that can be verified.`,
      isFactCheckable: false,
      reasoning: `Primarily subjective opinion with limited objective verification potential.`
    };
  }

  /**
   * Process speculative claims
   */
  private processSpeculativeClaim(claim: string): ProcessedInput {
    const reframedClaim = this.reframeSpeculativeClaim(claim);
    
    return {
      originalInput: claim,
      inputType: 'speculative',
      verifiableStatement: reframedClaim.statement,
      confidence: reframedClaim.confidence,
      context: `Speculative claim reframed to focus on verifiable evidence. ${reframedClaim.context}`,
      isFactCheckable: true,
      reasoning: `Converted speculative claim to evidence-based statement for objective analysis.`
    };
  }

  /**
   * Process regular statements
   */
  private processStatement(statement: string): ProcessedInput {
    const clarity = this.assessStatementClarity(statement);
    
    return {
      originalInput: statement,
      inputType: 'statement',
      verifiableStatement: clarity.clarifiedStatement || statement,
      confidence: 0.9,
      context: clarity.context || 'Direct factual statement for verification.',
      isFactCheckable: true,
      reasoning: 'Clear declarative statement suitable for objective fact-checking.'
    };
  }

  /**
   * Convert questions to verifiable statements using pattern matching
   */
  private convertQuestionToStatement(question: string): {
    statement: string;
    confidence: number;
    context: string;
    isFactCheckable: boolean;
  } {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Remove question mark
    const cleanQuestion = question.replace(/\?+$/, '').trim();
    
    // Pattern-based conversions
    if (lowerQuestion.startsWith('did ')) {
      // "Did Einstein fail math?" → "Einstein failed math"
      const statement = cleanQuestion.replace(/^did\s+/i, '').replace(/\s+fail(\s+|$)/, ' failed ');
      return {
        statement: statement,
        confidence: 0.8,
        context: 'Converted past tense question to declarative statement.',
        isFactCheckable: true
      };
    }
    
    if (lowerQuestion.startsWith('is ') || lowerQuestion.startsWith('are ')) {
      // "Is 5G causing health issues?" → "5G causes health issues"
      const statement = cleanQuestion.replace(/^(is|are)\s+/i, '').replace(/\s+causing\s+/, ' causes ');
      return {
        statement: statement,
        confidence: 0.8,
        context: 'Converted present tense question to declarative statement.',
        isFactCheckable: true
      };
    }
    
    if (lowerQuestion.startsWith('does ') || lowerQuestion.startsWith('do ')) {
      // "Does social media cause depression?" → "Social media causes depression"
      const statement = cleanQuestion.replace(/^(does|do)\s+/i, '').replace(/\s+cause(\s+|$)/, ' causes ');
      return {
        statement: statement,
        confidence: 0.8,
        context: 'Converted present tense question to declarative statement.',
        isFactCheckable: true
      };
    }
    
    if (lowerQuestion.startsWith('can ') || lowerQuestion.startsWith('could ')) {
      // "Can vaccines cause autism?" → "Vaccines can cause autism"
      return {
        statement: cleanQuestion.replace(/^(can|could)\s+/i, '').replace(/^/, 'It is possible that '),
        confidence: 0.7,
        context: 'Converted possibility question to declarative statement about potential.',
        isFactCheckable: true
      };
    }
    
    if (lowerQuestion.match(/^(what|where|when|why|how|who|which)\b/)) {
      // Handle WH questions differently - these need more context
      return {
        statement: `The claim that ${cleanQuestion.replace(/^(what|where|when|why|how|who|which)\s+/i, '')}`,
        confidence: 0.6,
        context: 'WH-question converted to statement format. May need additional context for verification.',
        isFactCheckable: false
      };
    }
    
    // Generic fallback
    return {
      statement: `It is true that ${cleanQuestion}`,
      confidence: 0.5,
      context: 'Generic question conversion. Statement may need refinement for accurate fact-checking.',
      isFactCheckable: true
    };
  }

  /**
   * Extract factual elements from opinions
   */
  private extractFactualElements(opinion: string): {
    hasFactual: boolean;
    factualStatement: string;
    subjectiveElements: string[];
  } {
    const subjectiveWords = ['better', 'worse', 'best', 'worst', 'beautiful', 'ugly', 'amazing', 'terrible', 'good', 'bad'];
    const foundSubjective = subjectiveWords.filter(word => opinion.toLowerCase().includes(word));
    
    // Simple factual extraction - remove obvious subjective language
    let factualStatement = opinion;
    subjectiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      factualStatement = factualStatement.replace(regex, '').replace(/\s+/g, ' ').trim();
    });
    
    // If we removed substantial content, it was mostly opinion
    const hasFactual = factualStatement.length > opinion.length * 0.5;
    
    return {
      hasFactual,
      factualStatement: hasFactual ? factualStatement : opinion,
      subjectiveElements: foundSubjective
    };
  }

  /**
   * Reframe speculative claims to focus on evidence
   */
  private reframeSpeculativeClaim(claim: string): {
    statement: string;
    confidence: number;
    context: string;
  } {
    const lowerClaim = claim.toLowerCase();
    
    if (lowerClaim.includes('making') && lowerClaim.includes('dumber')) {
      // "Social media is making people dumber" → "There is scientific evidence that social media negatively affects cognitive abilities"
      return {
        statement: 'There is scientific evidence that social media negatively affects cognitive abilities',
        confidence: 0.7,
        context: 'Reframed to focus on verifiable research evidence rather than broad generalization.'
      };
    }
    
    if (lowerClaim.includes('causing') || lowerClaim.includes('leads to')) {
      // Convert causal claims to evidence-based statements
      const subject = claim.split(/\s+(?:is\s+)?(?:causing|leads?\s+to|results?\s+in)/i)[0];
      const effect = claim.split(/\s+(?:is\s+)?(?:causing|leads?\s+to|results?\s+in)\s+/i)[1];
      
      return {
        statement: `There is scientific evidence linking ${subject.trim()} to ${effect?.trim() || 'the claimed effects'}`,
        confidence: 0.7,
        context: 'Reframed causal claim to focus on verifiable evidence of correlation or causation.'
      };
    }
    
    // Generic speculative claim handling
    return {
      statement: `Research supports the claim that ${claim}`,
      confidence: 0.6,
      context: 'Reframed speculative statement to focus on available research evidence.'
    };
  }

  /**
   * Assess and clarify statement clarity
   */
  private assessStatementClarity(statement: string): {
    clarifiedStatement?: string;
    context?: string;
  } {
    const lowerStatement = statement.toLowerCase();
    
    // Check for vague terms that need clarification
    if (lowerStatement.includes('better than ever') || lowerStatement.includes('worse than ever')) {
      return {
        clarifiedStatement: statement.replace(/better than ever/gi, 'at historically high levels').replace(/worse than ever/gi, 'at historically low levels'),
        context: 'Clarified comparative language to be more specific and verifiable.'
      };
    }
    
    return {};
  }

  /**
   * Get example conversions for reference
   */
  private getQuestionExamples(): Array<{question: string; statement: string}> {
    return [
      {
        question: "Did Einstein fail math as a child?",
        statement: "Einstein failed math as a child"
      },
      {
        question: "Is 5G causing health issues?",
        statement: "There is no scientific evidence that 5G causes health issues"
      },
      {
        question: "Does social media make people depressed?",
        statement: "Social media use is linked to increased depression rates"
      },
      {
        question: "Can vaccines cause autism?",
        statement: "Vaccines can cause autism"
      }
    ];
  }
}

export const statementProcessingService = new StatementProcessingService();