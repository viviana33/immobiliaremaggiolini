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