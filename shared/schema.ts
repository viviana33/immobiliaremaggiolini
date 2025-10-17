import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums per i tipi
export const propertyTypeEnum = pgEnum("property_type", ["vendita", "affitto"]);
export const propertyStatusEnum = pgEnum("property_status", ["disponibile", "venduto", "affittato", "riservato"]);
export const energyClassEnum = pgEnum("energy_class", ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"]);
export const postStatusEnum = pgEnum("post_status", ["bozza", "pubblicato", "archiviato"]);

// Tabella properties (immobili)
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  titolo: text("titolo").notNull(),
  descrizione: text("descrizione").notNull(),
  prezzo: decimal("prezzo", { precision: 10, scale: 2 }).notNull(),
  tipo: propertyTypeEnum("tipo").notNull(),
  mq: integer("mq").notNull(),
  stanze: integer("stanze").notNull(),
  bagni: integer("bagni").notNull(),
  piano: integer("piano").notNull(),
  classeEnergetica: energyClassEnum("classe_energetica").notNull(),
  zona: text("zona").notNull(),
  stato: propertyStatusEnum("stato").notNull().default("disponibile"),
  linkVideo: text("link_video"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabella properties_images (immagini degli immobili)
export const propertiesImages = pgTable("properties_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  urlHot: text("url_hot").notNull(),
  urlCold: text("url_cold").notNull(),
  hashFile: text("hash_file").notNull(),
  archiviato: boolean("archiviato").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tabella posts (blog)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titolo: text("titolo").notNull(),
  sottotitolo: text("sottotitolo"),
  slug: text("slug").notNull().unique(),
  cover: text("cover"),
  contenuto: text("contenuto").notNull(),
  readingTimeMin: integer("reading_time_min"),
  tag: text("tag").array().default(sql`ARRAY[]::text[]`),
  categoria: text("categoria"),
  autore: text("autore").notNull(),
  stato: postStatusEnum("stato").notNull().default("bozza"),
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabella leads (contatti)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  messaggio: text("messaggio").notNull(),
  fonte: text("fonte"),
  newsletter: boolean("newsletter").notNull().default(false),
  ip: text("ip"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tabella users (già esistente - mantenuta)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Insert schemas per properties
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Insert schemas per properties_images
export const insertPropertyImageSchema = createInsertSchema(propertiesImages).omit({
  id: true,
  createdAt: true,
});

export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type PropertyImage = typeof propertiesImages.$inferSelect;

// Insert schemas per posts
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Insert schemas per leads
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Insert schemas per users (già esistente - mantenuto)
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Property filters schema
export const propertyFiltersSchema = z.object({
  tipo: z.enum(["vendita", "affitto"]).optional(),
  prezzoMin: z.coerce.number().positive().optional(),
  prezzoMax: z.coerce.number().positive().optional(),
  mqMin: z.coerce.number().positive().optional(),
  sort: z.enum(["recente", "prezzo_asc", "prezzo_desc", "mq_asc", "mq_desc"]).optional(),
  page: z.coerce.number().positive().optional(),
  perPage: z.coerce.number().positive().max(100).optional(),
});

export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;
