/**
 * Domain Detection Service
 *
 * This service analyzes input statements to detect which knowledge domains they belong to,
 * and provides mappings of AI model strengths in different domains.
 */

export type Domain =
  | "medical"
  | "scientific"
  | "historical"
  | "technical"
  | "financial"
  | "political"
  | "currentEvents"
  | "sports"
  | "entertainment"
  | "generalKnowledge";

interface DomainKeywords {
  [domain: string]: string[];
}

interface AIStrengthMap {
  [model: string]: {
    [domain: string]: number;
  };
}

export class DomainDetectionService {
  // User-friendly display names for domains
  private domainDisplayNames: { [key in Domain]: string } = {
    medical: "Health & Medicine",
    scientific: "Science",
    historical: "History & Culture",
    technical: "Technology",
    financial: "Economics & Finance",
    political: "Politics",
    currentEvents: "Current Events",
    sports: "Sports",
    entertainment: "Entertainment & Media",
    generalKnowledge: "General Knowledge",
  };

  // Keywords associated with different domains
  private domainKeywords: DomainKeywords = {
    medical: [
      "disease",
      "patient",
      "doctor",
      "treatment",
      "diagnosis",
      "symptoms",
      "hospital",
      "medicine",
      "vaccine",
      "virus",
      "bacteria",
      "infection",
      "surgery",
      "health",
      "medical",
      "cancer",
      "cure",
      "therapy",
      "drug",
    ],
    scientific: [
      "research",
      "study",
      "experiment",
      "theory",
      "hypothesis",
      "scientists",
      "physics",
      "chemistry",
      "biology",
      "laboratory",
      "discovery",
      "evidence",
      "analysis",
      "particle",
      "quantum",
      "molecular",
      "data",
      "observation",
    ],
    historical: [
      "history",
      "century",
      "ancient",
      "dynasty",
      "war",
      "period",
      "king",
      "queen",
      "empire",
      "civilization",
      "archaeology",
      "artifact",
      "medieval",
      "revolution",
      "historical",
      "era",
      "dynasty",
      "prehistoric",
      "date",
    ],
    technical: [
      "technology",
      "software",
      "hardware",
      "algorithm",
      "code",
      "system",
      "computer",
      "programming",
      "digital",
      "device",
      "application",
      "internet",
      "robot",
      "artificial intelligence",
      "machine learning",
      "network",
      "interface",
    ],
    financial: [
      "market",
      "economy",
      "stocks",
      "investment",
      "financial",
      "economic",
      "money",
      "bank",
      "inflation",
      "recession",
      "currency",
      "trading",
      "finance",
      "debt",
      "interest",
      "price",
      "cost",
      "profit",
      "budget",
      "fiscal",
    ],
    political: [
      "government",
      "policy",
      "election",
      "party",
      "president",
      "vote",
      "democracy",
      "congress",
      "parliament",
      "law",
      "legislation",
      "senator",
      "representative",
      "politician",
      "campaign",
      "ballot",
      "constitutional",
    ],
    currentEvents: [
      "news",
      "recently",
      "today",
      "yesterday",
      "this week",
      "this month",
      "this year",
      "ongoing",
      "developing",
      "breaking",
      "current",
      "latest",
    ],
    sports: [
      "game",
      "player",
      "team",
      "score",
      "championship",
      "tournament",
      "athlete",
      "coach",
      "stadium",
      "match",
      "sports",
      "football",
      "basketball",
      "baseball",
      "soccer",
      "tennis",
      "olympics",
      "medal",
      "record",
      "league",
    ],
    entertainment: [
      "movie",
      "film",
      "actor",
      "actress",
      "director",
      "celebrity",
      "music",
      "song",
      "album",
      "artist",
      "TV",
      "television",
      "show",
      "series",
      "award",
      "performance",
      "concert",
      "theater",
      "streaming",
      "popular",
      "star",
    ],
    generalKnowledge: [
      "fact",
      "information",
      "knowledge",
      "common",
      "general",
      "world",
      "global",
      "culture",
      "society",
      "education",
      "learning",
      "understanding",
      "basics",
    ],
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
      generalKnowledge: 0.8,
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
      generalKnowledge: 0.9,
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
      generalKnowledge: 0.7,
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
      generalKnowledge: 0.8,
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
      generalKnowledge: 0.75,
    },
    cohere: {
      medical: 0.85, // High - bias reduction crucial for health info
      scientific: 0.85, // High - academic rigor important
      historical: 0.80, // Good - objective historical analysis
      technical: 0.75, // Good - enterprise focus
      financial: 0.80, // High - objective analysis needed
      political: 0.90, // Highest - bias reduction most critical
      currentEvents: 0.75, // Good - but Perplexity leads with real-time
      sports: 0.70, // Moderate - less bias-sensitive
      entertainment: 0.70, // Moderate - less bias-sensitive
      generalKnowledge: 0.80, // Strong baseline with bias reduction
    },

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
      if (keywords.some((keyword) => lowerStatement.includes(keyword))) {
        foundDomains.push(domain as Domain);
      }
    }

    // If no specific domains detected, default to general knowledge
    if (foundDomains.length === 0) {
      foundDomains.push("generalKnowledge");
    }

    return foundDomains;
  }

  /**
   * Calculates weights for each AI model based on their strengths in detected domains
   * @param domains The detected domains
   * @param modelCount Number of models to use (based on subscription tier)
   * @returns Object with weights for each AI model
   */
  public calculateModelWeights(
    domains: Domain[],
    modelCount: number = 6
  ): {
    claude: number;
    openai: number;
    perplexity: number;
    gemini: number;
    mistral: number;
    llama: number;
  } {
    // Calculate raw strengths for each model in the detected domains
    const modelStrengths = [
      {
        name: "claude",
        strength: this.calculateDomainStrength("claude", domains),
      },
      {
        name: "openai",
        strength: this.calculateDomainStrength("openai", domains),
      },
      {
        name: "perplexity",
        strength: this.calculateDomainStrength("perplexity", domains),
      },
      {
        name: "gemini",
        strength: this.calculateDomainStrength("gemini", domains),
      },
      {
        name: "mistral",
        strength: this.calculateDomainStrength("mistral", domains),
      },
      {
        name: "llama",
        strength: this.calculateDomainStrength("llama", domains),
      },
    ];

    // Sort by strength and take only the number of models specified by subscription tier
    const topModels = modelStrengths
      .sort((a, b) => b.strength - a.strength)
      .slice(0, modelCount);

    // Calculate total weight for normalization
    const totalWeight = topModels.reduce(
      (sum, model) => sum + model.strength,
      0
    );

    // Initialize all weights to 0
    const weights = {
      claude: 0,
      openai: 0,
      perplexity: 0,
      gemini: 0,
      mistral: 0,
      llama: 0,
    };

    // Assign normalized weights only to selected models
    topModels.forEach((model) => {
      weights[model.name as keyof typeof weights] =
        totalWeight > 0 ? model.strength / totalWeight : 1 / modelCount;
    });

    return weights;
  }

  /**
   * Calculate the overall strength of a model for given domains
   * @param modelName The name of the AI model
   * @param domains The detected domains
   * @returns Combined strength score for the model
   */
  private calculateDomainStrength(
    modelName: string,
    domains: Domain[]
  ): number {
    let totalStrength = 1;

    for (const domain of domains) {
      const domainStrength = this.aiStrengths[modelName]?.[domain] || 0.7;
      totalStrength *= domainStrength;
    }

    return totalStrength;
  }

  /**
   * Get user-friendly display name for a domain
   * @param domain The domain key
   * @returns User-friendly display name
   */
  public getDomainDisplayName(domain: Domain): string {
    return this.domainDisplayNames[domain] || domain;
  }

  /**
   * Get user-friendly display names for multiple domains
   * @param domains Array of domain keys
   * @returns Array of user-friendly display names
   */
  public getDomainDisplayNames(domains: Domain[]): string[] {
    return domains.map((domain) => this.getDomainDisplayName(domain));
  }

  /**
   * Checks if input is a question rather than a statement
   * @param input The user input
   * @returns Boolean indicating whether the input is a question
   */
  public isQuestion(input: string): boolean {
    // Check if input ends with a question mark
    if (input.trim().endsWith("?")) return true;

    // Check if input starts with question words
    const questionStarters = [
      "who",
      "what",
      "where",
      "when",
      "why",
      "how",
      "is",
      "are",
      "do",
      "does",
      "did",
      "can",
      "could",
      "will",
      "would",
    ];
    const firstWord = input.trim().toLowerCase().split(" ")[0];

    return questionStarters.includes(firstWord);
  }

  /**
   * Get human-readable explanation of domain detection and model weights
   */
  public getWeightExplanation(
    domains: Domain[],
    weights: {
      claude: number;
      openai: number;
      perplexity: number;
      gemini?: number;
      mistral?: number;
      llama?: number;
    }
  ): string {
    // Format domains for display using friendly names
    const domainDisplay = this.getDomainDisplayNames(domains).join(", ");

    // Simplified explanation to avoid import issues
    return `This statement was classified in the following domains: ${domainDisplay}. Based on these domains, our AI models analyze the content using specialized knowledge in these areas.`;
  }
}

export const domainDetectionService = new DomainDetectionService();
