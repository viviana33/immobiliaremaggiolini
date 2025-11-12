import type { Express } from "express";
import { storage } from "./storage";

export function registerSubscriptionConfirmRoutes(app: Express) {
  // Endpoint per confermare l'iscrizione (chiamato quando l'utente clicca sul link nell'email)
  app.get("/api/subscribe/confirm/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).send("Token mancante");
      }
      
      // Trova la subscription con questo token
      const subscription = await storage.getSubscriptionByToken(token);
      
      if (!subscription) {
        return res.status(404).send("Token non valido o iscrizione non trovata");
      }
      
      if (subscription.confirmed) {
        return res.redirect(`/preferenze?confirmed=already`);
      }
      
      // Conferma l'iscrizione
      await storage.updateSubscription(subscription.email, {
        confirmed: true,
        confirmToken: null,
      });
      
      // Redirect alla pagina di conferma
      return res.redirect(`/preferenze?confirmed=true`);
    } catch (error) {
      console.error("Error confirming subscription:", error);
      return res.status(500).send("Errore nella conferma dell'iscrizione");
    }
  });
  
  // Webhook per Brevo (opzionale - se Brevo invia webhook quando l'utente conferma)
  app.post("/api/webhooks/brevo", async (req, res) => {
    try {
      const event = req.body;
      
      // Verifica il tipo di evento
      if (event.event === "contact_updated" || event.event === "contact_activated") {
        const email = event.email;
        
        if (email) {
          // Aggiorna lo stato di conferma nel database
          await storage.updateSubscription(email, {
            confirmed: true,
          });
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing Brevo webhook:", error);
      res.status(500).json({ success: false });
    }
  });
}
