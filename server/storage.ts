import {
  users,
  factChecks,
  trendingFacts,
  categories,
  tags,
  factCheckTags,
  subscriptionTiers,
  userSubscriptions,
  type User,
  type UpsertUser,
  type FactCheck,
  type InsertFactCheck,
  type TrendingFact,
  type Category,
  type InsertCategory,
  type Tag,
  type InsertTag,
  type FactCheckTag,
  type InsertFactCheckTag,
  type SubscriptionTier,
  type InsertSubscriptionTier,
  type UserSubscription,
  type InsertUserSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Fact check operations
  createFactCheck(factCheck: InsertFactCheck): Promise<FactCheck>;
  getFactCheck(id: number): Promise<FactCheck | undefined>;
  getFactChecksByUser(userId: string, limit?: number): Promise<FactCheck[]>;
  getSavedFactChecksByUser(userId: string): Promise<FactCheck[]>;
  updateFactCheck(id: number, saved: boolean): Promise<FactCheck | undefined>;
  deleteFactCheck(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getFactChecksByCategory(categoryId: number, limit?: number): Promise<FactCheck[]>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: InsertTag): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  addTagToFactCheck(factCheckId: number, tagId: number): Promise<FactCheckTag>;
  removeTagFromFactCheck(factCheckId: number, tagId: number): Promise<boolean>;
  getTagsByFactCheck(factCheckId: number): Promise<Tag[]>;
  getFactChecksByTag(tagId: number, limit?: number): Promise<FactCheck[]>;
  
  // Trending facts operations
  getTrendingFacts(limit?: number): Promise<FactCheck[]>;
  incrementChecksCount(factCheckId: number): Promise<void>;
  
  // Subscription operations
  getSubscriptionTiers(): Promise<SubscriptionTier[]>;
  getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined>;
  createSubscriptionTier(tier: InsertSubscriptionTier): Promise<SubscriptionTier>;
  updateSubscriptionTier(id: number, tier: InsertSubscriptionTier): Promise<SubscriptionTier | undefined>;
  
  // User subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  decrementRemainingChecks(userId: string): Promise<boolean>;
  checkUserSubscriptionStatus(userId: string): Promise<{ 
    canCheck: boolean; 
    checksRemaining: number; 
    tierName: string | null;
    modelCount: number | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Fact check operations
  async createFactCheck(factCheckData: InsertFactCheck): Promise<FactCheck> {
    const [factCheck] = await db
      .insert(factChecks)
      .values(factCheckData)
      .returning();
    
    // Increment trending count
    await this.incrementChecksCount(factCheck.id);
    
    return factCheck;
  }

  async getFactCheck(id: number): Promise<FactCheck | undefined> {
    const [factCheck] = await db
      .select()
      .from(factChecks)
      .where(eq(factChecks.id, id));
    return factCheck;
  }

  async getFactChecksByUser(userId: string, limit = 10): Promise<FactCheck[]> {
    return db
      .select()
      .from(factChecks)
      .where(eq(factChecks.userId, userId))
      .orderBy(desc(factChecks.checkedAt))
      .limit(limit);
  }
  
  // Get most recent fact checks, regardless of user
  async getRecentFactChecks(limit = 10): Promise<FactCheck[]> {
    return db
      .select({
        id: factChecks.id,
        userId: factChecks.userId,
        statement: factChecks.statement,
        isTrue: factChecks.isTrue,
        explanation: factChecks.explanation,
        historicalContext: factChecks.historicalContext,
        sources: factChecks.sources,
        savedByUser: factChecks.savedByUser,
        checkedAt: factChecks.checkedAt,
        categoryId: factChecks.categoryId,
        confidenceScore: factChecks.confidenceScore,
        serviceBreakdown: factChecks.serviceBreakdown
      })
      .from(factChecks)
      .orderBy(desc(factChecks.checkedAt))
      .limit(limit);
  }

  async getSavedFactChecksByUser(userId: string): Promise<FactCheck[]> {
    return db
      .select()
      .from(factChecks)
      .where(and(
        eq(factChecks.userId, userId),
        eq(factChecks.savedByUser, true)
      ))
      .orderBy(desc(factChecks.checkedAt));
  }

  async updateFactCheck(id: number, saved: boolean): Promise<FactCheck | undefined> {
    const [updated] = await db
      .update(factChecks)
      .set({ savedByUser: saved })
      .where(eq(factChecks.id, id))
      .returning();
    return updated;
  }

  async deleteFactCheck(id: number): Promise<boolean> {
    try {
      // First delete any associated tags
      await db
        .delete(factCheckTags)
        .where(eq(factCheckTags.factCheckId, id));
      
      // Delete related trending facts entry - using factCheckId which is the correct column
      await db
        .delete(trendingFacts)
        .where(eq(trendingFacts.factCheckId, id));
      
      // Then delete the fact check itself
      const result = await db
        .delete(factChecks)
        .where(eq(factChecks.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteFactCheck:", error);
      throw error;
    }
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryData: InsertCategory): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Update any fact checks that use this category to have null category
    await db
      .update(factChecks)
      .set({ categoryId: null })
      .where(eq(factChecks.categoryId, id));
    
    // Delete the category
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id));
    
    return !!result;
  }

  async getFactChecksByCategory(categoryId: number, limit = 10): Promise<FactCheck[]> {
    return db
      .select()
      .from(factChecks)
      .where(eq(factChecks.categoryId, categoryId))
      .orderBy(desc(factChecks.checkedAt))
      .limit(limit);
  }
  
  // Tag operations
  async getTags(): Promise<Tag[]> {
    return db
      .select()
      .from(tags)
      .orderBy(tags.name);
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));
    return tag;
  }

  async createTag(tagData: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(tagData)
      .returning();
    return tag;
  }

  async updateTag(id: number, tagData: InsertTag): Promise<Tag | undefined> {
    const [tag] = await db
      .update(tags)
      .set(tagData)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    // First remove tag associations
    await db
      .delete(factCheckTags)
      .where(eq(factCheckTags.tagId, id));
    
    // Then delete the tag
    const result = await db
      .delete(tags)
      .where(eq(tags.id, id));
    
    return !!result;
  }

  async addTagToFactCheck(factCheckId: number, tagId: number): Promise<FactCheckTag> {
    // Check if association already exists
    const [existing] = await db
      .select()
      .from(factCheckTags)
      .where(and(
        eq(factCheckTags.factCheckId, factCheckId),
        eq(factCheckTags.tagId, tagId)
      ));
    
    if (existing) {
      return existing;
    }
    
    // Create new association
    const [association] = await db
      .insert(factCheckTags)
      .values({ factCheckId, tagId })
      .returning();
    
    return association;
  }

  async removeTagFromFactCheck(factCheckId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(factCheckTags)
      .where(and(
        eq(factCheckTags.factCheckId, factCheckId),
        eq(factCheckTags.tagId, tagId)
      ));
    
    return !!result;
  }

  async getTagsByFactCheck(factCheckId: number): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt
      })
      .from(factCheckTags)
      .innerJoin(tags, eq(factCheckTags.tagId, tags.id))
      .where(eq(factCheckTags.factCheckId, factCheckId));
    
    return result;
  }

  async getFactChecksByTag(tagId: number, limit = 10): Promise<FactCheck[]> {
    const result = await db
      .select({
        id: factChecks.id,
        userId: factChecks.userId,
        statement: factChecks.statement,
        isTrue: factChecks.isTrue,
        explanation: factChecks.explanation,
        historicalContext: factChecks.historicalContext,
        sources: factChecks.sources,
        savedByUser: factChecks.savedByUser,
        checkedAt: factChecks.checkedAt,
        categoryId: factChecks.categoryId
      })
      .from(factCheckTags)
      .innerJoin(factChecks, eq(factCheckTags.factCheckId, factChecks.id))
      .where(eq(factCheckTags.tagId, tagId))
      .orderBy(desc(factChecks.checkedAt))
      .limit(limit);
    
    return result;
  }

  // Trending facts operations
  async getTrendingFacts(limit = 10): Promise<FactCheck[]> {
    const result = await db
      .select({
        id: factChecks.id,
        userId: factChecks.userId,
        statement: factChecks.statement,
        isTrue: factChecks.isTrue,
        explanation: factChecks.explanation,
        historicalContext: factChecks.historicalContext,
        sources: factChecks.sources,
        savedByUser: factChecks.savedByUser,
        checkedAt: factChecks.checkedAt,
        categoryId: factChecks.categoryId,
        confidenceScore: factChecks.confidenceScore,
        serviceBreakdown: factChecks.serviceBreakdown
      })
      .from(factChecks)
      .leftJoin(trendingFacts, eq(factChecks.id, trendingFacts.factCheckId))
      .orderBy(desc(trendingFacts.checksCount))
      .limit(limit);
      
    return result;
  }

  async incrementChecksCount(factCheckId: number): Promise<void> {
    // Check if the fact is already in trending
    const [existingTrending] = await db
      .select()
      .from(trendingFacts)
      .where(eq(trendingFacts.factCheckId, factCheckId));

    if (existingTrending) {
      // Increment count if it exists
      await db
        .update(trendingFacts)
        .set({ 
          checksCount: sql`${trendingFacts.checksCount} + 1` 
        })
        .where(eq(trendingFacts.factCheckId, factCheckId));
    } else {
      // Add to trending if it doesn't exist
      await db
        .insert(trendingFacts)
        .values({
          factCheckId,
          checksCount: 1
        });
    }
  }

  // Subscription tier operations
  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return await db.select().from(subscriptionTiers).orderBy(subscriptionTiers.monthlyPriceGBP);
  }

  async getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined> {
    const [tier] = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.id, id));
    return tier;
  }

  async createSubscriptionTier(tier: InsertSubscriptionTier): Promise<SubscriptionTier> {
    const [newTier] = await db
      .insert(subscriptionTiers)
      .values(tier)
      .returning();
    return newTier;
  }

  async updateSubscriptionTier(id: number, tier: InsertSubscriptionTier): Promise<SubscriptionTier | undefined> {
    const [updatedTier] = await db
      .update(subscriptionTiers)
      .set({ ...tier, updatedAt: new Date() })
      .where(eq(subscriptionTiers.id, id))
      .returning();
    return updatedTier;
  }

  // User subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.isActive, true)
      ));
    return subscription;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [newSubscription] = await db
      .insert(userSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateUserSubscription(
    id: number, 
    subscription: Partial<InsertUserSubscription>
  ): Promise<UserSubscription | undefined> {
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async decrementRemainingChecks(userId: string): Promise<boolean> {
    try {
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.isActive, true)
        ));
      
      if (!subscription || subscription.checksRemaining <= 0) {
        return false;
      }
      
      await db
        .update(userSubscriptions)
        .set({ 
          checksRemaining: subscription.checksRemaining - 1,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, subscription.id));
      
      return true;
    } catch (error) {
      console.error("Error decrementing remaining checks:", error);
      return false;
    }
  }
  
  async checkUserSubscriptionStatus(userId: string): Promise<{ 
    canCheck: boolean; 
    checksRemaining: number; 
    tierName: string | null;
    modelCount: number | null;
  }> {
    try {
      // Default return for non-subscribed users - free tier
      const defaultResponse = {
        canCheck: true, // Allow a certain number of free checks for everyone
        checksRemaining: 3, // Default free checks
        tierName: "Free Tier",
        modelCount: 2 // Limited to 2 models in free tier
      };
      
      // For non-authenticated users
      if (!userId) {
        return defaultResponse;
      }
      
      const [subscription] = await db
        .select({
          subscription: userSubscriptions,
          tier: subscriptionTiers
        })
        .from(userSubscriptions)
        .where(and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.isActive, true)
        ))
        .innerJoin(subscriptionTiers, eq(userSubscriptions.tierId, subscriptionTiers.id));
      
      // If no active subscription, return free tier status
      if (!subscription) {
        return defaultResponse;
      }
      
      return {
        canCheck: subscription.subscription.checksRemaining > 0,
        checksRemaining: subscription.subscription.checksRemaining,
        tierName: subscription.tier.name,
        modelCount: subscription.tier.modelCount
      };
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // Return free tier on error for graceful degradation
      return {
        canCheck: true,
        checksRemaining: 3,
        tierName: "Free Tier",
        modelCount: 2
      };
    }
  }
}

export const storage = new DatabaseStorage();
