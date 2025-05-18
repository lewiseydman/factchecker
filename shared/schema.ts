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

// Fact check table
export const factChecks = pgTable("fact_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  statement: text("statement").notNull(),
  isTrue: boolean("is_true").notNull(),
  explanation: text("explanation").notNull(),
  sources: jsonb("sources"),
  savedByUser: boolean("saved_by_user").default(false),
  checkedAt: timestamp("checked_at").defaultNow(),
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

export const insertFactCheckSchema = createInsertSchema(factChecks).omit({
  id: true,
  checkedAt: true,
});
export type InsertFactCheck = z.infer<typeof insertFactCheckSchema>;
export type FactCheck = typeof factChecks.$inferSelect;

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
