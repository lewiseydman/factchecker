import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  serial,
  integer,
  unique,
  numeric,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for fact checks
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tags for fact checks
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fact check table
export const factChecks = pgTable("fact_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  statement: text("statement").notNull(),
  originalInput: text("original_input"), // Store the user's original input
  inputType: varchar("input_type", { length: 20 }), // question, statement, opinion, speculative
  isTrue: boolean("is_true").notNull(),
  explanation: text("explanation").notNull(),
  historicalContext: text("historical_context"),
  sources: jsonb("sources"),
  savedByUser: boolean("saved_by_user").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  checkedAt: timestamp("checked_at").defaultNow(),
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }),
  serviceBreakdown: jsonb("service_breakdown"),
  tierName: varchar("tier_name", { length: 50 }),
  modelsUsed: integer("models_used"),
  inputProcessingContext: text("input_processing_context"), // Processing context and reasoning
});

// Many-to-many relationship between fact checks and tags
export const factCheckTags = pgTable("fact_check_tags", {
  id: serial("id").primaryKey(),
  factCheckId: integer("fact_check_id").notNull().references(() => factChecks.id, { onDelete: 'cascade' }),
  tagId: integer("tag_id").notNull().references(() => tags.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    factCheckTagUnique: unique().on(table.factCheckId, table.tagId),
  }
});

// Trending facts table
export const trendingFacts = pgTable("trending_facts", {
  id: serial("id").primaryKey(),
  factCheckId: serial("fact_check_id").references(() => factChecks.id).notNull(),
  checksCount: serial("checks_count"),
  addedAt: timestamp("added_at").defaultNow(),
});

// Subscription tiers table
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description").notNull(),
  monthlyPriceGBP: numeric("monthly_price_gbp", { precision: 10, scale: 2 }).notNull(),
  checkerLimit: integer("checker_limit").notNull(),
  modelCount: integer("model_count").notNull(),
  features: jsonb("features").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tierId: integer("tier_id").references(() => subscriptionTiers.id).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  checksRemaining: integer("checks_remaining").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Category types
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Subscription types
export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// Tag types
export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Define source schema first to avoid circular references
export const sourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export type Source = z.infer<typeof sourceSchema>;

// Service breakdown schema
export const serviceBreakdownSchema = z.object({
  name: z.string(),
  verdict: z.string(),
  confidence: z.number()
});

// Fact check types
export const insertFactCheckSchema = createInsertSchema(factChecks)
  .omit({
    id: true,
    checkedAt: true,
  })
  .extend({
    // Override any fields that need special handling
    confidenceScore: z.number().transform(val => String(val)), // Convert number to string for the numeric field
    sources: z.array(sourceSchema),
    serviceBreakdown: z.array(serviceBreakdownSchema),
    tierName: z.string().optional(),
    modelsUsed: z.number().optional()
  });
export type InsertFactCheck = z.infer<typeof insertFactCheckSchema>;
export type FactCheck = typeof factChecks.$inferSelect;

// Fact check tag types
export const insertFactCheckTagSchema = createInsertSchema(factCheckTags).omit({
  id: true,
  createdAt: true,
});
export type InsertFactCheckTag = z.infer<typeof insertFactCheckTagSchema>;
export type FactCheckTag = typeof factCheckTags.$inferSelect;

// Trending fact types
export const insertTrendingFactSchema = createInsertSchema(trendingFacts).omit({
  id: true,
  addedAt: true,
});
export type InsertTrendingFact = z.infer<typeof insertTrendingFactSchema>;
export type TrendingFact = typeof trendingFacts.$inferSelect;

// Context-aware fact-checking tables
export const publicFigures = pgTable("public_figures", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  title: varchar("title"), // e.g., "President", "CEO", "Scientist"
  organization: varchar("organization"),
  politicalAffiliation: varchar("political_affiliation"),
  credibilityScore: real("credibility_score").default(0.5), // 0-1 scale
  totalStatements: integer("total_statements").default(0),
  accurateStatements: integer("accurate_statements").default(0),
  verificationSource: varchar("verification_source"), // How we identified this person
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const statementSources = pgTable("statement_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // e.g., "Twitter", "CNN Interview", "Press Conference"
  type: varchar("type").notNull(), // "social_media", "news_interview", "speech", "document"
  credibilityRating: real("credibility_rating").default(0.5), // 0-1 scale
  verificationStandards: varchar("verification_standards"), // How this source verifies information
  biasRating: varchar("bias_rating"), // "left", "right", "center", "unknown"
  createdAt: timestamp("created_at").defaultNow(),
});

export const claimContexts = pgTable("claim_contexts", {
  id: serial("id").primaryKey(),
  factCheckId: integer("fact_check_id").notNull().references(() => factChecks.id),
  speakerId: integer("speaker_id").references(() => publicFigures.id),
  sourceId: integer("source_id").references(() => statementSources.id),
  originalContext: text("original_context"), // Full context where statement was made
  dateSpoken: timestamp("date_spoken"),
  location: varchar("location"), // Where the statement was made
  audience: varchar("audience"), // Who the statement was directed to
  intentCategory: varchar("intent_category"), // "informational", "persuasive", "misleading", "satirical"
  politicalContext: varchar("political_context"), // Election period, policy debate, etc.
  urgency: varchar("urgency").default("normal"), // "breaking", "trending", "normal"
  crossReferences: text("cross_references").array(), // Related statements or fact-checks
  createdAt: timestamp("created_at").defaultNow(),
});

// Misinformation tracking tables
export const misinformationAlerts = pgTable("misinformation_alerts", {
  id: serial("id").primaryKey(),
  statementHash: varchar("statement_hash").notNull(), // Hash of the core claim
  firstDetected: timestamp("first_detected").defaultNow(),
  viralityScore: real("virality_score").default(0), // How widely spread
  platformsDetected: varchar("platforms_detected").array().default([]), // Social media platforms
  relatedFactChecks: integer("related_fact_checks").array().default([]), // Fact check IDs
  alertLevel: varchar("alert_level").default("low"), // "low", "medium", "high", "critical"
  description: text("description"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const viralClaims = pgTable("viral_claims", {
  id: serial("id").primaryKey(),
  claimText: text("claim_text").notNull(),
  firstSeen: timestamp("first_seen").defaultNow(),
  platformData: jsonb("platform_data"), // Engagement metrics from different platforms
  factCheckStatus: varchar("fact_check_status").default("pending"), // "pending", "verified", "false", "mixed"
  urgencyLevel: varchar("urgency_level").default("normal"), // "low", "normal", "high", "critical"
  estimatedReach: integer("estimated_reach").default(0),
  growthRate: real("growth_rate").default(0), // Rate of spread
  relatedAlertId: integer("related_alert_id").references(() => misinformationAlerts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types for new tables
export const insertPublicFigureSchema = createInsertSchema(publicFigures).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});
export type InsertPublicFigure = z.infer<typeof insertPublicFigureSchema>;
export type PublicFigure = typeof publicFigures.$inferSelect;

export const insertStatementSourceSchema = createInsertSchema(statementSources).omit({
  id: true,
  createdAt: true,
});
export type InsertStatementSource = z.infer<typeof insertStatementSourceSchema>;
export type StatementSource = typeof statementSources.$inferSelect;

export const insertClaimContextSchema = createInsertSchema(claimContexts).omit({
  id: true,
  createdAt: true,
});
export type InsertClaimContext = z.infer<typeof insertClaimContextSchema>;
export type ClaimContext = typeof claimContexts.$inferSelect;

export const insertMisinformationAlertSchema = createInsertSchema(misinformationAlerts).omit({
  id: true,
  firstDetected: true,
  lastUpdated: true,
});
export type InsertMisinformationAlert = z.infer<typeof insertMisinformationAlertSchema>;
export type MisinformationAlert = typeof misinformationAlerts.$inferSelect;

export const insertViralClaimSchema = createInsertSchema(viralClaims).omit({
  id: true,
  firstSeen: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertViralClaim = z.infer<typeof insertViralClaimSchema>;
export type ViralClaim = typeof viralClaims.$inferSelect;
