import { eq, desc, asc, and, gte, lte, count } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  properties, 
  propertiesImages,
  posts,
  postsImages,
  type User, 
  type InsertUser,
  type Property,
  type InsertProperty,
  type PropertyImage,
  type InsertPropertyImage,
  type PropertyFilters,
  type Post,
  type InsertPost,
  type PostImage,
  type InsertPostImage
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
  
  getAllPosts(): Promise<Post[]>;
  getPublishedPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;
  
  getPostImages(postId: string): Promise<PostImage[]>;
  getPostImageByHash(postId: string, fileHash: string): Promise<PostImage | undefined>;
  createPostImage(image: InsertPostImage): Promise<PostImage>;
  deletePostImage(id: string): Promise<void>;
  updatePostImagePositions(updates: { id: string; position: number }[]): Promise<void>;
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

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.updatedAt));
  }

  async getPublishedPosts(): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.stato, "pubblicato"))
      .orderBy(desc(posts.publishedAt));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const postData = {
      ...post,
      publishedAt: post.stato === "pubblicato" ? new Date() : null,
    };
    const [newPost] = await db.insert(posts).values(postData).returning();
    return newPost;
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined> {
    // Get existing post to check status change
    const existingPost = await this.getPostById(id);
    
    const updateData: any = { ...post, updatedAt: new Date() };
    
    // If changing status from bozza to pubblicato, set publishedAt
    if (post.stato === "pubblicato" && existingPost?.stato !== "pubblicato") {
      updateData.publishedAt = new Date();
    }
    
    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostImages(postId: string): Promise<PostImage[]> {
    return db
      .select()
      .from(postsImages)
      .where(eq(postsImages.postId, postId))
      .orderBy(asc(postsImages.position));
  }

  async getPostImageByHash(postId: string, fileHash: string): Promise<PostImage | undefined> {
    const [image] = await db
      .select()
      .from(postsImages)
      .where(and(eq(postsImages.postId, postId), eq(postsImages.fileHash, fileHash)));
    return image;
  }

  async createPostImage(image: InsertPostImage): Promise<PostImage> {
    const [newImage] = await db.insert(postsImages).values(image).returning();
    return newImage;
  }

  async deletePostImage(id: string): Promise<void> {
    await db.delete(postsImages).where(eq(postsImages.id, id));
  }

  async updatePostImagePositions(updates: { id: string; position: number }[]): Promise<void> {
    for (const update of updates) {
      await db
        .update(postsImages)
        .set({ position: update.position })
        .where(eq(postsImages.id, update.id));
    }
  }
}

export const storage = new DbStorage();
