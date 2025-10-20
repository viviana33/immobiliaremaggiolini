# Immobiliare Maggiolini - Real Estate Platform

## Overview

Immobiliare Maggiolini is a real estate platform for a boutique Italian agency, aiming to project trust, warmth, and human connection. Its core purpose is to showcase property listings for sale and rent, provide informative blog content, and introduce the agency's team. The platform integrates a robust admin authentication system for content management. The design is inspired by Italian aesthetics, focusing on rich media display for properties and engaging blog articles to build client trust and market presence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18+ with TypeScript, Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query for server state, React Context API for themes/sessions.
- **UI Framework**: shadcn/ui (Radix UI) with Tailwind CSS, custom Mediterranean color palette, responsive mobile-first design, dark mode.
- **Component Structure**: Organized by presentation, pages, UI primitives, and custom hooks.

### Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with JSON, protected admin routes via session-based middleware.
- **Session Management**: Express-session with PostgreSQL storage, HTTP-only cookies.

### Data Layer
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver.
- **Database Schema**:
    - **Properties**: Includes details like title, description, price, type, area, rooms, bathrooms, energy class, zone, status, video link.
    - **Property Images**: Stores foreign keys to properties, hot/cold URLs, file hashes, and archive flags.
    - **Blog Posts**: Contains title, subtitle, slug, cover image, rich content, tags, category, author, status, SEO fields.
    - **Subscriptions**: Stores email, name, preferences (`blog_updates`, `new_listings`), consent data, and confirmation status.
- **Property Management**: Supports URL-based filtering, detailed property pages with image galleries, video embeds, and related properties.
- **Blog Management**: Admin forms use React Hook Form with Zod validation, Markdown editor, and a dual-storage image upload system (R2 for cold, Cloudinary for hot delivery). Public blog pages feature category filtering, pagination, and SEO considerations.
- **Newsletter System**: Manages user subscriptions with double opt-in via Brevo integration, including preference updates, confirmation flows, and rate limiting. It also includes a "Thank You" page with upgrade flows for subscription preferences and a dedicated "Preferences" page for managing subscriptions.
- **Property Listing Notifications**: Automated email notifications for new or newly available properties sent to subscribed users, integrated with Brevo transactional emails.
- **Type Safety**: Zod schemas for validation, shared TypeScript types, strict mode.
- **Database Migrations**: Drizzle Kit.

### Authentication & Authorization
- **Strategy**: Token-based admin authentication using a single `ADMIN_TOKEN`.
- **Security**: Client-side `ProtectedRoute` and server-side `requireAdmin` middleware, secure HTTP-only cookies.

### Build & Deployment
- **Development**: `npm run dev` with Vite and `tsx`, HMR.
- **Production**: Client built to `/dist/public`, Server to `/dist/index.js`.
- **Assets**: Static assets in `/attached_assets/generated_images`, Vite image optimization.

### SEO & Discoverability
- **Sitemap XML**: Dynamically generated for static pages, available properties, and published blog posts, adhering to sitemap.org schema with prioritized URLs and update frequencies.
- **JSON-LD Structured Data**: Implements schemas for `RealEstateAgent` (site-wide), `Article` (blog posts), and `Product`/`RentAction` (property details) to enhance search engine understanding.
- **Meta Tags Helper**: Centralized SEO utility (`client/src/lib/seo.ts`) with `usePageMeta` hook for setting default meta tags, Open Graph tags, and Twitter Cards. Applied to all pages including Home, Chi Siamo, Contatti, Immobili, Blog, Grazie, Preferenze, Not Found, and Proprieta. Individual property and blog post pages have custom meta tags with dynamic content.

### Analytics & Monitoring
- **Vercel Analytics**: Integrated for privacy-friendly web analytics. No cookies, GDPR-compliant, lightweight tracking of page views and web vitals. Configured in `client/src/App.tsx`.

## External Dependencies

### Core & Runtime
- `express`, `react`, `react-dom`, `typescript`, `vite`.

### Database & ORM
- `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `drizzle-zod`.

### UI & Styling
- `tailwindcss`, `@radix-ui/react-*`, `shadcn/ui` components, `lucide-react`.

### State & Data Fetching
- `@tanstack/react-query`, `wouter`, `react-hook-form`, `zod`.

### Session & Authentication
- `express-session`, `connect-pg-simple`.

### Image Upload & Storage
- `sharp` (image processing), `@aws-sdk/client-s3` (Cloudflare R2), `multer`, `cloudinary`.

### Email Marketing
- `@getbrevo/brevo` (for newsletter and transactional emails).

### SEO
- Implemented with sitemap.xml and JSON-LD structured data.

### Analytics
- `@vercel/analytics` (privacy-friendly, GDPR-compliant, no cookies).