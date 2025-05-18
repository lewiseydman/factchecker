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
  isTrue: boolean("is_true").notNull(),
  explanation: text("explanation").notNull(),
  historicalContext: text("historical_context"),
  sources: jsonb("sources"),
  savedByUser: boolean("saved_by_user").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  checkedAt: timestamp("checked_at").defaultNow(),
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

// Tag types
export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Fact check types
export const insertFactCheckSchema = createInsertSchema(factChecks).omit({
  id: true,
  checkedAt: true,
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

// Source type for fact checking
export const sourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export type Source = z.infer<typeof sourceSchema>;
