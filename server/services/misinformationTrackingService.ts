import { db } from '../db';
import { 
  misinformationAlerts, 
  viralClaims, 
  factChecks,
  type InsertMisinformationAlert,
  type InsertViralClaim,
  type MisinformationAlert,
  type ViralClaim
} from '@shared/schema';
import { eq, desc, gte, sql, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Misinformation Tracking Service
 * 
 * This service provides real-time monitoring of viral false claims
 * and creates alerts for trending misinformation
 */
export class MisinformationTrackingService {
  
  /**
   * Track a new claim for potential misinformation spread
   */
  async trackClaim(
    claimText: string,
    platformData?: {
      platform: string;
      engagements: number;
      shares: number;
      comments: number;
      reach: number;
    },
    urgencyLevel: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<ViralClaim> {
    
    // Check if this claim already exists
    const existingClaim = await this.findSimilarClaim(claimText);
    
    if (existingClaim) {
      // Update existing claim with new platform data
      return await this.updateViralClaim(existingClaim.id, platformData);
    }
    
    // Create new viral claim
    const [newClaim] = await db.insert(viralClaims).values({
      claimText,
      platformData: platformData ? [platformData] : [],
      urgencyLevel,
      estimatedReach: platformData?.reach || 0,
      growthRate: 0, // Will be calculated over time
      factCheckStatus: 'pending',
    }).returning();
    
    // Check if this should trigger an alert
    await this.checkForAlert(newClaim);
    
    return newClaim;
  }
  
  /**
   * Create or update a misinformation alert
   */
  async createAlert(
    statementHash: string,
    description: string,
    alertLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    platformsDetected: string[] = []
  ): Promise<MisinformationAlert> {
    
    // Check if alert already exists for this statement
    const [existing] = await db
      .select()
      .from(misinformationAlerts)
      .where(eq(misinformationAlerts.statementHash, statementHash))
      .limit(1);
    
    if (existing) {
      // Update existing alert
      const [updated] = await db
        .update(misinformationAlerts)
        .set({
          alertLevel,
          platformsDetected,
          description,
          lastUpdated: new Date(),
        })
        .where(eq(misinformationAlerts.id, existing.id))
        .returning();
      
      return updated;
    }
    
    // Create new alert
    const [newAlert] = await db.insert(misinformationAlerts).values({
      statementHash,
      description,
      alertLevel,
      platformsDetected,
      viralityScore: 0,
      relatedFactChecks: [],
    }).returning();
    
    return newAlert;
  }
  
  /**
   * Get active misinformation alerts
   */
  async getActiveAlerts(limit: number = 20): Promise<{
    alerts: MisinformationAlert[];
    criticalCount: number;
    highCount: number;
    totalActive: number;
  }> {
    
    // Get recent alerts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const alerts = await db
      .select()
      .from(misinformationAlerts)
      .where(gte(misinformationAlerts.firstDetected, sevenDaysAgo))
      .orderBy(desc(misinformationAlerts.viralityScore), desc(misinformationAlerts.lastUpdated))
      .limit(limit);
    
    const criticalCount = alerts.filter(a => a.alertLevel === 'critical').length;
    const highCount = alerts.filter(a => a.alertLevel === 'high').length;
    
    return {
      alerts,
      criticalCount,
      highCount,
      totalActive: alerts.length,
    };
  }
  
  /**
   * Get trending viral claims
   */
  async getTrendingClaims(limit: number = 15): Promise<{
    claims: ViralClaim[];
    fastestGrowing: ViralClaim[];
    mostReach: ViralClaim[];
  }> {
    
    // Get recent claims (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentClaims = await db
      .select()
      .from(viralClaims)
      .where(gte(viralClaims.firstSeen, threeDaysAgo))
      .orderBy(desc(viralClaims.growthRate))
      .limit(limit);
    
    const fastestGrowing = recentClaims
      .filter(c => (c.growthRate || 0) > 1.5)
      .slice(0, 5);
    
    const mostReach = recentClaims
      .sort((a, b) => (b.estimatedReach || 0) - (a.estimatedReach || 0))
      .slice(0, 5);
    
    return {
      claims: recentClaims,
      fastestGrowing,
      mostReach,
    };
  }
  
  /**
   * Link a fact check to a misinformation alert
   */
  async linkFactCheckToAlert(factCheckId: number, alertId: number): Promise<void> {
    const [alert] = await db
      .select()
      .from(misinformationAlerts)
      .where(eq(misinformationAlerts.id, alertId))
      .limit(1);
    
    if (alert) {
      const currentFactChecks = alert.relatedFactChecks || [];
      if (!currentFactChecks.includes(factCheckId)) {
        await db
          .update(misinformationAlerts)
          .set({
            relatedFactChecks: [...currentFactChecks, factCheckId],
            lastUpdated: new Date(),
          })
          .where(eq(misinformationAlerts.id, alertId));
      }
    }
  }
  
  /**
   * Calculate virality score for an alert
   */
  async calculateViralityScore(alertId: number): Promise<number> {
    const [alert] = await db
      .select()
      .from(misinformationAlerts)
      .where(eq(misinformationAlerts.id, alertId))
      .limit(1);
    
    if (!alert) return 0;
    
    // Get related viral claims
    const relatedClaims = await db
      .select()
      .from(viralClaims)
      .where(eq(viralClaims.relatedAlertId, alertId));
    
    let totalReach = 0;
    let avgGrowthRate = 0;
    let platformCount = new Set<string>();
    
    for (const claim of relatedClaims) {
      totalReach += claim.estimatedReach || 0;
      avgGrowthRate += claim.growthRate || 0;
      
      if (claim.platformData) {
        const platforms = Array.isArray(claim.platformData) 
          ? claim.platformData 
          : [claim.platformData];
        
        platforms.forEach((p: any) => {
          if (p.platform) platformCount.add(p.platform);
        });
      }
    }
    
    if (relatedClaims.length > 0) {
      avgGrowthRate = avgGrowthRate / relatedClaims.length;
    }
    
    // Calculate virality score (0-1 scale)
    const reachScore = Math.min(totalReach / 1000000, 1); // Max at 1M reach
    const growthScore = Math.min(avgGrowthRate / 10, 1); // Max at 10x growth
    const platformScore = Math.min(platformCount.size / 5, 1); // Max at 5 platforms
    
    const viralityScore = (reachScore * 0.4) + (growthScore * 0.4) + (platformScore * 0.2);
    
    // Update the alert with new virality score
    await db
      .update(misinformationAlerts)
      .set({
        viralityScore,
        lastUpdated: new Date(),
      })
      .where(eq(misinformationAlerts.id, alertId));
    
    return viralityScore;
  }
  
  /**
   * Generate misinformation report
   */
  async generateMisinformationReport(days: number = 7): Promise<{
    summary: {
      totalAlerts: number;
      criticalAlerts: number;
      newClaims: number;
      topPlatforms: string[];
    };
    trendingMisinformation: ViralClaim[];
    alertsNeedingAttention: MisinformationAlert[];
    platformBreakdown: { platform: string; count: number; avgReach: number }[];
  }> {
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get summary statistics
    const totalAlerts = await db
      .select({ count: sql<number>`count(*)` })
      .from(misinformationAlerts)
      .where(gte(misinformationAlerts.firstDetected, startDate));
    
    const criticalAlerts = await db
      .select({ count: sql<number>`count(*)` })
      .from(misinformationAlerts)
      .where(
        and(
          gte(misinformationAlerts.firstDetected, startDate),
          eq(misinformationAlerts.alertLevel, 'critical')
        )
      );
    
    const newClaims = await db
      .select({ count: sql<number>`count(*)` })
      .from(viralClaims)
      .where(gte(viralClaims.firstSeen, startDate));
    
    // Get trending claims
    const trendingMisinformation = await db
      .select()
      .from(viralClaims)
      .where(gte(viralClaims.firstSeen, startDate))
      .orderBy(desc(viralClaims.growthRate), desc(viralClaims.estimatedReach))
      .limit(10);
    
    // Get alerts needing attention (high virality, recent)
    const alertsNeedingAttention = await db
      .select()
      .from(misinformationAlerts)
      .where(
        and(
          gte(misinformationAlerts.firstDetected, startDate),
          sql`virality_score > 0.5`
        )
      )
      .orderBy(desc(misinformationAlerts.viralityScore))
      .limit(5);
    
    return {
      summary: {
        totalAlerts: totalAlerts[0]?.count || 0,
        criticalAlerts: criticalAlerts[0]?.count || 0,
        newClaims: newClaims[0]?.count || 0,
        topPlatforms: [], // TODO: Extract from platform data
      },
      trendingMisinformation,
      alertsNeedingAttention,
      platformBreakdown: [], // TODO: Calculate platform breakdown
    };
  }
  
  /**
   * Find similar claim using text similarity
   */
  private async findSimilarClaim(claimText: string): Promise<ViralClaim | null> {
    // Simple approach: check for exact matches first
    // TODO: Implement more sophisticated text similarity
    const [existing] = await db
      .select()
      .from(viralClaims)
      .where(eq(viralClaims.claimText, claimText))
      .limit(1);
    
    return existing || null;
  }
  
  /**
   * Update viral claim with new platform data
   */
  private async updateViralClaim(
    claimId: number, 
    newPlatformData?: {
      platform: string;
      engagements: number;
      shares: number;
      comments: number;
      reach: number;
    }
  ): Promise<ViralClaim> {
    
    const [existing] = await db
      .select()
      .from(viralClaims)
      .where(eq(viralClaims.id, claimId))
      .limit(1);
    
    if (!existing) {
      throw new Error('Viral claim not found');
    }
    
    let updatedPlatformData = existing.platformData;
    let newReach = existing.estimatedReach || 0;
    
    if (newPlatformData) {
      const currentData = Array.isArray(existing.platformData) 
        ? existing.platformData 
        : existing.platformData ? [existing.platformData] : [];
      
      updatedPlatformData = [...currentData, newPlatformData];
      newReach = Math.max(newReach, newPlatformData.reach);
    }
    
    // Calculate growth rate
    const firstSeenTime = existing.firstSeen ? existing.firstSeen.getTime() : Date.now();
    const timeDiff = Date.now() - firstSeenTime;
    const hoursElapsed = timeDiff / (1000 * 60 * 60);
    const oldReach = existing.estimatedReach || 1;
    const growthRate = hoursElapsed > 0 ? (newReach / oldReach) / hoursElapsed : 0;
    
    const [updated] = await db
      .update(viralClaims)
      .set({
        platformData: updatedPlatformData,
        estimatedReach: newReach,
        growthRate,
        updatedAt: new Date(),
      })
      .where(eq(viralClaims.id, claimId))
      .returning();
    
    return updated;
  }
  
  /**
   * Check if a viral claim should trigger an alert
   */
  private async checkForAlert(claim: ViralClaim): Promise<void> {
    const shouldAlert = 
      claim.urgencyLevel === 'critical' ||
      (claim.estimatedReach || 0) > 100000 ||
      (claim.growthRate || 0) > 2.0;
    
    if (shouldAlert) {
      const statementHash = crypto
        .createHash('sha256')
        .update(claim.claimText)
        .digest('hex');
      
      let alertLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      
      if (claim.urgencyLevel === 'critical' || (claim.estimatedReach || 0) > 500000) {
        alertLevel = 'critical';
      } else if ((claim.estimatedReach || 0) > 250000 || (claim.growthRate || 0) > 5.0) {
        alertLevel = 'high';
      }
      
      await this.createAlert(
        statementHash,
        `Viral claim detected: "${claim.claimText.slice(0, 100)}..."`,
        alertLevel,
        [] // TODO: Extract platforms from platform data
      );
    }
  }
}

export const misinformationTrackingService = new MisinformationTrackingService();