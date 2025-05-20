/**
 * Domain Detection Service
 * 
 * This service analyzes input statements to detect which knowledge domains they belong to,
 * and provides mappings of AI model strengths in different domains.
 */

export type Domain = 
  | 'medical' 
  | 'scientific' 
  | 'historical' 
  | 'technical' 
  | 'financial' 
  | 'political'
  | 'currentEvents'
  | 'sports'
  | 'entertainment'
  | 'generalKnowledge';

interface DomainKeywords {
  [domain: string]: string[];
}

interface AIStrengthMap {
  [model: string]: {
    [domain: string]: number;
  };
}

export class DomainDetectionService {
  // Keywords associated with different domains
  private domainKeywords: DomainKeywords = {
    medical: [
      "disease", "patient", "doctor", "treatment", "diagnosis", "symptoms", 
      "hospital", "medicine", "vaccine", "virus", "bacteria", "infection",
      "surgery", "health", "medical", "cancer", "cure", "therapy", "drug"
    ],
    scientific: [
      "research", "study", "experiment", "theory", "hypothesis", "scientists",
      "physics", "chemistry", "biology", "laboratory", "discovery", "evidence",
      "analysis", "particle", "quantum", "molecular", "data", "observation"
    ],
    historical: [
      "history", "century", "ancient", "dynasty", "war", "period", "king",
      "queen", "empire", "civilization", "archaeology", "artifact", "medieval",
      "revolution", "historical", "era", "dynasty", "prehistoric", "date"
    ],
    technical: [
      "technology", "software", "hardware", "algorithm", "code", "system",
      "computer", "programming", "digital", "device", "application", "internet",
      "robot", "artificial intelligence", "machine learning", "network", "interface"
    ],
    financial: [
      "market", "economy", "stocks", "investment", "financial", "economic",
      "money", "bank", "inflation", "recession", "currency", "trading", "finance",
      "debt", "interest", "price", "cost", "profit", "budget", "fiscal"
    ],
    political: [
      "government", "policy", "election", "party", "president", "vote",
      "democracy", "congress", "parliament", "law", "legislation", "senator",
      "representative", "politician", "campaign", "ballot", "constitutional"
    ],
    currentEvents: [
      "news", "recently", "today", "yesterday", "this week", "this month",
      "this year", "ongoing", "developing", "breaking", "current", "latest"
    ],
    sports: [
      "game", "player", "team", "score", "championship", "tournament", "athlete",
      "coach", "stadium", "match", "sports", "football", "basketball", "baseball",
      "soccer", "tennis", "olympics", "medal", "record", "league"
    ],
    entertainment: [
      "movie", "film", "actor", "actress", "director", "celebrity", "music",
      "song", "album", "artist", "TV", "television", "show", "series", "award",
      "performance", "concert", "theater", "streaming", "popular", "star"
    ],
    generalKnowledge: [
      "fact", "information", "knowledge", "common", "general", "world", "global",
      "culture", "society", "education", "learning", "understanding", "basics"
    ]
  };

  // AI model strengths in different domains
  private aiStrengths: AIStrengthMap = {
    claude: {
      medical: 0.8,
      scientific: 0.7,
      historical: 0.9,
      technical: 0.6,
      financial: 0.7,
      political: 0.8,
      currentEvents: 0.5,
      sports: 0.6,
      entertainment: 0.7,
      generalKnowledge: 0.8
    },
    openai: {
      medical: 0.7,
      scientific: 0.8,
      historical: 0.7,
      technical: 0.9,
      financial: 0.8,
      political: 0.7,
      currentEvents: 0.6,
      sports: 0.7,
      entertainment: 0.8,
      generalKnowledge: 0.9
    },
    perplexity: {
      medical: 0.7,
      scientific: 0.7,
      historical: 0.6,
      technical: 0.8,
      financial: 0.7,
      political: 0.6,
      currentEvents: 0.9, // Perplexity excels with web search
      sports: 0.8,
      entertainment: 0.8,
      generalKnowledge: 0.7
    },
    gemini: {
      medical: 0.8,
      scientific: 0.85,
      historical: 0.75,
      technical: 0.85,
      financial: 0.7,
      political: 0.75,
      currentEvents: 0.8,
      sports: 0.7,
      entertainment: 0.75,
      generalKnowledge: 0.8
    },
    mistral: {
      medical: 0.75,
      scientific: 0.8,
      historical: 0.85,
      technical: 0.75,
      financial: 0.7,
      political: 0.75,
      currentEvents: 0.65,
      sports: 0.65,
      entertainment: 0.7,
      generalKnowledge: 0.75
    },
    llama: {
      medical: 0.75,
      scientific: 0.8,
      historical: 0.8,
      technical: 0.85,
      financial: 0.75,
      political: 0.7,
      currentEvents: 0.7,
      sports: 0.85,
      entertainment: 0.9,
      generalKnowledge: 0.8
    }
  };

  /**
   * Detects domains relevant to a statement using keyword matching
   * @param statement The statement to analyze
   * @returns Array of detected domains
   */
  public detectDomains(statement: string): Domain[] {
    const lowerStatement = statement.toLowerCase();
    const foundDomains: Domain[] = [];
    
    for (const [domain, keywords] of Object.entries(this.domainKeywords)) {
      if (keywords.some(keyword => lowerStatement.includes(keyword))) {
        foundDomains.push(domain as Domain);
      }
    }
    
    // If no specific domains detected, default to general knowledge
    if (foundDomains.length === 0) {
      foundDomains.push('generalKnowledge');
    }
    
    return foundDomains;
  }

  /**
   * Calculates weights for each AI model based on their strengths in detected domains
   * @param domains The detected domains
   * @returns Object with weights for each AI model
   */
  public calculateModelWeights(domains: Domain[]): {
    claude: number;
    openai: number;
    perplexity: number;
    gemini: number;
    mistral: number;
    llama: number;
  } {
    // Default equal weights
    let claudeWeight = 1;
    let openaiWeight = 1;
    let perplexityWeight = 1;
    let geminiWeight = 1;
    let mistralWeight = 1;
    let llamaWeight = 1;
    
    // Adjust weights based on domains
    for (const domain of domains) {
      claudeWeight *= this.aiStrengths.claude[domain] || 0.7;
      openaiWeight *= this.aiStrengths.openai[domain] || 0.7;
      perplexityWeight *= this.aiStrengths.perplexity[domain] || 0.7;
      geminiWeight *= this.aiStrengths.gemini[domain] || 0.7;
      mistralWeight *= this.aiStrengths.mistral[domain] || 0.7;
      llamaWeight *= this.aiStrengths.llama[domain] || 0.7;
    }
    
    // Normalize weights to sum to 1
    const totalWeight = claudeWeight + openaiWeight + perplexityWeight + 
                       geminiWeight + mistralWeight + llamaWeight;
    
    return {
      claude: claudeWeight / totalWeight,
      openai: openaiWeight / totalWeight,
      perplexity: perplexityWeight / totalWeight,
      gemini: geminiWeight / totalWeight,
      mistral: mistralWeight / totalWeight,
      llama: llamaWeight / totalWeight
    };
  }

  /**
   * Checks if input is a question rather than a statement
   * @param input The user input
   * @returns Boolean indicating whether the input is a question
   */
  public isQuestion(input: string): boolean {
    // Check if input ends with a question mark
    if (input.trim().endsWith('?')) return true;
    
    // Check if input starts with question words
    const questionStarters = ['who', 'what', 'where', 'when', 'why', 'how', 'is', 'are', 'do', 'does', 'did', 'can', 'could', 'will', 'would'];
    const firstWord = input.trim().toLowerCase().split(' ')[0];
    
    return questionStarters.includes(firstWord);
  }

  /**
   * Get human-readable explanation of domain detection and model weights
   */
  public getWeightExplanation(domains: Domain[], weights: {
    claude: number;
    openai: number;
    perplexity: number;
    gemini?: number;
    mistral?: number;
    llama?: number;
  }): string {
    // Format domains for display
    const domainDisplay = domains.map(d => 
      d.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    ).join(', ');
    
    // Format weights as percentages
    const claudePercent = Math.round(weights.claude * 100);
    const openaiPercent = Math.round(weights.openai * 100);
    const perplexityPercent = Math.round(weights.perplexity * 100);
    
    let explanation = `This statement was classified in the following domains: ${domainDisplay}. 
Based on these domains, the AI models were weighted as follows:
- Claude: ${claudePercent}%
- GPT: ${openaiPercent}%
- Perplexity: ${perplexityPercent}%`;

    // Add new models if they have weights
    if (weights.gemini !== undefined) {
      explanation += `\n- Gemini: ${Math.round(weights.gemini * 100)}%`;
    }
    
    if (weights.mistral !== undefined) {
      explanation += `\n- Mistral: ${Math.round(weights.mistral * 100)}%`;
    }
    
    if (weights.llama !== undefined) {
      explanation += `\n- Llama: ${Math.round(weights.llama * 100)}%`;
    }
    
    return explanation;
  }
}

export const domainDetectionService = new DomainDetectionService();