/**
 * Script per esportare tutti i dati del database in formato JSON
 * 
 * Uso:
 * npm install
 * npx tsx scripts/export-data.ts
 * 
 * Output: export-YYYY-MM-DD-HH-mm-ss.json
 */

import { db } from "../server/db";
import { 
  properties, 
  propertiesImages, 
  posts, 
  postsImages, 
  leads, 
  subscriptions,
  users 
} from "../shared/schema";
import { writeFileSync } from "fs";
import { join } from "path";

async function exportAllData() {
  console.log("🚀 Inizio esportazione dati...\n");
  
  try {
    // Esporta tutte le tabelle
    console.log("📦 Recupero immobili...");
    const allProperties = await db.select().from(properties);
    console.log(`   ✅ ${allProperties.length} immobili trovati`);
    
    console.log("📦 Recupero immagini immobili...");
    const allPropertyImages = await db.select().from(propertiesImages);
    console.log(`   ✅ ${allPropertyImages.length} immagini immobili trovate`);
    
    console.log("📦 Recupero articoli blog...");
    const allPosts = await db.select().from(posts);
    console.log(`   ✅ ${allPosts.length} articoli trovati`);
    
    console.log("📦 Recupero immagini blog...");
    const allPostImages = await db.select().from(postsImages);
    console.log(`   ✅ ${allPostImages.length} immagini blog trovate`);
    
    console.log("📦 Recupero lead...");
    const allLeads = await db.select().from(leads);
    console.log(`   ✅ ${allLeads.length} lead trovati`);
    
    console.log("📦 Recupero iscritti newsletter...");
    const allSubscriptions = await db.select().from(subscriptions);
    console.log(`   ✅ ${allSubscriptions.length} iscritti trovati`);
    
    console.log("📦 Recupero utenti...");
    const allUsers = await db.select().from(users);
    console.log(`   ✅ ${allUsers.length} utenti trovati`);
    
    // Crea oggetto con tutti i dati
    const exportData = {
      exportDate: new Date().toISOString(),
      statistics: {
        properties: allProperties.length,
        propertyImages: allPropertyImages.length,
        posts: allPosts.length,
        postImages: allPostImages.length,
        leads: allLeads.length,
        subscriptions: allSubscriptions.length,
        users: allUsers.length,
      },
      data: {
        properties: allProperties,
        propertyImages: allPropertyImages,
        posts: allPosts,
        postImages: allPostImages,
        leads: allLeads,
        subscriptions: allSubscriptions,
        users: allUsers.map(u => ({ id: u.id, username: u.username })), // No password export
      }
    };
    
    // Genera nome file con timestamp
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_');
    const filename = `export-${timestamp}.json`;
    const filepath = join(process.cwd(), filename);
    
    // Salva file
    writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log("\n✅ Esportazione completata!");
    console.log(`📄 File salvato: ${filename}`);
    console.log(`📊 Totale elementi: ${
      allProperties.length + 
      allPropertyImages.length + 
      allPosts.length + 
      allPostImages.length + 
      allLeads.length + 
      allSubscriptions.length
    }`);
    
    // Mostra dimensione file
    const stats = require('fs').statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`💾 Dimensione: ${fileSizeInMB} MB\n`);
    
  } catch (error) {
    console.error("❌ Errore durante l'esportazione:", error);
    process.exit(1);
  }
}

// Esegui export
exportAllData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Errore fatale:", error);
    process.exit(1);
  });
