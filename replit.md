# Immobiliare Maggiolini - Real Estate Platform

## Overview

Immobiliare Maggiolini is a warm, Mediterranean-inspired real estate platform built for a boutique Italian real estate agency with 20+ years of experience. The application emphasizes trust, warmth, and human connection through a sophisticated yet personal design approach. It features property listings (vendita/affitto), a blog system, team information, and an admin authentication system.

The platform is designed to showcase properties with rich media support (images, videos), provide informative blog content, and build trust through team profiles and testimonials. The design philosophy draws inspiration from platforms like Airbnb while incorporating Italian lifestyle aesthetics with earth tones and Mediterranean warmth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, using Vite as the build tool and development server

**Routing**: Client-side routing implemented with Wouter (lightweight React Router alternative)

**State Management**: 
- TanStack Query (React Query v5) for server state management and data fetching
- React Context API for theme management
- Session-based state for authentication

**UI Framework**: shadcn/ui components (Radix UI primitives) with Tailwind CSS
- Custom design system with Mediterranean color palette (terracotta, warm sand, sage green)
- Typography: Playfair Display (headings), Inter (body), Crimson Text (accents)
- Dark mode support with custom theme provider
- Responsive design with mobile-first approach

**Component Architecture**:
- Presentational components in `/client/src/components`
- Page components in `/client/src/pages`
- Reusable UI primitives in `/client/src/components/ui`
- Custom hooks in `/client/src/hooks`

**Design System Features**:
- Hover and active elevation effects for interactive elements
- Custom color variables supporting light/dark themes
- Border radius: lg (9px), md (6px), sm (3px)
- Comprehensive component library including cards, forms, dialogs, navigation

### Backend Architecture

**Runtime**: Node.js with Express.js

**API Design**: RESTful API with JSON responses
- `/api/auth/*` - Authentication endpoints (login, logout, status)
- Protected admin routes using session-based middleware

**Session Management**: 
- Express-session with configurable store
- Cookie-based sessions with secure flags for production
- 7-day session expiration
- connect-pg-simple for PostgreSQL session storage

**Middleware Stack**:
- JSON body parsing
- URL-encoded form data support
- Custom request/response logging
- Authentication middleware (`requireAdmin`)

**Development Setup**:
- Hot Module Replacement (HMR) via Vite middleware
- Replit-specific plugins for development (cartographer, dev-banner, runtime error overlay)
- Environment-based configuration

### Data Layer

**ORM**: Drizzle ORM with Neon serverless PostgreSQL driver

**Database Schema** (`shared/schema.ts`):

1. **Properties Table** (`properties`):
   - Core fields: title, description, price, type (vendita/affitto), area, rooms, bathrooms
   - Metadata: energy class, zone, status (disponibile/venduto/affittato/riservato)
   - Optional video link support
   - Timestamps for creation and updates

2. **Property Images Table** (`properties_images`):
   - Foreign key to properties with cascade delete
   - Hot/cold URL storage for image optimization
   - File hash for deduplication
   - Archive flag for soft deletes

3. **Blog Posts Table** (`posts`):
   - Title, subtitle, slug (unique), cover image
   - Rich content field, tag array, category
   - Author and publication metadata
   - Status enum (bozza/pubblicato/archiviato)
   - SEO fields and timestamps

**Property Filtering System** (October 2025):
- **URL-based filtering**: Query parameters (tipo, prezzoMin, prezzoMax, mqMin) control property display
- **Single-query optimization**: Uses Drizzle's `and()`, `gte()`, `lte()`, `eq()` operators to filter in database
- **N+1 query avoidance**: One filtered SELECT query instead of fetching all and filtering in memory
- **Default behavior**: No filters returns all properties; empty/invalid params are ignored
- **Filter validation**: Zod schema (`propertyFiltersSchema`) validates query params server-side
- **React Query integration**: Location-based query keys trigger re-fetch on URL changes
- **Browser navigation support**: Back/forward buttons properly sync filter UI state

**Property Detail Page** (`/immobile/[slug]`) (October 2025):
- **Single property query**: Fetches complete property data by slug via `/api/properties/:slug` endpoint
- **Image gallery**: Displays up to 15 non-archived images with Cloudinary optimization
  - Thumbnail grid (300x300 optimized)
  - Main view (1200x675 optimized)
  - Lightbox zoom view (1920x1080 optimized)
  - Keyboard navigation (arrow keys) in lightbox
  - Image counter display
- **Video embed**: YouTube videos sanitized and embedded responsively when `linkVideo` is present
- **Property information panel**: Displays price, area, rooms, bathrooms, floor, energy class, and status
- **Status badges**: Visual indicators for disponibile/venduto/affittato/riservato
- **Similar properties**: Automatically shown when property is unavailable (same zone, ±20% price range)
- **Contact CTA**: "Richiedi Informazioni" button links to `/contatti?ref=immobile&context=<id>`
- **Error handling**: Elegant 404 page with back-to-listings option for invalid slugs
- **Image placeholders**: Graceful fallback when no images are available

**Blog Admin Form** (`/admin/blog/nuovo`) (October 2025):
- **Form implementation**: Complete blog post form with React Hook Form and Zod validation
- **All required fields**: title (required), subtitle (optional), slug (readonly), cover image (uploader), content with MarkdownEditor, tags (comma-separated), category, status (bozza/pubblicato), SEO fields
- **MarkdownEditor component**: Tabbed interface with Edit and Preview modes
  - Edit tab: textarea for markdown content input
  - Preview tab: displays raw markdown text (fake preview without rendering)
  - Controlled component integrated with React Hook Form
- **Status management**: Default status is "bozza" (draft), can be changed to "pubblicato" (published)
- **Tags handling**: Comma-separated string input converted to array for database storage

**Blog Cover Image Upload System** (October 2025):
- **Dual-storage architecture**: Original images stored in R2 (cold), optimized delivery via Cloudinary fetch URLs (hot)
- **ImageUploader component** (`client/src/components/blog/ImageUploader.tsx`):
  - Drag-and-drop support with visual feedback
  - Image preview with remove capability
  - Upload progress indicator
  - Client-side validation (MIME types, file size)
  - Error handling with toast notifications
- **API endpoint** POST `/api/admin/upload-post-image`:
  - Multipart form-data with single "image" field
  - File validation: JPEG, PNG, WebP, GIF only
  - Size limits: 1KB minimum, 8MB maximum
  - Returns: `{ hot_url, cold_key, file_hash }`
  - Proper error responses (400 for validation, 500 for server errors)
- **Image processing** (Sharp library):
  - Automatic resizing: max 2560px on longest side
  - Format validation and error handling
  - File hash calculation (SHA-256) for deduplication
- **Storage flow**:
  1. Client uploads image via ImageUploader
  2. Server resizes image (max 2560px)
  3. Uploads to R2/S3 with hash-based key (`posts/{hash}/{filename}`)
  4. Generates Cloudinary fetch URL with transformations (f_auto,q_auto,w_1600)
  5. Returns hot_url (Cloudinary) for immediate use in post cover field

**Newsletter Notification Stub** (Step 5.10 - October 2025):
- **Purpose**: Stub implementation for newsletter notifications when blog posts are published
- **API endpoint** POST `/api/admin/notify-post`:
  - Protected with requireAdmin middleware
  - Accepts: `{ id, title, slug, tags }`
  - Currently logs to console only (stub implementation)
  - Returns: `{ ok: true }`
  - Includes TODO comment for Phase 7 integration (Brevo/MailerLite)
- **UI Implementation** (`PostForm.tsx`):
  - "Invia ai lettori" button appears when:
    * Post is in edit mode (not during creation)
    * Post status is "pubblicato"
  - Button triggers POST to `/api/admin/notify-post`
  - Shows toast confirmation: "Richiesta invio registrata (stub)"
  - Uses `useWatch` from react-hook-form for reactive status monitoring
- **Technical notes**:
  - Logs include timestamp, admin session status, post details
  - Reactive button visibility via `useWatch({ control, name: "stato" })`
  - Designed for future replacement with actual email service in Phase 7

**Type Safety**: 
- Zod schemas generated from Drizzle schemas via drizzle-zod
- Shared types between client and server via `/shared` directory
- TypeScript strict mode enabled

**Database Migrations**: 
- Managed via Drizzle Kit
- Migrations output to `/migrations` directory
- Push command: `npm run db:push`

### Authentication & Authorization

**Authentication Strategy**: Token-based admin authentication
- Single admin token stored in environment variable (`ADMIN_TOKEN`)
- Session-based persistence after successful login
- No user registration - admin-only access

**Protected Routes**:
- Client-side: `ProtectedRoute` component wraps admin pages
- Server-side: `requireAdmin` middleware for API endpoints
- Automatic redirect to login for unauthenticated access

**Session Security**:
- HTTP-only cookies
- Secure flag enabled in production
- SameSite 'lax' policy
- Custom session secret (configurable via `SESSION_SECRET`)

### Build & Deployment

**Development**:
- `npm run dev` - Starts development server with HMR
- Vite dev server on client, tsx on server
- Auto-reload on file changes

**Production Build**:
- Client: Vite build → `/dist/public`
- Server: esbuild bundle → `/dist/index.js`
- ESM module format throughout

**Asset Management**:
- Static assets in `/attached_assets/generated_images`
- Path aliases configured for clean imports (@, @shared, @assets)
- Image optimization via Vite

## External Dependencies

### Core Framework & Runtime
- **@vitejs/plugin-react** - React integration for Vite
- **express** - Web server framework
- **react** & **react-dom** - UI library
- **typescript** - Type safety
- **tsx** - TypeScript execution for development

### Database & ORM
- **drizzle-orm** - TypeScript ORM with type-safe queries
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver
- **drizzle-kit** - Schema management and migrations
- **drizzle-zod** - Zod schema generation from Drizzle schemas

### UI & Styling
- **tailwindcss** - Utility-first CSS framework
- **@radix-ui/react-*** - Headless UI primitives (30+ components)
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional className utilities
- **lucide-react** - Icon library

### State & Data Fetching
- **@tanstack/react-query** - Server state management
- **wouter** - Lightweight routing library
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation resolvers
- **zod** - Schema validation

### Session & Authentication
- **express-session** - Session middleware
- **connect-pg-simple** - PostgreSQL session store

### Development Tools
- **@replit/vite-plugin-*** - Replit-specific development enhancements
- **esbuild** - JavaScript bundler for server build
- **postcss** & **autoprefixer** - CSS processing

### Utilities
- **date-fns** - Date manipulation
- **embla-carousel-react** - Carousel component
- **cmdk** - Command menu component
- **nanoid** - Unique ID generation

### Image Upload & Storage
- **sharp** - Image resizing and optimization
- **@aws-sdk/client-s3** - Cloudflare R2 (S3-compatible) client
- **multer** - Multipart form-data file uploads

**Dual-Storage Architecture**:
- **Cold storage**: Cloudflare R2 for permanent archival
- **Hot storage**: Cloudinary fetch URLs for optimized delivery
- **Deduplication**: SHA-256 file hashing prevents duplicate uploads
- **Image limits**: 
  - Cover images: 1KB min, 8MB max, JPEG/PNG/WebP/GIF
  - Auto-resize: 2560px max on longest side
  - Cloudinary transformations: `f_auto,q_auto,w_1600`

## Test rapidi Fase 5 (Blog Admin)

Questa sezione fornisce step chiari e ripetibili per testare manualmente le funzionalità del sistema di gestione blog implementate nella Fase 5.

### 1. Test: Creazione Bozza e Persistenza Dati

**Obiettivo**: Verificare che una bozza creata venga salvata correttamente e che i dati persistano dopo il reload.

**Step**:
1. Effettua login come admin su `/admin/login`
2. Naviga su `/admin/blog` e clicca "Nuovo Articolo"
3. Compila il form con i seguenti dati di test:
   - **Titolo**: "Articolo di Test - [timestamp]"
   - **Sottotitolo**: "Questo è un sottotitolo di prova"
   - **Cover**: Carica un'immagine tramite l'uploader (drag & drop o click)
   - **Contenuto**: Scrivi del markdown di prova:
     ```markdown
     # Titolo H1
     
     Questo è un paragrafo di test con **grassetto** e *corsivo*.
     
     ## Sezione 2
     
     - Elemento lista 1
     - Elemento lista 2
     ```
   - **Tag**: "test, bozza, fase5" (separati da virgola)
   - **Categoria**: "Tecnologia" o altra categoria
   - **Autore**: "Admin Test"
   - **Stato**: Lascia come "bozza" (default)
4. Clicca "Salva Bozza"
5. Verifica toast di conferma: "Bozza salvata"
6. Annota l'ID del post dall'URL (es. `/admin/blog/123`)
7. Torna all'elenco (`/admin/blog`) e verifica che il post appaia con:
   - Badge "bozza" giallo
   - Titolo corretto
   - Data di ultima modifica
8. Clicca "Modifica" sul post appena creato
9. **VERIFICA**: Tutti i campi devono contenere i dati inseriti precedentemente:
   - Titolo, sottotitolo, slug (auto-generato)
   - Cover image visibile nell'uploader
   - Contenuto markdown completo nell'editor
   - Tag come array separato da virgole
   - Categoria e autore corretti
   - Stato = "bozza"

**Risultato atteso**: ✅ Tutti i dati persistono correttamente dopo il salvataggio e ricaricamento.

---

### 2. Test: Pubblicazione Post (Controlli Campi Obbligatori)

**Obiettivo**: Verificare i controlli di validazione per la pubblicazione e il corretto settaggio di `published_at`.

**Step**:
1. Apri una bozza esistente (o crea una nuova bozza seguendo il Test 1)
2. **Test controlli validazione** - Prova a pubblicare un post INCOMPLETO:
   - Cambia "Stato" da "bozza" a "pubblicato"
   - Rimuovi temporaneamente il **titolo** (lascia vuoto)
   - Clicca "Pubblica"
   - **VERIFICA**: Deve apparire un errore di validazione che blocca la pubblicazione
3. Ripristina il titolo e ripeti il test rimuovendo:
   - La **cover image** (clicca X per rimuoverla)
   - Il **contenuto** markdown
   - Lo **slug** (se modificabile)
   - **VERIFICA**: In ogni caso la pubblicazione deve essere bloccata con messaggio d'errore appropriato
4. **Test pubblicazione valida**:
   - Assicurati che tutti i campi obbligatori siano compilati:
     * Titolo ✓
     * Slug ✓
     * Cover ✓
     * Contenuto ✓
     * Autore ✓
   - Cambia "Stato" a "pubblicato"
   - Clicca "Pubblica"
5. **VERIFICA**:
   - Toast di conferma: "Post pubblicato con successo"
   - Reindirizzamento a `/admin/blog`
   - Nell'elenco post, verifica:
     * Badge "pubblicato" verde
     * Colonna "Data Pubblicazione" mostra data/ora corrente (formato italiano)
     * Colonna "Stato" = "pubblicato"
6. Riapri il post in modifica e verifica nel form:
   - Campo `stato` = "pubblicato"
   - Il pulsante "Invia ai lettori" è ora visibile (appare solo per post pubblicati)

**Risultato atteso**: ✅ I controlli bloccano pubblicazioni incomplete. Post validi vengono pubblicati con `published_at` settato correttamente.

---

### 3. Test: Notify Stub (Invio Newsletter)

**Obiettivo**: Verificare che l'azione di notifica stub funzioni correttamente con toast frontend e log backend.

**Prerequisiti**: Avere un post in stato "pubblicato" (vedi Test 2).

**Step**:
1. Apri in modifica un post con stato "pubblicato"
2. **VERIFICA**: Il pulsante "Invia ai lettori" (icona Send) deve essere visibile in fondo al form
   - Nota: Questo pulsante NON appare per post in bozza o durante la creazione
3. Apri la console del browser (F12 → Console) per vedere eventuali errori
4. Apri i log del server Replit (pannello Console/Shell)
5. Clicca il pulsante "Invia ai lettori"
6. **VERIFICA Frontend**:
   - Toast di conferma appare: "Richiesta invio registrata (stub)"
   - Nessun errore nella console del browser
7. **VERIFICA Backend** (nei log server):
   - Cerca una riga tipo:
     ```
     [2025-10-18T...] Richiesta invio newsletter registrata per post: <titolo>
       - ID: <post-id>
       - Slug: <slug>
       - Tags: <lista-tag>
       - Admin session: authenticated
     ```
   - Verifica che l'admin session risulti "authenticated"
8. Clicca nuovamente il pulsante "Invia ai lettori"
9. **VERIFICA**: Nuova entry nei log con timestamp aggiornato (l'endpoint può essere chiamato più volte)

**Risultato atteso**: ✅ Toast OK sul client, log dettagliato sul server. Nessuna email viene inviata (stub).

**Note**: 
- Questo è un endpoint stub. La funzionalità di invio email reale sarà implementata in Fase 7 (Brevo/MailerLite)
- L'endpoint `/api/admin/notify-post` è protetto e richiede autenticazione admin
- Campi richiesti nel body: `id`, `title`, `slug` (opzionali: `tags`)

---

### 4. Test: Upload Immagini (Limiti, MIME, Deduplicazione, Cloudinary)

**Obiettivo**: Verificare limiti di upload, validazione MIME, deduplicazione hash e generazione hot_url Cloudinary.

#### 4.1. Test Cover Image - Limiti e Validazione MIME

**Step**:
1. Crea o apri un post in modifica
2. **Test file troppo grande**:
   - Prova a caricare un'immagine **> 8MB**
   - **VERIFICA**: Toast di errore "Il file supera la dimensione massima di 8MB"
3. **Test file troppo piccolo**:
   - Crea un'immagine molto piccola (< 1KB) o un file di testo rinominato .jpg
   - **VERIFICA**: Toast di errore "Il file è troppo piccolo"
4. **Test MIME type non supportato**:
   - Prova a caricare un file `.txt`, `.pdf`, o `.svg`
   - **VERIFICA**: Toast di errore "Formato file non supportato. Utilizza JPEG, PNG, WebP o GIF"
5. **Test upload valido**:
   - Carica un'immagine JPEG di ~2-5MB
   - **VERIFICA**:
     * Progress bar appare durante upload
     * Preview dell'immagine viene mostrata
     * Nessun errore

#### 4.2. Test Deduplicazione Hash

**Obiettivo**: Verificare che lo stesso file caricato due volte non venga duplicato su R2.

**Step**:
1. Salva/scarica un'immagine specifica (es. `test-image.jpg`)
2. Caricala come cover di un post e salva il post
3. Apri i log del server per vedere il file hash generato (cerca "posts/[hash]/...")
4. Crea un NUOVO post
5. Carica la **stessa identica immagine** `test-image.jpg`
6. Controlla i log del server
7. **VERIFICA**: 
   - L'hash SHA-256 deve essere identico al precedente
   - Il path su R2 sarà: `posts/[stesso-hash]/test-image.jpg`
   - Questo evita di caricare lo stesso file due volte su R2

**Risultato atteso**: ✅ File identici generano lo stesso hash e riutilizzano lo stesso file su R2.

#### 4.3. Test Cloudinary hot_url

**Step**:
1. Carica una cover image per un post
2. Salva il post come bozza o pubblicato
3. Apri i Network Tools del browser (F12 → Network tab)
4. Ricarica la pagina del form
5. Cerca le richieste per l'immagine di preview della cover
6. **VERIFICA**:
   - L'URL dell'immagine deve essere un URL Cloudinary fetch
   - Formato atteso: `https://res.cloudinary.com/[cloud]/image/fetch/f_auto,q_auto,w_1600/[R2-url]`
   - NON deve essere un URL R2 diretto
7. **Test responsive Cloudinary**:
   - Clicca con tasto destro sull'immagine → "Apri immagine in nuova scheda"
   - Verifica che l'immagine sia ottimizzata (formato auto, quality auto)
   - Modifica manualmente l'URL aggiungendo parametri (es. `w_300,h_200`) e verifica che Cloudinary le applichi

**Risultato atteso**: ✅ Le cover usano sempre hot_url Cloudinary per delivery ottimizzato, non URL R2 diretti.

#### 4.4. Test Galleria Post (Opzionale)

**Step**:
1. Crea un post e salvalo (per ottenere un ID)
2. Nella sezione "Galleria Immagini" in fondo al form:
   - Carica 2-3 immagini
   - **VERIFICA**: Ogni immagine viene processata e mostra preview
3. Ricarica la pagina
4. **VERIFICA**: Le immagini della galleria persistono e vengono ricaricate
5. Prova a riordinare le immagini (drag & drop)
6. Ricarica e verifica che l'ordine sia mantenuto

**Risultato atteso**: ✅ Le immagini della galleria seguono lo stesso sistema dual-storage (R2 + Cloudinary).

---

## TODO - Miglioramenti Rapidi UX/Performance

Questa lista identifica miglioramenti che possono essere implementati rapidamente per ottimizzare l'esperienza utente e le performance della Fase 5.

### UX Improvements

1. **Markdown Preview Rendering** (Priorità: Alta)
   - **Issue**: Attualmente il tab "Preview" del MarkdownEditor mostra solo il testo raw, non il rendering HTML del markdown
   - **Fix**: Implementare rendering markdown reale usando `remark` e `rehype` (già installati)
   - **Impatto**: Permette agli admin di vedere l'anteprima reale del post prima della pubblicazione
   - **Effort**: ~30 minuti

2. **Slug Auto-Generation Feedback** (Priorità: Media)
   - **Issue**: Lo slug viene auto-generato dal titolo ma il campo è readonly senza feedback visivo
   - **Fix**: Aggiungere un badge/icona "Auto" accanto al campo slug o permettere edit manuale con toggle
   - **Impatto**: Chiarezza su quale campo è auto-generato vs modificabile
   - **Effort**: ~15 minuti

3. **Image Upload Progress Enhancement** (Priorità: Bassa)
   - **Issue**: La progress bar è simulata (incrementi ogni 200ms), non riflette il reale progresso upload
   - **Fix**: Usare `XMLHttpRequest.upload.onprogress` o Fetch Streams API per progresso reale
   - **Impatto**: Feedback più accurato per upload di immagini grandi
   - **Effort**: ~45 minuti

4. **Tag Input Component** (Priorità: Media)
   - **Issue**: I tag sono inseriti come stringa separata da virgole, facile fare errori
   - **Fix**: Implementare un tag input component con "pills" cliccabili (simile a `input-otp` già installato)
   - **Impatto**: UX migliore per gestione tag, evita errori di formattazione
   - **Effort**: ~1 ora

5. **Post Status Visual Consistency** (Priorità: Bassa)
   - **Issue**: I badge nella tabella usano colori diversi, ma il select nel form è plain
   - **Fix**: Aggiungere colori/icone al Select component per stati (verde=pubblicato, giallo=bozza, grigio=archiviato)
   - **Impatto**: Coerenza visiva tra tabella e form
   - **Effort**: ~20 minuti

### Performance Improvements

6. **Query Key Optimization** (Priorità: Alta)
   - **Issue**: Le query usano stringhe flat invece di array segmentati per alcuni endpoint
   - **Fix**: Convertire tutti i `queryKey` in formato array gerarchico (es. `['/api/admin/posts', id]`)
   - **Impatto**: Cache invalidation più precisa, meno re-fetch non necessari
   - **Effort**: ~30 minuti (review di tutti i query)
   - **Files**: `PostForm.tsx`, `PostListTable.tsx`, `PostGallery.tsx`

7. **Image Lazy Loading** (Priorità: Media)
   - **Issue**: Tutte le preview delle immagini nella gallery caricano immediatamente
   - **Fix**: Aggiungere `loading="lazy"` agli elementi `<img>` nella PostGallery
   - **Impatto**: Migliori performance iniziali per post con molte immagini
   - **Effort**: ~10 minuti

8. **Debounce Slug Generation** (Priorità: Bassa)
   - **Issue**: Lo slug si rigenera ad ogni keystroke nel campo titolo
   - **Fix**: Aggiungere debounce di 300ms alla generazione slug
   - **Impatto**: Meno render, migliori performance durante typing veloce
   - **Effort**: ~15 minuti

9. **Form Validation Memoization** (Priorità: Bassa)
   - **Issue**: Lo schema Zod viene ricreato ad ogni render
   - **Fix**: Memoizzare `formSchema` con `useMemo` (è già definito fuori dal component, OK)
   - **Status**: ✅ Già ottimizzato (schema definito al top-level)

10. **React Query Stale Time** (Priorità: Media)
    - **Issue**: Le query dei post si invalidano immediatamente, causando re-fetch frequenti
    - **Fix**: Configurare `staleTime` di 30-60 secondi per `/api/admin/posts`
    - **Impatto**: Meno richieste al server durante navigazione admin
    - **Effort**: ~10 minuti (config in queryClient)