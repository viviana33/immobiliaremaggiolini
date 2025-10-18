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