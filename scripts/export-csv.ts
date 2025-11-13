/**
 * Script per esportare i dati in formato CSV (compatibile con Excel)
 * 
 * Uso:
 * npx tsx scripts/export-csv.ts
 * 
 * Output: Crea una cartella exports/ con file CSV separati
 */

import { db } from "../server/db";
import { 
  properties, 
  propertiesImages, 
  posts, 
  postsImages, 
  leads, 
  subscriptions 
} from "../shared/schema";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Funzione helper per convertire array di oggetti in CSV
function convertToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return headers.join(',') + '\n';
  
  const rows = data.map(item => {
    return headers.map(header => {
      let value = item[header];
      
      // Gestisci valori null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Converti array in stringa
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Converti date in stringa
      if (value instanceof Date) {
        value = value.toISOString();
      }
      
      // Converti oggetti in JSON
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape virgolette e wrappa in virgolette se contiene virgole
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  return headers.join(',') + '\n' + rows.join('\n');
}

async function exportToCSV() {
  console.log("🚀 Inizio esportazione CSV...\n");
  
  try {
    // Crea cartella exports se non esiste
    const exportDir = join(process.cwd(), 'exports');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir);
    }
    
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_');
    
    // Esporta immobili
    console.log("📦 Esportando immobili...");
    const allProperties = await db.select().from(properties);
    const propertiesCSV = convertToCSV(allProperties, [
      'id', 'slug', 'titolo', 'descrizione', 'prezzo', 'tipo', 'mq', 
      'stanze', 'bagni', 'piano', 'classeEnergetica', 'zona', 'stato', 
      'linkVideo', 'createdAt', 'updatedAt'
    ]);
    writeFileSync(
      join(exportDir, `immobili-${timestamp}.csv`), 
      propertiesCSV, 
      'utf-8'
    );
    console.log(`   ✅ ${allProperties.length} immobili → immobili-${timestamp}.csv`);
    
    // Esporta articoli blog
    console.log("📦 Esportando articoli blog...");
    const allPosts = await db.select().from(posts);
    const postsCSV = convertToCSV(allPosts, [
      'id', 'titolo', 'sottotitolo', 'slug', 'cover', 'coverPosition', 
      'contenuto', 'readingTimeMin', 'tag', 'categoria', 'autore', 
      'stato', 'publishedAt', 'metaTitle', 'metaDescription', 
      'createdAt', 'updatedAt'
    ]);
    writeFileSync(
      join(exportDir, `blog-${timestamp}.csv`), 
      postsCSV, 
      'utf-8'
    );
    console.log(`   ✅ ${allPosts.length} articoli → blog-${timestamp}.csv`);
    
    // Esporta lead
    console.log("📦 Esportando lead...");
    const allLeads = await db.select().from(leads);
    const leadsCSV = convertToCSV(allLeads, [
      'id', 'nome', 'email', 'messaggio', 'fonte', 'contextId', 
      'newsletter', 'ip', 'createdAt'
    ]);
    writeFileSync(
      join(exportDir, `lead-${timestamp}.csv`), 
      leadsCSV, 
      'utf-8'
    );
    console.log(`   ✅ ${allLeads.length} lead → lead-${timestamp}.csv`);
    
    // Esporta iscritti newsletter
    console.log("📦 Esportando iscritti newsletter...");
    const allSubscriptions = await db.select().from(subscriptions);
    const subscriptionsCSV = convertToCSV(allSubscriptions, [
      'id', 'email', 'nome', 'blogUpdates', 'newListings', 'source', 
      'consentTs', 'consentIp', 'confirmed', 'createdAt'
    ]);
    writeFileSync(
      join(exportDir, `newsletter-${timestamp}.csv`), 
      subscriptionsCSV, 
      'utf-8'
    );
    console.log(`   ✅ ${allSubscriptions.length} iscritti → newsletter-${timestamp}.csv`);
    
    // Esporta immagini immobili
    console.log("📦 Esportando immagini immobili...");
    const allPropertyImages = await db.select().from(propertiesImages);
    const propertyImagesCSV = convertToCSV(allPropertyImages, [
      'id', 'propertyId', 'urlHot', 'urlCold', 'hashFile', 
      'archiviato', 'position', 'createdAt'
    ]);
    writeFileSync(
      join(exportDir, `immagini-immobili-${timestamp}.csv`), 
      propertyImagesCSV, 
      'utf-8'
    );
    console.log(`   ✅ ${allPropertyImages.length} immagini → immagini-immobili-${timestamp}.csv`);
    
    console.log("\n✅ Esportazione CSV completata!");
    console.log(`📁 File salvati in: exports/`);
    console.log(`📊 Totale file: 5\n`);
    
  } catch (error) {
    console.error("❌ Errore durante l'esportazione:", error);
    process.exit(1);
  }
}

// Esegui export
exportToCSV()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Errore fatale:", error);
    process.exit(1);
  });
