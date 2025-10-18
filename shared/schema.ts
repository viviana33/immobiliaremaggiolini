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

// Tabella posts_images (galleria immagini dei post)
export const postsImages = pgTable("posts_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  fileHash: text("file_hash").notNull(),
  hotUrl: text("hot_url").notNull(),
  coldKey: text("cold_key").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
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

// Tabella subscriptions (iscrizioni newsletter)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  nome: text("nome"),
  blogUpdates: boolean("blog_updates").notNull().default(false),
  newListings: boolean("new_listings").notNull().default(false),
  source: text("source"),
  consentTs: timestamp("consent_ts").notNull().default(sql`now()`),
  consentIp: text("consent_ip"),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmToken: text("confirm_token"),
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

// Insert schemas per posts_images
export const insertPostImageSchema = createInsertSchema(postsImages).omit({
  id: true,
  createdAt: true,
});

export type InsertPostImage = z.infer<typeof insertPostImageSchema>;
export type PostImage = typeof postsImages.$inferSelect;

// Insert schemas per leads
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Insert schemas per subscriptions
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  confirmed: true,
  confirmToken: true,
  consentTs: true,
}).extend({
  email: z.string().email("Email non valida"),
  nome: z.string().optional(),
  blogUpdates: z.boolean().default(false),
  newListings: z.boolean().default(false),
  source: z.string().optional(),
  consentIp: z.string().optional(),
});

// Update subscription schema per PUT (senza richiedere privacy)
export const updateSubscriptionSchema = z.object({
  email: z.string().email("Email non valida"),
  blogUpdates: z.boolean().optional(),
  newListings: z.boolean().optional(),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

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

export const postFiltersSchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  categoria: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  perPage: z.coerce.number().positive().max(50).optional(),
});

export type PostFilters = z.infer<typeof postFiltersSchema>;
