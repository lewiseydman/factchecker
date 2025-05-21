import { db } from "./db";
import { subscriptionTiers } from "@shared/schema";

/**
 * Script to create default subscription tiers if they don't exist
 */
export async function setupDefaultTiers() {
  try {
    // First verify database connection
    try {
      // Check if tiers already exist with a timeout
      const existingTiers = await Promise.race([
        db.select().from(subscriptionTiers),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database connection timeout")), 2000)
        )
      ]) as any[];
      
      if (existingTiers.length === 0) {
        console.log("Creating default subscription tiers...");
        
        // Basic tier
        await db.insert(subscriptionTiers).values({
          name: 'Basic Tier',
          description: 'Perfect for casual users who need occasional fact checks',
          monthlyPriceGBP: '7.99',
          checkerLimit: 15,
          modelCount: 2,
          features: JSON.parse(JSON.stringify([
            'Basic verification using 2 AI models (Perplexity + Llama)',
            'Limited historical context',
            'Basic source list',
            'Save up to 10 fact checks'
          ]))
        });
        
        // Standard tier
        await db.insert(subscriptionTiers).values({
          name: 'Standard Tier',
          description: 'For regular users who need more comprehensive fact checking',
          monthlyPriceGBP: '15.99',
          checkerLimit: 30,
          modelCount: 4,
          features: JSON.parse(JSON.stringify([
            'Enhanced verification using 4 AI models',
            'Detailed historical context',
            'Comprehensive source verification',
            'Save unlimited fact checks',
            'Domain detection',
            'Confidence scoring'
          ]))
        });
        
        // Premium tier
        await db.insert(subscriptionTiers).values({
          name: 'Premium Tier',
          description: 'Our most comprehensive fact checking service',
          monthlyPriceGBP: '29.99',
          checkerLimit: 75,
          modelCount: 6,
          features: JSON.parse(JSON.stringify([
            'Complete verification using all 6 AI models',
            'In-depth historical analysis', 
            'Premium source credibility assessment',
            'Save unlimited fact checks',
            'Breakdown of AI model contributions',
            'Downloadable reports',
            'Priority processing'
          ]))
        });
        
        console.log("Default subscription tiers created successfully!");
      } else {
        console.log("Subscription tiers already exist, skipping creation.");
      }
    } catch (connectionError) {
      // Just log that we're skipping this step without crashing the server
      console.log("Database connection issue, skipping tier setup");
    }
  } catch (error) {
    // Only log a simple message to reduce console noise
    console.log("Skipping subscription tier setup");
  }
}