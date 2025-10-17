import { eq, desc, and, gte, lte } from "drizzle-orm";
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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProperties(): Promise<Property[]>;
  getFilteredProperties(filters: PropertyFilters): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
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

  async getFilteredProperties(filters: PropertyFilters): Promise<Property[]> {
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
    
    const query = conditions.length > 0 
      ? db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt))
      : db.select().from(properties).orderBy(desc(properties.createdAt));
    
    return query;
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
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
