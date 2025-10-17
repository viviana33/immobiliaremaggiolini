import { eq, desc, asc, and, gte, lte, count } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  properties, 
  propertiesImages,
  type User, 
  type InsertUser,
  type Property,
  type InsertProperty,
  type PropertyImage,
  type InsertPropertyImage,
  type PropertyFilters
} from "@shared/schema";

export interface PaginatedProperties {
  properties: Property[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProperties(): Promise<Property[]>;
  getFilteredProperties(filters: PropertyFilters): Promise<PaginatedProperties>;
  getPropertyById(id: string): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  getSimilarProperties(propertyId: string, limit?: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<void>;
  
  getPropertyImages(propertyId: string): Promise<PropertyImage[]>;
  createPropertyImage(image: InsertPropertyImage): Promise<PropertyImage>;
  deletePropertyImage(id: string): Promise<void>;
  archivePropertyImages(propertyId: string, keepCount: number): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getFilteredProperties(filters: PropertyFilters): Promise<PaginatedProperties> {
    const conditions = [];
    
    if (filters.tipo) {
      conditions.push(eq(properties.tipo, filters.tipo));
    }
    
    if (filters.prezzoMin !== undefined) {
      conditions.push(gte(properties.prezzo, filters.prezzoMin.toString()));
    }
    
    if (filters.prezzoMax !== undefined) {
      conditions.push(lte(properties.prezzo, filters.prezzoMax.toString()));
    }
    
    if (filters.mqMin !== undefined) {
      conditions.push(gte(properties.mq, filters.mqMin));
    }
    
    const orderBy = this.getOrderBy(filters.sort);
    const page = filters.page || 1;
    const perPage = filters.perPage || 12;
    const offset = (page - 1) * perPage;
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(whereClause);
    
    const total = totalResult?.count || 0;
    const totalPages = Math.ceil(total / perPage);
    
    const propertiesList = whereClause
      ? await db.select().from(properties).where(whereClause).orderBy(orderBy).limit(perPage).offset(offset)
      : await db.select().from(properties).orderBy(orderBy).limit(perPage).offset(offset);
    
    return {
      properties: propertiesList,
      total,
      page,
      perPage,
      totalPages,
    };
  }
  
  private getOrderBy(sort?: string) {
    switch (sort) {
      case "prezzo_asc":
        return asc(properties.prezzo);
      case "prezzo_desc":
        return desc(properties.prezzo);
      case "mq_asc":
        return asc(properties.mq);
      case "mq_desc":
        return desc(properties.mq);
      case "recente":
      default:
        return desc(properties.createdAt);
    }
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.slug, slug));
    return property;
  }

  async getSimilarProperties(propertyId: string, limit: number = 3): Promise<Property[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property) return [];
    
    const priceRange = Number(property.prezzo) * 0.2;
    const minPrice = (Number(property.prezzo) - priceRange).toString();
    const maxPrice = (Number(property.prezzo) + priceRange).toString();
    
    const similar = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.tipo, property.tipo),
          eq(properties.zona, property.zona),
          gte(properties.prezzo, minPrice),
          lte(properties.prezzo, maxPrice)
        )
      )
      .limit(limit + 1);
    
    return similar.filter((p: Property) => p.id !== propertyId).slice(0, limit);
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    return db.select().from(propertiesImages).where(eq(propertiesImages.propertyId, propertyId));
  }

  async createPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    const [newImage] = await db.insert(propertiesImages).values(image).returning();
    return newImage;
  }

  async deletePropertyImage(id: string): Promise<void> {
    await db.delete(propertiesImages).where(eq(propertiesImages.id, id));
  }

  async archivePropertyImages(propertyId: string, keepCount: number): Promise<void> {
    const images = await db
      .select()
      .from(propertiesImages)
      .where(eq(propertiesImages.propertyId, propertyId))
      .orderBy(desc(propertiesImages.createdAt));
    
    const nonArchivedImages = images.filter((img: PropertyImage) => !img.archiviato);
    
    if (nonArchivedImages.length > keepCount) {
      const imagesToArchive = nonArchivedImages.slice(keepCount);
      for (const img of imagesToArchive) {
        await db
          .update(propertiesImages)
          .set({ archiviato: true })
          .where(eq(propertiesImages.id, img.id));
      }
    }
  }
}

export const storage = new DbStorage();
