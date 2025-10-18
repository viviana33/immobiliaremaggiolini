import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAdmin } from "./middleware/auth";
import multer from "multer";
import { uploadService } from "./uploadService";
import { insertPropertySchema, propertyFiltersSchema, insertPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { token } = req.body;
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      return res.status(500).json({ 
        success: false, 
        message: "Configurazione server non corretta. Contatta l'amministratore." 
      });
    }
    
    if (token === adminToken) {
      req.session.isAdmin = true;
      return res.json({ success: true, message: "Login effettuato con successo" });
    }
    
    return res.status(401).json({ success: false, message: "Token non valido" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Errore durante il logout" });
      }
      res.json({ success: true, message: "Logout effettuato con successo" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAdmin });
  });

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 10 * 1024 * 1024,
      files: 15
    }
  });

  app.get("/api/properties", async (req, res) => {
    try {
      const filterResult = propertyFiltersSchema.safeParse(req.query);
      const filters = filterResult.success ? filterResult.data : {};
      
      const result = await storage.getFilteredProperties(filters);
      
      const formattedProperties = result.properties.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.titolo,
        price: p.prezzo,
        for_rent: p.tipo === "affitto",
        area_mq: p.mq,
        location: p.zona,
      }));
      
      res.json({
        properties: formattedProperties,
        pagination: {
          total: result.total,
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Errore nel recupero degli immobili" });
    }
  });

  app.get("/api/properties/:slug", async (req, res) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: "Immobile non trovato" });
      }
      
      const images = await storage.getPropertyImages(property.id);
      const activeImages = images.filter(img => !img.archiviato).slice(0, 15);
      
      const similarProperties = property.stato !== "disponibile" 
        ? await storage.getSimilarProperties(property.id, 3)
        : [];
      
      res.json({ 
        ...property, 
        images: activeImages,
        similarProperties 
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Errore nel recupero dell'immobile" });
    }
  });

  app.get("/api/admin/properties", requireAdmin, async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Errore nel recupero degli immobili" });
    }
  });

  app.get("/api/admin/properties/:id", requireAdmin, async (req, res) => {
    try {
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Immobile non trovato" });
      }
      
      const images = await storage.getPropertyImages(req.params.id);
      res.json({ ...property, images });
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Errore nel recupero dell'immobile" });
    }
  });

  app.post("/api/admin/properties", requireAdmin, upload.array("images", 15), async (req, res) => {
    try {
      const formData = {
        ...req.body,
        mq: parseInt(req.body.mq),
        stanze: parseInt(req.body.stanze),
        bagni: parseInt(req.body.bagni),
        piano: parseInt(req.body.piano),
        prezzo: req.body.prezzo,
      };
      
      const validatedData = insertPropertySchema.parse(formData);
      
      const property = await storage.createProperty(validatedData);
      
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const result = await uploadService.uploadImage(file.buffer, file.originalname);
          return storage.createPropertyImage({
            propertyId: property.id,
            urlHot: result.urlHot,
            urlCold: result.urlCold,
            hashFile: result.hashFile,
          });
        });
        
        await Promise.all(uploadPromises);
      }
      
      res.status(201).json(property);
    } catch (error: any) {
      console.error("Error creating property:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore nella creazione dell'immobile" });
    }
  });

  app.put("/api/admin/properties/:id", requireAdmin, upload.array("images", 15), async (req, res) => {
    try {
      const formData: any = { ...req.body };
      
      if (req.body.mq) formData.mq = parseInt(req.body.mq);
      if (req.body.stanze) formData.stanze = parseInt(req.body.stanze);
      if (req.body.bagni) formData.bagni = parseInt(req.body.bagni);
      if (req.body.piano) formData.piano = parseInt(req.body.piano);
      
      const validatedData = insertPropertySchema.partial().parse(formData);
      
      const updatedProperty = await storage.updateProperty(req.params.id, validatedData);
      
      if (!updatedProperty) {
        return res.status(404).json({ message: "Immobile non trovato" });
      }
      
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const result = await uploadService.uploadImage(file.buffer, file.originalname);
          return storage.createPropertyImage({
            propertyId: updatedProperty.id,
            urlHot: result.urlHot,
            urlCold: result.urlCold,
            hashFile: result.hashFile,
          });
        });
        
        await Promise.all(uploadPromises);
      }
      
      if (updatedProperty.stato === "venduto" || updatedProperty.stato === "affittato") {
        await storage.archivePropertyImages(updatedProperty.id, 3);
      }
      
      res.json(updatedProperty);
    } catch (error: any) {
      console.error("Error updating property:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore nell'aggiornamento dell'immobile" });
    }
  });

  app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProperty(req.params.id);
      res.json({ message: "Immobile eliminato con successo" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Errore nell'eliminazione dell'immobile" });
    }
  });

  app.delete("/api/admin/properties/:propertyId/images/:imageId", requireAdmin, async (req, res) => {
    try {
      await storage.deletePropertyImage(req.params.imageId);
      res.json({ message: "Immagine eliminata con successo" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Errore nell'eliminazione dell'immagine" });
    }
  });

  const uploadPostImage = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 1
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        (req as any).fileValidationError = 'Formato file non supportato. Utilizza JPEG, PNG, WebP o GIF.';
        cb(null, false);
      }
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const filters: { categoria?: string } = {};
      
      if (req.query.categoria && typeof req.query.categoria === 'string') {
        filters.categoria = req.query.categoria;
      }
      
      const posts = await storage.getPublishedPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published posts:", error);
      res.status(500).json({ message: "Errore nel recupero dei post" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post non trovato" });
      }
      
      if (post.stato !== "pubblicato") {
        return res.status(404).json({ message: "Post non disponibile" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Errore nel recupero del post" });
    }
  });

  app.post("/api/admin/upload-post-image", requireAdmin, (req, res, next) => {
    uploadPostImage.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "Il file supera la dimensione massima di 8MB" });
        }
        return res.status(400).json({ message: `Errore nel caricamento: ${err.message}` });
      }
      if (err) {
        return res.status(500).json({ message: "Errore nel caricamento dell'immagine" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if ((req as any).fileValidationError) {
        return res.status(400).json({ message: (req as any).fileValidationError });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nessun file caricato" });
      }

      const file = req.file;

      if (file.size < 1024) {
        return res.status(400).json({ message: "Il file è troppo piccolo" });
      }

      const result = await uploadService.uploadPostImage(file.buffer, file.originalname);
      
      res.json(result);
    } catch (error: any) {
      console.error("Error uploading post image:", error);
      
      if (error.message?.includes('INVALID_IMAGE:')) {
        const message = error.message.replace('INVALID_IMAGE: ', '');
        return res.status(400).json({ message });
      }
      
      if (error.message?.includes('not configured')) {
        return res.status(500).json({ 
          message: "Servizio di storage non configurato. Contatta l'amministratore." 
        });
      }

      res.status(500).json({ message: "Errore nel caricamento dell'immagine" });
    }
  });

  app.get("/api/admin/posts", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Errore nel recupero dei post" });
    }
  });

  app.get("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post non trovato" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Errore nel recupero del post" });
    }
  });

  app.post("/api/admin/posts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      
      // Validate publish requirements if status is "pubblicato"
      if (validatedData.stato === "pubblicato") {
        const errors: Record<string, string> = {};
        
        if (!validatedData.titolo || validatedData.titolo.trim() === "") {
          errors.titolo = "Il titolo è obbligatorio per la pubblicazione";
        }
        
        if (!validatedData.slug || validatedData.slug.trim() === "") {
          errors.slug = "Lo slug è obbligatorio per la pubblicazione";
        }
        
        if (!validatedData.contenuto || validatedData.contenuto.trim() === "") {
          errors.contenuto = "Il contenuto è obbligatorio per la pubblicazione";
        }
        
        if (!validatedData.cover || validatedData.cover.trim() === "") {
          errors.cover = "L'immagine di copertina è obbligatoria per la pubblicazione";
        }
        
        if (Object.keys(errors).length > 0) {
          return res.status(400).json({ 
            message: "Impossibile pubblicare: alcuni campi obbligatori sono mancanti",
            errors 
          });
        }
      }
      
      // Check if slug is unique
      const existingPost = await storage.getAllPosts();
      const slugExists = existingPost.some(p => p.slug === validatedData.slug);
      if (slugExists) {
        return res.status(400).json({ message: "Lo slug è già in uso" });
      }
      
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore nella creazione del post" });
    }
  });

  app.put("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPostSchema.partial().parse(req.body);
      
      // Get existing post to check status change and validate complete data
      const existingPost = await storage.getPostById(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post non trovato" });
      }
      
      // Merge existing data with updates to get the complete final state
      const finalData = { ...existingPost, ...validatedData };
      
      // Validate publish requirements if final status is "pubblicato"
      if (finalData.stato === "pubblicato") {
        const errors: Record<string, string> = {};
        
        if (!finalData.titolo || finalData.titolo.trim() === "") {
          errors.titolo = "Il titolo è obbligatorio per la pubblicazione";
        }
        
        if (!finalData.slug || finalData.slug.trim() === "") {
          errors.slug = "Lo slug è obbligatorio per la pubblicazione";
        }
        
        if (!finalData.contenuto || finalData.contenuto.trim() === "") {
          errors.contenuto = "Il contenuto è obbligatorio per la pubblicazione";
        }
        
        if (!finalData.cover || finalData.cover.trim() === "") {
          errors.cover = "L'immagine di copertina è obbligatoria per la pubblicazione";
        }
        
        if (Object.keys(errors).length > 0) {
          return res.status(400).json({ 
            message: "Impossibile pubblicare: alcuni campi obbligatori sono mancanti",
            errors 
          });
        }
      }
      
      // Check if slug is unique (excluding current post)
      if (validatedData.slug) {
        const existingPosts = await storage.getAllPosts();
        const slugExists = existingPosts.some(p => p.slug === validatedData.slug && p.id !== req.params.id);
        if (slugExists) {
          return res.status(400).json({ message: "Lo slug è già in uso" });
        }
      }
      
      const updatedPost = await storage.updatePost(req.params.id, validatedData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Post non trovato" });
      }
      
      res.json(updatedPost);
    } catch (error: any) {
      console.error("Error updating post:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore nell'aggiornamento del post" });
    }
  });

  app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ message: "Post eliminato con successo" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Errore nell'eliminazione del post" });
    }
  });

  // Post gallery images routes
  app.get("/api/admin/posts/:postId/images", requireAdmin, async (req, res) => {
    try {
      const images = await storage.getPostImages(req.params.postId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching post images:", error);
      res.status(500).json({ message: "Errore nel recupero delle immagini" });
    }
  });

  const uploadPostGalleryImage = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 10
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        (req as any).fileValidationError = 'Formato file non supportato. Utilizza JPEG, PNG, WebP o GIF.';
        cb(null, false);
      }
    }
  });

  app.post("/api/admin/posts/:postId/images", requireAdmin, (req, res, next) => {
    uploadPostGalleryImage.array("images", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "Un file supera la dimensione massima di 8MB" });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: "Puoi caricare massimo 10 immagini alla volta" });
        }
        return res.status(400).json({ message: `Errore nel caricamento: ${err.message}` });
      }
      if (err) {
        return res.status(500).json({ message: "Errore nel caricamento delle immagini" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if ((req as any).fileValidationError) {
        return res.status(400).json({ message: (req as any).fileValidationError });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Nessun file caricato" });
      }

      const postId = req.params.postId;
      
      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post non trovato" });
      }

      // Check current image count
      const existingImages = await storage.getPostImages(postId);
      if (existingImages.length + files.length > 10) {
        return res.status(400).json({ 
          message: `Puoi avere massimo 10 immagini. Attualmente ne hai ${existingImages.length}.` 
        });
      }

      const uploadedImages = [];
      const nextPosition = existingImages.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size < 1024) {
          continue; // Skip files that are too small
        }

        try {
          const uploadResult = await uploadService.uploadPostImage(file.buffer, file.originalname);
          
          // Check for deduplication
          const existingImage = await storage.getPostImageByHash(postId, uploadResult.file_hash);
          if (existingImage) {
            continue; // Skip duplicate images
          }

          const imageRecord = await storage.createPostImage({
            postId,
            fileHash: uploadResult.file_hash,
            hotUrl: uploadResult.hot_url,
            coldKey: uploadResult.cold_key,
            isArchived: false,
            position: nextPosition + uploadedImages.length,
          });

          uploadedImages.push(imageRecord);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with other files
        }
      }

      res.json({ 
        message: `${uploadedImages.length} immagini caricate con successo`,
        images: uploadedImages 
      });
    } catch (error: any) {
      console.error("Error uploading post gallery images:", error);
      res.status(500).json({ message: "Errore nel caricamento delle immagini" });
    }
  });

  app.delete("/api/admin/posts/images/:imageId", requireAdmin, async (req, res) => {
    try {
      await storage.deletePostImage(req.params.imageId);
      res.json({ message: "Immagine eliminata con successo" });
    } catch (error) {
      console.error("Error deleting post image:", error);
      res.status(500).json({ message: "Errore nell'eliminazione dell'immagine" });
    }
  });

  app.put("/api/admin/posts/:postId/images/reorder", requireAdmin, async (req, res) => {
    try {
      const { imageOrders } = req.body;
      
      if (!Array.isArray(imageOrders)) {
        return res.status(400).json({ message: "Dati non validi" });
      }

      await storage.updatePostImagePositions(imageOrders);
      res.json({ message: "Ordine aggiornato con successo" });
    } catch (error) {
      console.error("Error reordering post images:", error);
      res.status(500).json({ message: "Errore nell'aggiornamento dell'ordine" });
    }
  });

  // TODO: Integrare l'invio reale in Fase 7 (Brevo/MailerLite)
  // Endpoint stub per notifica newsletter quando un post viene pubblicato
  // Attualmente registra solo un log, ma sarà sostituito con l'invio reale via provider email
  app.post("/api/admin/notify-post", requireAdmin, async (req, res) => {
    try {
      const { id, title, slug, tags } = req.body;
      
      // Validazione base dei dati
      if (!id || !title || !slug) {
        return res.status(400).json({ message: "Dati incompleti: id, title e slug sono obbligatori" });
      }

      // Log dell'admin che ha richiesto l'invio (se disponibile nell'estensione della sessione)
      const timestamp = new Date().toISOString();
      
      // Stub: per ora solo log, nessun invio reale
      console.log(`[${timestamp}] Richiesta invio newsletter registrata per post: ${title}`);
      console.log(`  - ID: ${id}`);
      console.log(`  - Slug: ${slug}`);
      console.log(`  - Tags: ${tags?.join(", ") || "nessun tag"}`);
      console.log(`  - Admin session: ${req.session.isAdmin ? "authenticated" : "not authenticated"}`);

      res.json({ ok: true });
    } catch (error) {
      console.error("Error in notify-post endpoint:", error);
      res.status(500).json({ message: "Errore nella registrazione della richiesta di invio" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
