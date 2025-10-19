# Immobiliare Maggiolini - Real Estate Platform

## Overview

Immobiliare Maggiolini is a real estate platform designed for a boutique Italian agency, emphasizing trust, warmth, and human connection. It features property listings (for sale/rent), a blog system, team information, and an admin authentication system. The platform aims to showcase properties with rich media, provide informative blog content, and build trust through professional design inspired by Italian lifestyle aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript, Vite.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query for server state, React Context API for theme, session-based for authentication.
- **UI Framework**: shadcn/ui (Radix UI primitives) with Tailwind CSS, custom Mediterranean color palette, responsive mobile-first design, dark mode support.
- **Component Architecture**: Organized by presentation, pages, UI primitives, and custom hooks.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with JSON responses, protected admin routes using session-based middleware.
- **Session Management**: Express-session with `connect-pg-simple` for PostgreSQL session storage, HTTP-only cookies, 7-day expiration.
- **Middleware**: JSON body parsing, URL-encoded support, logging, authentication.

### Data Layer
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver.
- **Database Schema**:
    - **Properties**: `title`, `description`, `price`, `type`, `area`, `rooms`, `bathrooms`, `energy class`, `zone`, `status`, `video link`, timestamps.
    - **Property Images**: Foreign key to properties, hot/cold URL storage, file hash, archive flag.
    - **Blog Posts**: `title`, `subtitle`, `slug`, `cover image`, rich content, tags, category, author, status, SEO fields, timestamps.
- **Property Filtering**: URL-based filtering using Drizzle's operators for single-query optimization.
- **Property Detail Page**: Fetches single property by slug, displays image gallery (Cloudinary optimized, lightbox), video embed, detailed information, status badges, similar properties, contact CTA, 404 handling.
- **Blog Admin Forms**: React Hook Form with Zod validation, MarkdownEditor with edit/preview modes, status management, tag handling.
- **Blog Cover Image Upload System**: Dual-storage architecture (R2 for cold storage, Cloudinary for hot delivery), `ImageUploader` component with drag-and-drop, client-side validation, server-side processing (Sharp), deduplication via SHA-256 hashing.
- **Blog Public Page** (`/blog`) (October 2025):
  - **Public API endpoints**: GET `/api/posts` (all published posts, optional `?categoria=` filter), GET `/api/posts/:slug` (single post by slug)
  - **PostCard component**: Displays post with cover image (Cloudinary optimized, lazy-loaded), title, excerpt, category badge, tags (max 3), formatted date, reading time
  - **Category filtering**: Dynamic category badges extracted from published posts, client-side + optional server-side filtering
  - **Pagination**: "Carica Altri Articoli" button with client-side incremental loading (6 posts at a time)
  - **Loading/Error states**: Spinner with text during data fetch, error alert on failure, empty state message when no posts
  - **Rendering strategy**: CSR (Client-Side Rendering) with React + Vite, TanStack Query for data fetching
  - **SEO considerations**: Documented in code comment - CSR chosen due to Vite/React architecture; SSR/ISR would require Next.js or similar framework
- **Newsletter Notification Stub**: API endpoint for logging post publication notifications for future integration.
- **Newsletter Subscription System with Brevo Integration** (October 2025):
  - **Database Schema**: Subscriptions table with `email`, `nome`, `blog_updates`, `new_listings`, `source`, `consent_ts`, `consent_ip`, `confirmed`, `confirm_token`, `created_at`
  - **Brevo Service**: Double opt-in (DOI) integration via `@getbrevo/brevo` package
    - `createContactWithDoubleOptIn()`: Creates contact and sends DOI confirmation email
    - `updateContact()`: Updates contact preferences without new DOI
    - `getContact()`: Retrieves contact information
    - Environment variables: `BREVO_API_KEY` (required), `BREVO_TEMPLATE_ID` (optional), `BREVO_LIST_ID` (optional)
    - **Graceful degradation**: System saves subscriptions locally even when Brevo is not configured or returns errors
  - **API Endpoints**:
    - POST `/api/subscribe`: Creates/updates subscription with upsert logic, saves consent data (IP, timestamp), sends Brevo DOI email (gracefully handles Brevo failures)
    - PUT `/api/subscribe`: Updates preferences (blog_updates, new_listings) without requiring new DOI
    - GET `/api/subscribe/confirm/:token`: Local confirmation endpoint (fallback if Brevo redirect used)
    - POST `/api/webhooks/brevo`: Webhook receiver for Brevo events (marks subscriptions as confirmed)
  - **Rate Limiting**: 5 requests per 15 minutes per email+IP combination to prevent abuse
  - **Validation**: Zod schemas for email validation, subscription fields
  - **Consent Tracking**: Records consent IP (`consent_ip`), consent timestamp (`consent_ts`), source (`source`)
  - **Frontend Components**:
    - `Footer.tsx`: Simplified newsletter form in footer (email only, defaults: blog_updates=true, new_listings=false, source="footer")
    - `SubscriptionBox.tsx`: Full subscription form in blog page with email, name (optional), new_listings checkbox (defaults: blog_updates=true, source="blog"), displayed as dedicated section at bottom of blog page
  - **Error Handling**: All components show success/error alerts, handle loading states, reset forms on success
  - **Thank You Page with Upgrade Flow** (`/grazie`) (Step 8.5, October 2025):
    - **Redirect Flow**: After successful subscription submission, all forms redirect to `/grazie?lead=ok&source={source}&email={email}&blogUpdates={true/false}&newListings={true/false}`
    - **Context-Aware Upgrade Logic**:
      - If user subscribed to only `blogUpdates` → offers `newListings` upgrade
      - If user subscribed to only `newListings` → offers `blogUpdates` upgrade
      - If user subscribed to both or neither → no upgrade card shown
    - **UI Components**:
      - Confirmation message with email verification reminder
      - Context-aware upgrade card with description based on missing preference
      - "Sì, aggiungi!" button that calls PUT `/api/subscribe` to add missing flag
      - Success alert after upgrade, upgrade card disappears
      - "Torna alla Home" button for navigation
    - **Error Handling**: Invalid access (missing lead=ok param) shows "Pagina non trovata" message
    - **Integration**: ContactForm only redirects if user selected at least one newsletter preference, otherwise shows toast and stays on page
  - **Preferences Page** (`/preferenze`) (October 2025):
    - **Frontend**: Email input with load/save preferences, two toggles (blog_updates, new_listings), success/error alerts, unsubscribe link to Brevo
    - **Backend**: GET `/api/subscribe/:email` to retrieve preferences, PUT `/api/subscribe` to update (both with rate limiting)
    - **Features**: Auto-load from URL param `?email=`, state management with React Query, TypeScript strict typing with shared schema types
    - **UX**: Clear success/error messages, "Cambia Email" button, external unsubscribe link, loading states
    - **Quick-Add Suggestion** (Step 7.3, October 2025): One-click subscription upgrade feature
      - **Trigger**: Displays when user has exactly ONE subscription active (blogUpdates XOR newListings)
      - **UI**: Prominent card (border-primary/30 bg-primary/5) with context-aware description and "Aggiungi" button
      - **Behavior**: Calls PUT `/api/subscribe` to add missing flag, shows success message, card disappears after addition
      - **URL Integration**: Brevo DOI redirect includes email parameter (`/preferenze?confirmed=true&email=...`) for auto-load
      - **Implementation**: Uses window.location.search for query params, React state management for conditional rendering
  - **Property Listing Notifications** (Step 7.5, October 2025): Automatic email notifications for new available properties
    - **Backend**:
      - `getConfirmedListingSubscribers()` in storage: Retrieves confirmed subscribers with `new_listings=true`
      - POST `/api/admin/notify-listing`: Protected endpoint to send emails about available properties to listing subscribers
      - **Rate Limiting**: 1 notification per property every 30 minutes to prevent spam
      - **Email Template**: Property details with cover image, price, size, rooms, bathrooms, description excerpt, call-to-action link
      - **Automatic Trigger**: Notifications sent when:
        - New property created with status 'disponibile' (POST `/api/admin/properties`)
        - Existing property status changes to 'disponibile' (PUT `/api/admin/properties/:id`)
      - **Non-blocking**: Notification calls are asynchronous and don't block property creation/update responses
      - **Brevo Integration**: Uses `sendTransactionalEmail()` with graceful error handling
    - **Implementation Details**:
      - Email includes: property title, type, zone, formatted price, cover image, description, property features (m², rooms, bathrooms)
      - Link to property detail page (`/immobili/:slug`)
      - Preferences management link in footer
      - Logs sent count and errors for monitoring
- **Type Safety**: Zod schemas generated from Drizzle, shared types via `/shared` directory, TypeScript strict mode.
- **Database Migrations**: Managed via Drizzle Kit.

### Authentication & Authorization
- **Strategy**: Token-based admin authentication with a single `ADMIN_TOKEN`.
- **Protected Routes**: Client-side `ProtectedRoute` and server-side `requireAdmin` middleware.
- **Session Security**: HTTP-only, secure, SameSite 'lax' cookies.

### Build & Deployment
- **Development**: `npm run dev` with Vite and `tsx`, HMR.
- **Production Build**: Client (Vite) to `/dist/public`, Server (esbuild) to `/dist/index.js`.
- **Asset Management**: Static assets in `/attached_assets/generated_images`, path aliases, Vite image optimization.

## External Dependencies

### Core Framework & Runtime
- `@vitejs/plugin-react`, `express`, `react`, `react-dom`, `typescript`, `tsx`.

### Database & ORM
- `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `drizzle-zod`.

### UI & Styling
- `tailwindcss`, `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

### State & Data Fetching
- `@tanstack/react-query`, `wouter`, `react-hook-form`, `@hookform/resolvers`, `zod`.

### Session & Authentication
- `express-session`, `connect-pg-simple`.

### Development Tools
- `@replit/vite-plugin-*`, `esbuild`, `postcss`, `autoprefixer`.

### Utilities
- `date-fns`, `embla-carousel-react`, `cmdk`, `nanoid`.

### Image Upload & Storage
- `sharp` (image processing), `@aws-sdk/client-s3` (Cloudflare R2), `multer` (file uploads).
- **Dual-Storage Architecture**: Cloudflare R2 for cold storage, Cloudinary for hot delivery with `f_auto,q_auto,w_1600` transformations.
- **Image Limits**: Cover images 1KB min, 8MB max; JPEG/PNG/WebP/GIF; auto-resize to 2560px max longest side.