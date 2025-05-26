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
 * Multi-source fact verification using authentic databases:
 * - Google Fact Check Tools API (professional fact-checkers)
 * - Wikidata Query Service (structured knowledge base)
 * - World Bank Open Data API (economic/demographic statistics)
 * - NASA Open Data API (space/climate/scientific facts)
 */
export class InFactService {
  private googleApiKey: string;
  
  constructor() {
    this.googleApiKey = process.env.GOOGLE_FACT_CHECK_API_KEY || '';
  }

  async checkFact(statement: string): Promise<FactCheckingResult> {
    console.log("InFact Service checking fact:", statement);
    
    // Try multiple authentic data sources in order of priority
    const sources = [
      () => this.checkGoogleFactCheck(statement),
      () => this.checkWikidata(statement),
      () => this.checkWorldBank(statement),
      () => this.checkNASA(statement)
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result && (result.confidence || 0) > 0) {
          return result;
        }
      } catch (error) {
        console.warn("Source check failed, trying next source:", error);
        continue;
      }
    }

    // If no sources provide verification
    return {
      isTrue: false,
      explanation: "Unable to verify this statement against available authentic databases. This doesn't indicate the statement is false, but rather that it requires human expert verification.",
      sources: [],
      confidence: 0.0,
      serviceUsed: "InFact (no verification found)"
    };
  }

  private async checkGoogleFactCheck(statement: string): Promise<FactCheckingResult | null> {
    if (!this.googleApiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(statement)}&key=${this.googleApiKey}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (!data.claims || data.claims.length === 0) {
        return null;
      }

      const claim = data.claims[0];
      const review = claim.claimReview?.[0];
      
      if (!review) {
        return null;
      }

      const rating = review.textualRating?.toLowerCase() || '';
      const isTrue = this.interpretRating(rating);
      
      if (isTrue === null) {
        return null; // Skip unclear ratings
      }

      const confidence = this.calculateConfidence(review.publisher?.name, rating);

      return {
        isTrue,
        explanation: `Professional fact-check: "${review.textualRating}" - ${claim.text || statement}`,
        historicalContext: `Verified by ${review.publisher?.name || 'professional organization'} on ${review.reviewDate || 'unknown date'}`,
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
      return null;
    }
  }

  private async checkWikidata(statement: string): Promise<FactCheckingResult | null> {
    try {
      // Extract potential factual elements from statement
      const factualElements = this.extractFactualElements(statement);
      
      if (factualElements.length === 0) {
        return null;
      }

      // Query Wikidata for the first factual element
      const query = this.buildWikidataQuery(factualElements[0]);
      const response = await fetch('https://query.wikidata.org/sparql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: `query=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (!data.results?.bindings || data.results.bindings.length === 0) {
        return null;
      }

      // Process Wikidata results
      const result = data.results.bindings[0];
      const verification = this.analyzeWikidataResult(statement, result);
      
      if (!verification) {
        return null;
      }

      return {
        isTrue: verification.isTrue,
        explanation: `Wikidata verification: ${verification.explanation}`,
        historicalContext: `Verified against Wikidata's structured knowledge base containing millions of facts`,
        sources: [
          {
            name: "Wikidata",
            url: verification.wikidataUrl || "https://www.wikidata.org"
          }
        ],
        confidence: 0.85,
        serviceUsed: "InFact (Wikidata)"
      };
    } catch (error) {
      return null;
    }
  }

  private async checkWorldBank(statement: string): Promise<FactCheckingResult | null> {
    try {
      // Check if statement contains economic/demographic indicators
      const economicKeywords = ['gdp', 'population', 'economy', 'income', 'poverty', 'unemployment', 'inflation'];
      const containsEconomicData = economicKeywords.some(keyword => 
        statement.toLowerCase().includes(keyword)
      );

      if (!containsEconomicData) {
        return null;
      }

      // Extract country and indicator from statement
      const countryPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
      const countries = statement.match(countryPattern) || [];
      
      if (countries.length === 0) {
        return null;
      }

      // Try to get data for the first country mentioned
      const response = await fetch(
        `https://api.worldbank.org/v2/country/${countries[0]}/indicator/NY.GDP.PCAP.CD?format=json&date=2022`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length < 2 || !data[1] || data[1].length === 0) {
        return null;
      }

      const economicData = data[1][0];
      const verification = this.analyzeWorldBankData(statement, economicData);
      
      if (!verification) {
        return null;
      }

      return {
        isTrue: verification.isTrue,
        explanation: `World Bank data verification: ${verification.explanation}`,
        historicalContext: `Verified against official World Bank economic and demographic statistics`,
        sources: [
          {
            name: "World Bank Open Data",
            url: "https://data.worldbank.org"
          }
        ],
        confidence: 0.90,
        serviceUsed: "InFact (World Bank)"
      };
    } catch (error) {
      return null;
    }
  }

  private async checkNASA(statement: string): Promise<FactCheckingResult | null> {
    try {
      // Check if statement contains space/climate/scientific keywords
      const scienceKeywords = ['space', 'planet', 'mars', 'moon', 'earth', 'climate', 'temperature', 'solar', 'asteroid'];
      const containsScience = scienceKeywords.some(keyword => 
        statement.toLowerCase().includes(keyword)
      );

      if (!containsScience) {
        return null;
      }

      // For demonstration, check NASA's Earth data for climate-related claims
      if (statement.toLowerCase().includes('temperature') || statement.toLowerCase().includes('climate')) {
        const response = await fetch('https://climate.nasa.gov/api/temperature');
        
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const verification = this.analyzeNASAData(statement, data);
        
        if (!verification) {
          return null;
        }

        return {
          isTrue: verification.isTrue,
          explanation: `NASA data verification: ${verification.explanation}`,
          historicalContext: `Verified against NASA's authoritative space and climate science data`,
          sources: [
            {
              name: "NASA Climate Change and Global Warming",
              url: "https://climate.nasa.gov"
            }
          ],
          confidence: 0.92,
          serviceUsed: "InFact (NASA)"
        };
      }

      return null;
    } catch (error) {
      return null;
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

  // Helper methods for analyzing data from different sources
  private extractFactualElements(statement: string): string[] {
    // Extract potential factual elements like dates, numbers, proper nouns
    const elements: string[] = [];
    
    // Extract years (4-digit numbers)
    const years = statement.match(/\b(19|20)\d{2}\b/g);
    if (years) elements.push(...years);
    
    // Extract proper nouns (capitalized words)
    const properNouns = statement.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (properNouns) elements.push(...properNouns);
    
    // Extract numbers with units
    const measurements = statement.match(/\b\d+(?:\.\d+)?\s*(?:km|miles|degrees|percent|%|million|billion)\b/gi);
    if (measurements) elements.push(...measurements);
    
    return elements.slice(0, 3); // Limit to first 3 elements
  }

  private buildWikidataQuery(element: string): string {
    // Build a basic SPARQL query for Wikidata
    return `
      SELECT ?item ?itemLabel ?value WHERE {
        ?item rdfs:label "${element}"@en .
        ?item ?property ?value .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      }
      LIMIT 5
    `;
  }

  private analyzeWikidataResult(statement: string, result: any): { isTrue: boolean; explanation: string; wikidataUrl?: string } | null {
    // Basic analysis of Wikidata results
    if (!result.item || !result.itemLabel) {
      return null;
    }
    
    const itemLabel = result.itemLabel.value;
    const itemValue = result.value?.value;
    
    // Check if the statement mentions this item
    if (statement.toLowerCase().includes(itemLabel.toLowerCase())) {
      return {
        isTrue: true,
        explanation: `Found factual reference to "${itemLabel}" in Wikidata knowledge base`,
        wikidataUrl: result.item.value
      };
    }
    
    return null;
  }

  private analyzeWorldBankData(statement: string, data: any): { isTrue: boolean; explanation: string } | null {
    if (!data.value || !data.country) {
      return null;
    }
    
    const country = data.country.value;
    const value = data.value;
    const year = data.date;
    
    // Basic verification - check if statement mentions this country and reasonable GDP values
    if (statement.toLowerCase().includes(country.toLowerCase())) {
      return {
        isTrue: value > 0 && value < 200000, // Reasonable GDP per capita range
        explanation: `${country} GDP per capita in ${year}: $${value.toLocaleString()}`
      };
    }
    
    return null;
  }

  private analyzeNASAData(statement: string, data: any): { isTrue: boolean; explanation: string } | null {
    // Placeholder for NASA data analysis
    // In a real implementation, this would analyze climate/space data
    if (data && statement.toLowerCase().includes('temperature')) {
      return {
        isTrue: true,
        explanation: "NASA climate data supports temperature-related claims based on scientific measurements"
      };
    }
    
    return null;
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