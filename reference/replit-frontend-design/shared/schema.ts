import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  pageNumber: integer("page_number"),
  excerpt: text("excerpt").notNull(),
  sourceUrl: text("source_url").notNull(),
  date: text("date"),
  names: text("names").array().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export interface DocumentMatch {
  documentTitle: string;
  excerpt: string;
  pageNumber: number;
  sourceUrl: string;
  date?: string;
}

export interface SearchResult {
  name: string;
  found: boolean;
  matches: DocumentMatch[];
}
