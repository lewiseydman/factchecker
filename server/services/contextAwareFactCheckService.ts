import { db } from '../db';
import { 
  publicFigures, 
  statementSources, 
  claimContexts, 
  factChecks,
  type InsertPublicFigure,
  type InsertStatementSource,
  type InsertClaimContext,
  type PublicFigure,
  type StatementSource,
  type ClaimContext
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Context-Aware Fact Checking Service
 * 
 * This service provides the USP of tracking WHO said what, WHEN, and WHERE
 * building credibility profiles and providing context-aware analysis
 */
export class ContextAwareFactCheckService {
  
  /**
   * Analyze a statement with full context awareness
   */
  async analyzeStatementWithContext(
    statement: string,
    speakerName?: string,
    sourceName?: string,
    contextData?: {
      dateSpoken?: Date;
      location?: string;
      audience?: string;
      politicalContext?: string;
      originalContext?: string;
    }
  ): Promise<{
    speakerCredibility: number;
    sourceCredibility: number;
    contextualRiskFactors: string[];
    historicalPatterns: string[];
    recommendedVerificationLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    
    let speakerCredibility = 0.5; // Default neutral
    let sourceCredibility = 0.5; // Default neutral
    const contextualRiskFactors: string[] = [];
    const historicalPatterns: string[] = [];
    
    // Analyze speaker credibility if provided
    if (speakerName) {
      const speaker = await this.getOrCreatePublicFigure(speakerName);
      speakerCredibility = speaker.credibilityScore || 0.5;
      
      // Add historical pattern analysis
      if (speaker.totalStatements > 10) {
        const accuracyRate = (speaker.accurateStatements || 0) / speaker.totalStatements;
        if (accuracyRate < 0.3) {
          historicalPatterns.push(`${speakerName} has low historical accuracy (${(accuracyRate * 100).toFixed(0)}%)`);
          contextualRiskFactors.push('Speaker has pattern of inaccurate statements');
        } else if (accuracyRate > 0.8) {
          historicalPatterns.push(`${speakerName} has high historical accuracy (${(accuracyRate * 100).toFixed(0)}%)`);
        }
      }
    }
    
    // Analyze source credibility if provided
    if (sourceName) {
      const source = await this.getOrCreateStatementSource(sourceName);
      sourceCredibility = source.credibilityRating || 0.5;
      
      // Add source-specific risk factors
      if (source.type === 'social_media') {
        contextualRiskFactors.push('Unverified social media source');
      }
      if (source.biasRating && ['left', 'right'].includes(source.biasRating)) {
        contextualRiskFactors.push(`Source has known ${source.biasRating}-leaning bias`);
      }
    }
    
    // Analyze contextual risk factors
    if (contextData) {
      if (contextData.politicalContext?.includes('election')) {
        contextualRiskFactors.push('Statement made during election period - higher misinformation risk');
      }
      if (contextData.audience?.includes('rally') || contextData.audience?.includes('partisan')) {
        contextualRiskFactors.push('Statement made to partisan audience - potential bias amplification');
      }
      if (contextData.location?.includes('social media') || contextData.location?.includes('Twitter') || contextData.location?.includes('Facebook')) {
        contextualRiskFactors.push('Social media context - rapid spread potential');
      }
    }
    
    // Determine recommended verification level
    const avgCredibility = (speakerCredibility + sourceCredibility) / 2;
    const riskScore = contextualRiskFactors.length;
    
    let recommendedVerificationLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (avgCredibility > 0.8 && riskScore === 0) {
      recommendedVerificationLevel = 'low';
    } else if (avgCredibility < 0.3 || riskScore >= 3) {
      recommendedVerificationLevel = 'critical';
    } else if (avgCredibility < 0.5 || riskScore >= 2) {
      recommendedVerificationLevel = 'high';
    }
    
    return {
      speakerCredibility,
      sourceCredibility,
      contextualRiskFactors,
      historicalPatterns,
      recommendedVerificationLevel
    };
  }
  
  /**
   * Store context information for a fact check
   */
  async storeFactCheckContext(
    factCheckId: number,
    speakerName?: string,
    sourceName?: string,
    contextData?: {
      dateSpoken?: Date;
      location?: string;
      audience?: string;
      politicalContext?: string;
      originalContext?: string;
      intentCategory?: string;
      urgency?: string;
    }
  ): Promise<ClaimContext> {
    
    let speakerId: number | null = null;
    let sourceId: number | null = null;
    
    // Create or get speaker
    if (speakerName) {
      const speaker = await this.getOrCreatePublicFigure(speakerName);
      speakerId = speaker.id;
    }
    
    // Create or get source
    if (sourceName) {
      const source = await this.getOrCreateStatementSource(sourceName);
      sourceId = source.id;
    }
    
    // Store context
    const [context] = await db.insert(claimContexts).values({
      factCheckId,
      speakerId,
      sourceId,
      originalContext: contextData?.originalContext,
      dateSpoken: contextData?.dateSpoken,
      location: contextData?.location,
      audience: contextData?.audience,
      intentCategory: contextData?.intentCategory || 'informational',
      politicalContext: contextData?.politicalContext,
      urgency: contextData?.urgency || 'normal',
      crossReferences: [],
    }).returning();
    
    return context;
  }
  
  /**
   * Update speaker credibility after fact check
   */
  async updateSpeakerCredibility(speakerName: string, isAccurate: boolean): Promise<void> {
    const speaker = await this.getOrCreatePublicFigure(speakerName);
    
    const newTotal = (speaker.totalStatements || 0) + 1;
    const newAccurate = (speaker.accurateStatements || 0) + (isAccurate ? 1 : 0);
    const newCredibility = newAccurate / newTotal;
    
    await db.update(publicFigures)
      .set({
        totalStatements: newTotal,
        accurateStatements: newAccurate,
        credibilityScore: newCredibility,
        lastUpdated: new Date(),
      })
      .where(eq(publicFigures.id, speaker.id));
  }
  
  /**
   * Get credibility report for a public figure
   */
  async getCredibilityReport(speakerName: string): Promise<{
    speaker: PublicFigure;
    recentStatements: any[];
    accuracyTrend: string;
    topicBreakdown: any[];
  }> {
    const speaker = await this.getOrCreatePublicFigure(speakerName);
    
    // Get recent statements by this speaker
    const recentStatements = await db
      .select({
        statement: factChecks.statement,
        isTrue: factChecks.isTrue,
        checkedAt: factChecks.checkedAt,
        confidence: factChecks.confidence,
      })
      .from(factChecks)
      .innerJoin(claimContexts, eq(claimContexts.factCheckId, factChecks.id))
      .where(eq(claimContexts.speakerId, speaker.id))
      .orderBy(desc(factChecks.checkedAt))
      .limit(10);
    
    // Calculate accuracy trend
    const recentAccuracy = recentStatements.slice(0, 5);
    const olderAccuracy = recentStatements.slice(5, 10);
    
    const recentAccurateCount = recentAccuracy.filter(s => s.isTrue).length;
    const olderAccurateCount = olderAccuracy.filter(s => s.isTrue).length;
    
    let accuracyTrend = 'stable';
    if (recentAccurateCount > olderAccurateCount) {
      accuracyTrend = 'improving';
    } else if (recentAccurateCount < olderAccurateCount) {
      accuracyTrend = 'declining';
    }
    
    return {
      speaker,
      recentStatements,
      accuracyTrend,
      topicBreakdown: [], // TODO: Implement topic analysis
    };
  }
  
  /**
   * Get or create a public figure
   */
  private async getOrCreatePublicFigure(name: string): Promise<PublicFigure> {
    // Try to find existing figure
    const [existing] = await db
      .select()
      .from(publicFigures)
      .where(eq(publicFigures.name, name))
      .limit(1);
    
    if (existing) {
      return existing;
    }
    
    // Create new figure with basic information
    const figureData: InsertPublicFigure = {
      name,
      verificationSource: 'user_input',
      credibilityScore: 0.5, // Start with neutral credibility
      totalStatements: 0,
      accurateStatements: 0,
    };
    
    // Try to enhance with additional information
    const enhancedData = await this.enhancePublicFigureData(name);
    Object.assign(figureData, enhancedData);
    
    const [newFigure] = await db.insert(publicFigures).values(figureData).returning();
    return newFigure;
  }
  
  /**
   * Get or create a statement source
   */
  private async getOrCreateStatementSource(name: string): Promise<StatementSource> {
    // Try to find existing source
    const [existing] = await db
      .select()
      .from(statementSources)
      .where(eq(statementSources.name, name))
      .limit(1);
    
    if (existing) {
      return existing;
    }
    
    // Create new source
    const sourceData: InsertStatementSource = {
      name,
      type: this.detectSourceType(name),
      credibilityRating: this.getSourceCredibilityRating(name),
      biasRating: this.getSourceBiasRating(name),
    };
    
    const [newSource] = await db.insert(statementSources).values(sourceData).returning();
    return newSource;
  }
  
  /**
   * Enhance public figure data with external information
   */
  private async enhancePublicFigureData(name: string): Promise<Partial<InsertPublicFigure>> {
    // This could integrate with external APIs like Wikipedia, Wikidata, etc.
    // For now, return basic detection
    const enhanced: Partial<InsertPublicFigure> = {};
    
    const lowerName = name.toLowerCase();
    
    // Basic political figure detection
    if (lowerName.includes('president') || lowerName.includes('senator') || lowerName.includes('congressman')) {
      enhanced.title = 'Politician';
      enhanced.verificationSource = 'title_detection';
    }
    
    // Business figure detection
    if (lowerName.includes('ceo') || lowerName.includes('founder')) {
      enhanced.title = 'Business Executive';
      enhanced.verificationSource = 'title_detection';
    }
    
    return enhanced;
  }
  
  /**
   * Detect source type based on name
   */
  private detectSourceType(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('twitter') || lowerName.includes('facebook') || lowerName.includes('instagram') || lowerName.includes('tiktok')) {
      return 'social_media';
    }
    if (lowerName.includes('interview') || lowerName.includes('cnn') || lowerName.includes('fox') || lowerName.includes('bbc')) {
      return 'news_interview';
    }
    if (lowerName.includes('speech') || lowerName.includes('rally') || lowerName.includes('conference')) {
      return 'speech';
    }
    if (lowerName.includes('document') || lowerName.includes('report') || lowerName.includes('filing')) {
      return 'document';
    }
    
    return 'unknown';
  }
  
  /**
   * Get source credibility rating
   */
  private getSourceCredibilityRating(name: string): number {
    const lowerName = name.toLowerCase();
    
    // High credibility sources
    if (lowerName.includes('reuters') || lowerName.includes('ap news') || lowerName.includes('bbc')) {
      return 0.9;
    }
    
    // Medium-high credibility
    if (lowerName.includes('cnn') || lowerName.includes('nbc') || lowerName.includes('abc')) {
      return 0.7;
    }
    
    // Medium credibility
    if (lowerName.includes('interview') || lowerName.includes('press conference')) {
      return 0.6;
    }
    
    // Lower credibility
    if (lowerName.includes('social media') || lowerName.includes('twitter') || lowerName.includes('facebook')) {
      return 0.3;
    }
    
    return 0.5; // Default neutral
  }
  
  /**
   * Get source bias rating
   */
  private getSourceBiasRating(name: string): string {
    const lowerName = name.toLowerCase();
    
    // Known left-leaning sources
    if (lowerName.includes('msnbc') || lowerName.includes('cnn') || lowerName.includes('huffpost')) {
      return 'left';
    }
    
    // Known right-leaning sources
    if (lowerName.includes('fox news') || lowerName.includes('newsmax') || lowerName.includes('daily wire')) {
      return 'right';
    }
    
    // Center sources
    if (lowerName.includes('reuters') || lowerName.includes('ap news') || lowerName.includes('bbc')) {
      return 'center';
    }
    
    return 'unknown';
  }
}

export const contextAwareFactCheckService = new ContextAwareFactCheckService();