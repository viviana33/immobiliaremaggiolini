import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { properties, propertiesImages, posts, insertPropertySchema, insertPropertyImageSchema, insertPostSchema } from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL non configurato. Assicurati di aver impostato la variabile d'ambiente.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Inizio seed del database...");

  try {
    // Inserisci 2 immobili
    console.log("📍 Inserimento immobili...");
    
    const property1 = await db.insert(properties).values({
      titolo: "Villa moderna con vista mare",
      descrizione: "Splendida villa di nuova costruzione con vista panoramica sul mare. La proprietà dispone di ampi spazi luminosi, finiture di pregio e un giardino privato con piscina. Perfetta per chi cerca eleganza e comfort in una location esclusiva.",
      prezzo: "850000",
      tipo: "vendita",
      mq: 280,
      stanze: 5,
      bagni: 3,
      classeEnergetica: "A2",
      zona: "Costa Smeralda",
      stato: "disponibile",
      linkVideo: "https://www.youtube.com/watch?v=example1",
    }).returning();

    const property2 = await db.insert(properties).values({
      titolo: "Appartamento luminoso in centro storico",
      descrizione: "Elegante appartamento completamente ristrutturato nel cuore del centro storico. Due camere da letto, cucina abitabile, doppi servizi e balcone. Ideale per single o coppie che cercano un'abitazione comoda e ben servita.",
      prezzo: "1200",
      tipo: "affitto",
      mq: 95,
      stanze: 3,
      bagni: 2,
      classeEnergetica: "C",
      zona: "Centro Storico",
      stato: "disponibile",
      linkVideo: null,
    }).returning();

    console.log(`✅ Inseriti ${property1.length + property2.length} immobili`);

    // Inserisci immagini per gli immobili
    console.log("🖼️  Inserimento immagini immobili...");
    
    await db.insert(propertiesImages).values([
      {
        propertyId: property1[0].id,
        urlHot: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        urlCold: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
        hashFile: "abc123def456villa1",
        archiviato: false,
      },
      {
        propertyId: property1[0].id,
        urlHot: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        urlCold: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
        hashFile: "abc123def456villa2",
        archiviato: false,
      },
      {
        propertyId: property2[0].id,
        urlHot: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        urlCold: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        hashFile: "xyz789ghi012app1",
        archiviato: false,
      },
    ]);

    console.log("✅ Inserite 3 immagini");

    // Inserisci 2 post per il blog
    console.log("📝 Inserimento post del blog...");
    
    await db.insert(posts).values([
      {
        titolo: "Guida completa all'acquisto della prima casa",
        sottotitolo: "Tutto quello che devi sapere prima di fare il grande passo",
        slug: "guida-acquisto-prima-casa",
        cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
        contenuto: `
# Introduzione

Acquistare la prima casa è un momento emozionante ma anche complesso. In questa guida ti spieghiamo tutti i passaggi fondamentali.

## 1. Valutazione del budget

Prima di iniziare la ricerca, è essenziale capire quanto puoi permetterti di spendere. Considera:
- Risparmio disponibile per l'anticipo
- Capacità di rimborso mensile del mutuo
- Spese accessorie (notaio, agenzia, imposte)

## 2. La ricerca dell'immobile

Definisci le tue priorità: zona, metratura, numero di stanze. Non avere fretta e visita più soluzioni.

## 3. Il mutuo

Confronta le offerte di diverse banche e scegli il mutuo più adatto alle tue esigenze.

## Conclusione

Con la giusta preparazione, l'acquisto della prima casa può essere un'esperienza gratificante!
        `,
        tag: ["prima casa", "mutui", "guida", "immobiliare"],
        autore: "Marco Rossi",
        stato: "pubblicato",
        metaTitle: "Guida all'acquisto della prima casa 2024 | Consigli e step",
        metaDescription: "Scopri la guida completa per acquistare la tua prima casa: budget, ricerca, mutuo e tutti i consigli degli esperti per fare la scelta giusta.",
      },
      {
        titolo: "Investire in immobili: opportunità e strategie",
        sottotitolo: "Come far crescere il tuo patrimonio attraverso il real estate",
        slug: "investire-immobili-strategie",
        cover: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800",
        contenuto: `
# Perché investire in immobili

Il mercato immobiliare continua ad essere una delle forme di investimento più sicure e redditizie.

## Strategie di investimento

### 1. Buy to Let
Acquistare per affittare è la strategia più comune. Genera rendita passiva mensile.

### 2. Flip immobiliare
Acquistare, ristrutturare e rivendere può generare profitti significativi in poco tempo.

### 3. Investimento a lungo termine
Acquistare in zone in via di sviluppo per beneficiare della rivalutazione nel tempo.

## Analisi del mercato

Prima di investire, studia sempre:
- Domanda e offerta della zona
- Progetti di sviluppo urbano
- Prezzi storici e tendenze

## Conclusione

L'investimento immobiliare richiede analisi e strategia, ma può offrire rendimenti eccellenti.
        `,
        tag: ["investimenti", "strategie", "rendita", "flip"],
        autore: "Laura Bianchi",
        stato: "pubblicato",
        metaTitle: "Investire in immobili: strategie e opportunità 2024",
        metaDescription: "Scopri le migliori strategie per investire in immobili: buy to let, flip immobiliare e investimenti a lungo termine. Guida completa agli investimenti.",
      },
    ]);

    console.log("✅ Inseriti 2 post");

    console.log("\n🎉 Seed completato con successo!");
    console.log("\nRiepilogo:");
    console.log(`- 2 immobili inseriti`);
    console.log(`- 3 immagini inserite`);
    console.log(`- 2 post del blog inseriti`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Errore durante il seed:", error);
    process.exit(1);
  }
}

seed();
