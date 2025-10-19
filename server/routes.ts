import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAdmin } from "./middleware/auth";
import { subscriptionRateLimit, listingNotificationRateLimit } from "./middleware/rateLimit";
import multer from "multer";
import { uploadService } from "./uploadService";
import { insertSubscriptionSchema, updateSubscriptionSchema, insertPropertySchema, propertyFiltersSchema, insertPostSchema, postFiltersSchema } from "@shared/schema";
import { getBrevoService } from "./brevoService";
import { registerSubscriptionConfirmRoutes } from "./routes-subscription-confirm";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Registra le route di conferma subscription
  registerSubscriptionConfirmRoutes(app);
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

  app.post("/api/subscribe", subscriptionRateLimit(), async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      
      // Ottieni IP del client
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded 
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';
      
      // Verifica se l'utente esiste già
      const existingSubscription = await storage.getSubscriptionByEmail(validatedData.email);
      
      if (existingSubscription) {
        // Aggiorna le preferenze e consent timestamp
        await storage.updateSubscription(validatedData.email, {
          nome: validatedData.nome,
          blogUpdates: validatedData.blogUpdates,
          newListings: validatedData.newListings,
          source: validatedData.source || 'website',
          consentIp: clientIp,
          consentTs: new Date(),
        });
        
        // Se già confermato, non invia nuova email DOI
        if (existingSubscription.confirmed) {
          return res.json({
            success: true,
            message: "Preferenze aggiornate con successo"
          });
        }
      }
      
      // Token per conferma (anche se Brevo gestisce il suo)
      const confirmToken = crypto.randomBytes(32).toString('hex');
      
      // Crea o aggiorna subscription nel database
      const subscriptionData = {
        ...validatedData,
        source: validatedData.source || 'website',
        consentIp: clientIp,
        confirmToken,
        confirmed: false,
      };
      
      if (existingSubscription) {
        await storage.updateSubscription(validatedData.email, subscriptionData);
      } else {
        await storage.createSubscription(subscriptionData);
      }
      
      // Invia email double opt-in tramite Brevo
      try {
        const brevo = getBrevoService();
        
        const attributes: any = {};
        if (validatedData.nome) {
          attributes.FIRSTNAME = validatedData.nome;
        }
        attributes.BLOG_UPDATES = validatedData.blogUpdates || false;
        attributes.NEW_LISTINGS = validatedData.newListings || false;
        
        await brevo.createContactWithDoubleOptIn({
          email: validatedData.email,
          attributes,
          listIds: [brevo.getDefaultListId()],
          redirectionUrl: `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/preferenze?confirmed=true&email=${encodeURIComponent(validatedData.email)}`
        });
        
        res.json({
          success: true,
          message: "Controlla la tua email per confermare l'iscrizione"
        });
      } catch (brevoError: any) {
        console.error("Errore invio email Brevo:", brevoError);
        
        // Se Brevo non è configurato o API key non valida, rispondi con successo parziale
        // La subscription è stata salvata nel database
        if (brevoError.message?.includes("non configurata") || 
            brevoError.response?.status === 401 || 
            brevoError.response?.status === 403) {
          return res.json({
            success: true,
            message: "Iscrizione ricevuta. Ti contatteremo presto!"
          });
        }
        
        // Per altri errori Brevo, rispondi comunque con successo
        // perché i dati sono stati salvati nel database
        return res.json({
          success: true,
          message: "Iscrizione ricevuta. Riceverai una conferma a breve."
        });
      }
    } catch (error: any) {
      console.error("Error in POST /api/subscribe:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: "Dati non validi",
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Errore nell'elaborazione della richiesta"
      });
    }
  });

  app.get("/api/subscribe/:email", subscriptionRateLimit(), async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      
      const subscription = await storage.getSubscriptionByEmail(email);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Iscrizione non trovata"
        });
      }
      
      res.json({
        success: true,
        data: {
          email: subscription.email,
          nome: subscription.nome,
          blogUpdates: subscription.blogUpdates,
          newListings: subscription.newListings,
          confirmed: subscription.confirmed,
        }
      });
    } catch (error: any) {
      console.error("Error in GET /api/subscribe/:email:", error);
      
      res.status(500).json({
        success: false,
        message: "Errore nel recupero delle preferenze"
      });
    }
  });

  app.put("/api/subscribe", subscriptionRateLimit(), async (req, res) => {
    try {
      const validatedData = updateSubscriptionSchema.parse(req.body);
      
      // Verifica che l'utente esista
      const existingSubscription = await storage.getSubscriptionByEmail(validatedData.email);
      
      if (!existingSubscription) {
        return res.status(404).json({
          success: false,
          message: "Iscrizione non trovata"
        });
      }
      
      // Aggiorna solo le preferenze (senza richiedere nuovo opt-in)
      await storage.updateSubscription(validatedData.email, {
        blogUpdates: validatedData.blogUpdates ?? existingSubscription.blogUpdates,
        newListings: validatedData.newListings ?? existingSubscription.newListings,
      });
      
      // Aggiorna anche su Brevo se configurato
      try {
        const brevo = getBrevoService();
        
        await brevo.updateContact({
          email: validatedData.email,
          attributes: {
            BLOG_UPDATES: validatedData.blogUpdates ?? existingSubscription.blogUpdates,
            NEW_LISTINGS: validatedData.newListings ?? existingSubscription.newListings,
          }
        });
      } catch (brevoError: any) {
        // Se Brevo non è configurato o il contatto non esiste, continua comunque
        console.error("Errore aggiornamento Brevo:", brevoError.message);
      }
      
      res.json({
        success: true,
        message: "Preferenze aggiornate con successo"
      });
    } catch (error: any) {
      console.error("Error in PUT /api/subscribe:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: "Dati non validi",
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Errore nell'aggiornamento delle preferenze"
      });
    }
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
      
      // Invia notifica se l'immobile è disponibile
      if (property.stato === 'disponibile') {
        // Chiamata asincrona non bloccante
        fetch(`http://localhost:${process.env.PORT || 5000}/api/admin/notify-listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.cookie || ''
          },
          body: JSON.stringify({ id: property.id })
        }).catch(err => {
          console.error('Errore invio notifica listing:', err);
        });
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
      // Recupera lo stato precedente
      const existingProperty = await storage.getPropertyById(req.params.id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Immobile non trovato" });
      }
      
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
      
      // Invia notifica se lo stato è cambiato a 'disponibile'
      if (existingProperty.stato !== 'disponibile' && updatedProperty.stato === 'disponibile') {
        // Chiamata asincrona non bloccante
        fetch(`http://localhost:${process.env.PORT || 5000}/api/admin/notify-listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.cookie || ''
          },
          body: JSON.stringify({ id: updatedProperty.id })
        }).catch(err => {
          console.error('Errore invio notifica listing:', err);
        });
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
      const filterResult = postFiltersSchema.safeParse(req.query);
      const filters = filterResult.success ? filterResult.data : {};
      
      const result = await storage.getPublishedPosts(filters);
      
      res.json({
        posts: result.posts,
        pagination: {
          total: result.total,
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
        },
      });
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

  app.get("/api/posts/:postId/images", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post non trovato" });
      }
      
      if (post.stato !== "pubblicato") {
        return res.status(404).json({ message: "Post non disponibile" });
      }
      
      const images = await storage.getPostImages(req.params.postId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching post images:", error);
      res.status(500).json({ message: "Errore nel recupero delle immagini" });
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

  app.post("/api/admin/notify-post", requireAdmin, async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "ID del post obbligatorio" });
      }

      // Recupera il post dal database
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post non trovato" });
      }

      // Recupera gli iscritti confermati con blog_updates=true
      const subscribers = await storage.getConfirmedBlogSubscribers();
      
      if (subscribers.length === 0) {
        console.log(`[${new Date().toISOString()}] Nessun iscritto con blog_updates=true per il post: ${post.titolo}`);
        return res.json({ 
          ok: true, 
          message: "Nessun iscritto da notificare",
          sent: 0 
        });
      }

      // Crea il link al post
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';
      const postUrl = `${baseUrl}/blog/${post.slug}`;

      // Crea l'anteprima del post (primi 200 caratteri senza HTML)
      const plainContent = post.contenuto.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const preview = plainContent.length > 200 
        ? plainContent.substring(0, 200) + '...' 
        : plainContent;

      // Subject dell'email
      const subject = `Nuovo articolo: ${post.titolo}`;

      // HTML dell'email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin-bottom: 20px;">${post.titolo}</h1>
            ${post.sottotitolo ? `<h2 style="color: #7f8c8d; font-size: 18px; font-weight: normal; margin-bottom: 20px;">${post.sottotitolo}</h2>` : ''}
            ${post.cover ? `<img src="${post.cover}" alt="${post.titolo}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">${preview}</p>
            <a href="${postUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Leggi l'articolo completo</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
            <p>Ricevi questa email perché sei iscritto agli aggiornamenti del blog Maggiolini.</p>
            <p><a href="${baseUrl}/preferenze" style="color: #3498db; text-decoration: none;">Gestisci le tue preferenze</a></p>
          </div>
        </body>
        </html>
      `;

      // Invia email tramite Brevo
      let sentCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      try {
        const brevo = getBrevoService();
        
        // Prepara i destinatari
        const recipients = subscribers.map(sub => ({
          email: sub.email,
          name: sub.nome || undefined
        }));

        // Invia email
        await brevo.sendTransactionalEmail({
          to: recipients,
          subject,
          htmlContent
        });

        sentCount = recipients.length;
        console.log(`[${new Date().toISOString()}] Email inviata con successo a ${sentCount} iscritti per il post: ${post.titolo}`);

      } catch (brevoError: any) {
        console.error("Errore Brevo durante l'invio newsletter:", brevoError);
        errors.push(brevoError.message || "Errore sconosciuto");
        errorCount = subscribers.length;

        // Se Brevo non è configurato o c'è un errore critico
        if (brevoError.message?.includes("non configurata")) {
          return res.status(503).json({ 
            message: "Servizio email non configurato",
            error: "BREVO_API_KEY non configurata" 
          });
        }

        return res.status(500).json({ 
          message: "Errore nell'invio delle email",
          sent: 0,
          failed: errorCount,
          errors 
        });
      }

      res.json({ 
        ok: true,
        message: `Email inviata a ${sentCount} iscritti`,
        sent: sentCount,
        failed: errorCount
      });

    } catch (error: any) {
      console.error("Error in notify-post endpoint:", error);
      res.status(500).json({ 
        message: "Errore nel processo di notifica",
        error: error.message 
      });
    }
  });

  app.post("/api/admin/notify-listing", requireAdmin, listingNotificationRateLimit(), async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "ID dell'immobile obbligatorio" });
      }

      // Recupera l'immobile dal database
      const property = await storage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Immobile non trovato" });
      }

      // Recupera gli iscritti confermati con new_listings=true
      const subscribers = await storage.getConfirmedListingSubscribers();
      
      if (subscribers.length === 0) {
        console.log(`[${new Date().toISOString()}] Nessun iscritto con new_listings=true per l'immobile: ${property.titolo}`);
        return res.json({ 
          ok: true, 
          message: "Nessun iscritto da notificare",
          sent: 0 
        });
      }

      // Crea il link all'immobile
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';
      const propertyUrl = `${baseUrl}/immobili/${property.slug}`;

      // Formatta il prezzo
      const formattedPrice = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseFloat(property.prezzo));

      // Recupera la prima immagine dell'immobile
      const images = await storage.getPropertyImages(property.id);
      const coverImage = images.length > 0 ? images[0].urlHot : '';

      // Crea una descrizione breve
      const shortDescription = property.descrizione && property.descrizione.length > 200 
        ? property.descrizione.substring(0, 200) + '...' 
        : property.descrizione || '';

      // Tipo immobile in italiano
      const tipoMap: Record<string, string> = {
        'vendita': 'In Vendita',
        'affitto': 'In Affitto'
      };
      const tipoLabel = tipoMap[property.tipo] || property.tipo;

      // Subject dell'email
      const subject = `Nuovo immobile disponibile: ${property.titolo}`;

      // HTML dell'email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">${property.titolo}</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin-bottom: 20px;">${tipoLabel} - ${property.zona || ''}</p>
            ${coverImage ? `<img src="${coverImage}" alt="${property.titolo}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #3498db; font-size: 28px; margin-bottom: 10px;">${formattedPrice}</h2>
              <p style="font-size: 16px; color: #555; margin-bottom: 15px;">${shortDescription}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                ${property.mq ? `<div style="flex: 0 0 auto;"><strong>📐 Superficie:</strong> ${property.mq} m²</div>` : ''}
                ${property.stanze ? `<div style="flex: 0 0 auto;"><strong>🛏️ Stanze:</strong> ${property.stanze}</div>` : ''}
                ${property.bagni ? `<div style="flex: 0 0 auto;"><strong>🚿 Bagni:</strong> ${property.bagni}</div>` : ''}
              </div>
            </div>
            <a href="${propertyUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Scopri di più</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
            <p>Ricevi questa email perché sei iscritto alle notifiche per nuovi immobili Maggiolini.</p>
            <p><a href="${baseUrl}/preferenze" style="color: #3498db; text-decoration: none;">Gestisci le tue preferenze</a></p>
          </div>
        </body>
        </html>
      `;

      // Invia email tramite Brevo
      let sentCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      try {
        const brevo = getBrevoService();
        
        // Prepara i destinatari
        const recipients = subscribers.map(sub => ({
          email: sub.email,
          name: sub.nome || undefined
        }));

        // Invia email
        await brevo.sendTransactionalEmail({
          to: recipients,
          subject,
          htmlContent
        });

        sentCount = recipients.length;
        console.log(`[${new Date().toISOString()}] Email inviata con successo a ${sentCount} iscritti per l'immobile: ${property.titolo}`);

      } catch (brevoError: any) {
        console.error("Errore Brevo durante l'invio notifica immobile:", brevoError);
        errors.push(brevoError.message || "Errore sconosciuto");
        errorCount = subscribers.length;

        // Se Brevo non è configurato o c'è un errore critico
        if (brevoError.message?.includes("non configurata")) {
          return res.status(503).json({ 
            message: "Servizio email non configurato",
            error: "BREVO_API_KEY non configurata" 
          });
        }

        return res.status(500).json({ 
          message: "Errore nell'invio delle email",
          sent: 0,
          failed: errorCount,
          errors 
        });
      }

      res.json({ 
        ok: true,
        message: `Email inviata a ${sentCount} iscritti`,
        sent: sentCount,
        failed: errorCount
      });

    } catch (error: any) {
      console.error("Error in notify-listing endpoint:", error);
      res.status(500).json({ 
        message: "Errore nel processo di notifica",
        error: error.message 
      });
    }
  });

  // RSS Feed endpoint
  app.get("/api/feed.xml", async (req, res) => {
    try {
      // Get latest 30 published posts
      const result = await storage.getPublishedPosts({ perPage: 30, page: 1 });
      const posts = result.posts;

      // Get site URL from request
      const protocol = req.secure ? 'https' : 'http';
      const host = req.get('host');
      const siteUrl = `${protocol}://${host}`;

      // Generate RSS 2.0 XML
      const rssItems = posts.map(post => {
        // Create excerpt from content (first 300 chars, strip HTML tags)
        const plainContent = post.contenuto.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const excerpt = plainContent.length > 300 
          ? plainContent.substring(0, 300) + '...' 
          : plainContent;

        // Format pubDate in RFC 822 format
        const pubDate = post.publishedAt 
          ? new Date(post.publishedAt).toUTCString() 
          : new Date(post.createdAt).toUTCString();

        // Build enclosure tag for cover image
        const enclosureTag = post.cover 
          ? `      <enclosure url="${post.cover}" type="image/jpeg" />`
          : '';

        return `    <item>
      <title><![CDATA[${post.titolo}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
${enclosureTag}
    </item>`;
      }).join('\n');

      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Immobiliare Maggiolini - Blog</title>
    <link>${siteUrl}</link>
    <description>Novità, consigli e approfondimenti dal mondo immobiliare</description>
    <language>it</language>
    <atom:link href="${siteUrl}/api/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(rssXml);
    } catch (error) {
      console.error("Error generating RSS feed:", error);
      res.status(500).send('Errore nella generazione del feed RSS');
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
