import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAdmin } from "./middleware/auth";
import multer from "multer";
import { uploadService } from "./uploadService";
import { insertPropertySchema, propertyFiltersSchema } from "@shared/schema";

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
      
      const properties = await storage.getFilteredProperties(filters);
      
      const formattedProperties = properties.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.titolo,
        price: p.prezzo,
        for_rent: p.tipo === "affitto",
        area_mq: p.mq,
        location: p.zona,
      }));
      
      res.json(formattedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Errore nel recupero degli immobili" });
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

  const httpServer = createServer(app);

  return httpServer;
}
