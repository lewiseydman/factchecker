import { Source } from "@shared/schema";

/**
 * Base interface for all fact-checking services
 */
export interface FactCheckingResult {
  isTrue: boolean;
  explanation: string;
  historicalContext?: string;
  sources: Source[];
  confidence?: number; // 0-1 scale representing confidence in the verdict
  serviceUsed: string; // Name of the service that provided this result
}

/**
 * Interface for sources with trust scores
 */
export interface TrustedSource extends Source {
  trustScore: number; // 0-1 scale indicating how trusted this source is
  category?: string; // e.g., "Academic", "Government", "News", etc.
}

/**
 * DEFAMEService (Digital Evidence Forensics and Media Evaluation)
 * A hypothetical service that specializes in detecting manipulated media and false narratives
 */
export class DEFAMEService {
  async checkFact(statement: string): Promise<FactCheckingResult> {
    // This would be replaced by an actual API call to the DEFAME service
    // For now, we'll simulate the behavior
    
    console.log("DEFAME Service checking fact:", statement);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      isTrue: this.analyzeStatement(statement),
      explanation: `DEFAME analysis shows this statement ${this.analyzeStatement(statement) ? 'appears to be accurate' : 'contains potentially misleading information'}.`,
      historicalContext: "DEFAME specializes in detecting manipulated content.",
      sources: [
        { 
          name: "Digital Evidence Framework",
          url: "https://example.com/defame/methodology"
        }
      ],
      confidence: 0.85,
      serviceUsed: "DEFAME"
    };
  }
  
  // Simple simulation of analysis
  private analyzeStatement(statement: string): boolean {
    // Some naive heuristics for demo purposes
    const statement_lower = statement.toLowerCase();
    const suspicious_words = ['always', 'never', 'everyone', 'nobody', 'all', 'none', 'guaranteed'];
    
    // Check for absolute language which often signals exaggeration
    for (const word of suspicious_words) {
      if (statement_lower.includes(word)) {
        return false;
      }
    }
    
    // Arbitrary logic for demo
    return statement.length > 20;
  }
}

/**
 * InFactService 
 * Checks statements against Google's Fact Check Tools API database of verified facts
 * from professional fact-checking organizations worldwide
 */
export class InFactService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY || '';
  }

  async checkFact(statement: string): Promise<FactCheckingResult> {
    console.log("InFact Service checking fact:", statement);
    
    if (!this.apiKey) {
      console.warn("Google Fact Check API key not available, using fallback response");
      return this.getFallbackResponse(statement);
    }

    try {
      // Call Google Fact Check Tools API
      const response = await fetch(
        `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(statement)}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.claims || data.claims.length === 0) {
        return {
          isTrue: null, // Unknown - no existing fact-checks found
          explanation: "No existing fact-checks found in professional databases for this specific claim. This doesn't mean the statement is false, just that it hasn't been previously fact-checked by major organizations.",
          sources: [],
          confidence: 0.0,
          serviceUsed: "InFact (Google Fact Check)"
        };
      }

      // Process the first relevant claim
      const claim = data.claims[0];
      const review = claim.claimReview?.[0];
      
      if (!review) {
        return this.getFallbackResponse(statement);
      }

      // Convert Google's rating to boolean
      const rating = review.textualRating?.toLowerCase() || '';
      const isTrue = this.interpretRating(rating);
      
      // Calculate confidence based on publisher credibility and rating clarity
      const confidence = this.calculateConfidence(review.publisher?.name, rating);

      return {
        isTrue,
        explanation: `Professional fact-check found: "${review.textualRating}" - ${claim.text || statement}`,
        historicalContext: `Fact-checked by ${review.publisher?.name || 'professional organization'} on ${review.reviewDate || 'unknown date'}`,
        sources: [
          {
            name: review.publisher?.name || "Fact-checking organization",
            url: review.url || ""
          }
        ],
        confidence,
        serviceUsed: "InFact (Google Fact Check)"
      };

    } catch (error) {
      console.error("Google Fact Check API error:", error);
      return this.getFallbackResponse(statement);
    }
  }

  private interpretRating(rating: string): boolean | null {
    const lowerRating = rating.toLowerCase();
    
    // True ratings
    if (lowerRating.includes('true') || lowerRating.includes('correct') || 
        lowerRating.includes('accurate') || lowerRating.includes('verified')) {
      return true;
    }
    
    // False ratings
    if (lowerRating.includes('false') || lowerRating.includes('incorrect') || 
        lowerRating.includes('misleading') || lowerRating.includes('pants on fire')) {
      return false;
    }
    
    // Mixed or unclear ratings
    return null;
  }

  private calculateConfidence(publisher: string = '', rating: string = ''): number {
    let confidence = 0.7; // Base confidence for professional fact-checkers
    
    // Boost confidence for highly credible publishers
    const highCredibilityPublishers = ['snopes', 'politifact', 'factcheck.org', 'reuters', 'ap news'];
    if (highCredibilityPublishers.some(pub => publisher.toLowerCase().includes(pub))) {
      confidence += 0.2;
    }
    
    // Boost confidence for clear ratings
    const clearRatings = ['true', 'false', 'correct', 'incorrect'];
    if (clearRatings.some(clear => rating.toLowerCase().includes(clear))) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private getFallbackResponse(statement: string): FactCheckingResult {
    return {
      isTrue: null,
      explanation: "Unable to verify against professional fact-checking databases at this time. The statement will be evaluated using other AI verification methods.",
      sources: [],
      confidence: 0.0,
      serviceUsed: "InFact (unavailable)"
    };
  }
}

/**
 * TrustedSourceFilter
 * Evaluates sources based on trust scores and filters less reliable ones
 */
export class TrustedSourceFilter {
  // Trusted domain lists
  private highlyTrustedDomains = [
    'nature.com',
    'science.org',
    'nih.gov',
    'edu',
    'gov',
    'who.int',
    'bbc.com',
    'reuters.com',
    'ap.org',
    'economist.com'
  ];
  
  private moderatelyTrustedDomains = [
    'nytimes.com',
    'wsj.com',
    'washingtonpost.com',
    'theguardian.com',
    'bloomberg.com',
    'time.com',
    'nationalgeographic.com'
  ];
  
  /**
   * Filters sources and assigns trust scores
   */
  evaluateSources(sources: Source[]): TrustedSource[] {
    return sources.map(source => {
      let trustScore = 0.5; // Default moderate trust
      let category = "General";
      
      try {
        const url = new URL(source.url);
        const domain = url.hostname;
        
        // Assign trust scores based on domain
        if (this.highlyTrustedDomains.some(trusted => domain.includes(trusted))) {
          trustScore = 0.9;
          
          // Categorize the source
          if (domain.includes('edu')) category = "Academic";
          else if (domain.includes('gov')) category = "Government";
          else if (domain.includes('who.int')) category = "Health Organization";
          else if (domain.includes('nature.com') || domain.includes('science.org')) category = "Scientific Journal";
          else if (domain.includes('bbc.com') || domain.includes('reuters.com') || domain.includes('ap.org')) category = "Major News Agency";
        }
        else if (this.moderatelyTrustedDomains.some(trusted => domain.includes(trusted))) {
          trustScore = 0.7;
          category = "News Publication";
        }
        
      } catch (error) {
        // If URL parsing fails, keep default scores
        console.error("Error parsing URL:", error);
      }
      
      return {
        ...source,
        trustScore,
        category
      };
    }).sort((a, b) => b.trustScore - a.trustScore); // Sort by trust score (highest first)
  }
  
  /**
   * Returns only the most trusted sources, up to the specified limit
   */
  filterTopSources(sources: Source[], limit: number = 3): TrustedSource[] {
    const evaluatedSources = this.evaluateSources(sources);
    return evaluatedSources.slice(0, limit);
  }
}

/**
 * FactCheckAggregator
 * Aggregates results from multiple fact-checking services and provides a consolidated result
 */
export class FactCheckAggregator {
  private perplexityService: any;
  private defameService: DEFAMEService;
  private inFactService: InFactService;
  private sourceFilter: TrustedSourceFilter;
  
  constructor(perplexityService: any) {
    this.perplexityService = perplexityService;
    this.defameService = new DEFAMEService();
    this.inFactService = new InFactService();
    this.sourceFilter = new TrustedSourceFilter();
  }
  
  /**
   * Checks a fact using multiple services and aggregates the results
   */
  async aggregateFactCheck(statement: string): Promise<{
    isTrue: boolean;
    explanation: string;
    historicalContext: string;
    sources: TrustedSource[];
    confidenceScore: number;
    individualResults: FactCheckingResult[];
  }> {
    // Run all fact checks in parallel
    const [perplexityResult, defameResult, inFactResult] = await Promise.all([
      this.perplexityService.checkFact(statement).then((result: any) => ({
        ...result,
        serviceUsed: "Perplexity",
        confidence: 0.8 // Assuming a default confidence for Perplexity
      })),
      this.defameService.checkFact(statement),
      this.inFactService.checkFact(statement)
    ]);
    
    // Collect all results
    const allResults = [perplexityResult, defameResult, inFactResult];
    
    // Calculate weighted truth value based on confidence
    let weightedTruthSum = 0;
    let confidenceSum = 0;
    
    allResults.forEach((result: FactCheckingResult) => {
      const confidence = result.confidence || 0.5; // Default to 0.5 if no confidence provided
      weightedTruthSum += (result.isTrue ? 1 : 0) * confidence;
      confidenceSum += confidence;
    });
    
    const aggregatedTruthValue = weightedTruthSum / confidenceSum;
    const isTrue = aggregatedTruthValue >= 0.5; // True if weighted average is >= 0.5
    
    // Collect all sources
    const allSources: Source[] = allResults.flatMap(result => result.sources || []);
    
    // Filter for top trusted sources
    const trustedSources = this.sourceFilter.filterTopSources(allSources);
    
    // Create aggregated explanation
    const explanations = allResults
      .map(result => `${result.serviceUsed}: ${result.explanation}`)
      .join('\n\n');
    
    // Use the most detailed historical context available
    const contexts = allResults
      .filter(result => result.historicalContext && result.historicalContext.length > 10)
      .map(result => result.historicalContext);
    
    const historicalContext = contexts.length > 0 
      ? contexts.sort((a, b) => (b?.length || 0) - (a?.length || 0))[0] 
      : 'No historical context available';
    
    return {
      isTrue,
      explanation: `Aggregated analysis from multiple fact-checking services:\n\n${explanations}`,
      historicalContext,
      sources: trustedSources,
      confidenceScore: confidenceSum / allResults.length,
      individualResults: allResults
    };
  }
}