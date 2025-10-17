import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAdmin } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { token } = req.body;
    const adminToken = process.env.ADMIN_TOKEN || "admin123";
    
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

  // Protected admin routes - add your admin API routes here
  // Example: app.get("/api/admin/stats", requireAdmin, async (req, res) => { ... });

  const httpServer = createServer(app);

  return httpServer;
}
