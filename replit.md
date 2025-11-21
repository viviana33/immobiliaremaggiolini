# Immobiliare Maggiolini - Real Estate Platform

## Overview

Immobiliare Maggiolini is a real estate platform for a boutique Italian agency, designed to showcase property listings for sale and rent, provide informative blog content, and introduce the agency's team. It aims to project trust, warmth, and human connection through a design inspired by Italian aesthetics, focusing on rich media display and engaging articles. The platform includes a robust admin authentication system for content management, building client trust and market presence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18+ with TypeScript, Vite, and Wouter for routing.
- **UI/UX**: shadcn/ui (Radix UI) with Tailwind CSS, custom Mediterranean color palette, responsive mobile-first design, and dark mode.
- **State Management**: TanStack Query for server state, React Context API for themes/sessions.
- **Key Features**:
    - **Image Carousel**: Custom component with keyboard navigation, touch/pointer swipe, lazy loading, smart prefetch, full accessibility, and conditional fullscreen lightbox viewer. Uses responsive aspect ratios (3:4 portrait on mobile, 4:3 landscape on desktop for listing cards; 16:9 for detail pages) optimized for phone-captured photos. Images display complete (object-contain) to avoid cropping important details. Lightbox behavior is controlled via `enableLightbox` prop: disabled in listing cards to allow direct navigation, enabled only on property detail pages for fullscreen viewing.
    - **Navigation UX**: SessionStorage-based tracking for "back to list" functionality on property detail pages.
    - **Property Filters**: Advanced filtering and search with URL-based state management, including city search, type filters, and sorting controls. Data fetching uses AbortController to prevent stale data.

### Backend
- **Runtime**: Node.js with Express.js.
- **API**: RESTful API with JSON, protected admin routes via session-based middleware.
- **Session Management**: Express-session with PostgreSQL storage and HTTP-only cookies.

### Data Layer
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver.
- **Database Schema**: Includes `Properties`, `Property Images`, `Blog Posts`, `Subscriptions`, and `Leads`.
- **Property Management**:
    - Supports URL-based filtering, detailed property pages, and video embeds.
    - Advanced search functionality (keywords in title) with options to include archived properties.
    - Dual-method image reordering (drag-and-drop, chevron buttons) in the admin interface, persisted via a `position` field.
    - Automated image archiving/restoration based on property status (e.g., only first 3 images active when "affittato").
- **Blog Management**:
    - Admin forms use React Hook Form with Zod validation.
    - Professional WYSIWYG editor (`RichTextEditor`) based on Tiptap, offering extensive text formatting, image handling, and security measures against XSS.
    - Dual-storage image upload system (R2 for cold, Cloudinary for hot delivery).
    - `coverPosition` field to control cover image visibility within blog posts (Hidden, Start, End).
- **Newsletter System**: Manages user subscriptions with double opt-in via Brevo, including preference updates and one-click unsubscribe functionality.
- **Property Listing Notifications**: Automated email notifications for new properties.
- **Lead Management**: Admin interface for viewing and managing contact form submissions, with honeypot anti-spam protection on the public endpoint.
- **Type Safety**: Zod schemas, shared TypeScript types, strict mode.
- **Database Migrations**: Drizzle Kit.

### Authentication & Authorization
- **Strategy**: Token-based admin authentication using `ADMIN_TOKEN`.
- **Security**: Client-side `ProtectedRoute` and server-side `requireAdmin` middleware, secure HTTP-only cookies.

### SEO & Discoverability
- **Sitemap XML**: Dynamically generated for static pages, properties, and blog posts.
- **JSON-LD Structured Data**: Implements schemas for `RealEstateAgent`, `Article`, and `Product`/`RentAction`.
- **Meta Tags**: Centralized SEO utility with `usePageMeta` hook for default, Open Graph, and Twitter Card tags.
- **Property Page SEO**: Optimized meta titles, descriptions (sanitized and truncated), and descriptive image alt text. Smart image prefetch for carousels.

## External Dependencies

- **Core & Runtime**: `express`, `react`, `react-dom`, `typescript`, `vite`.
- **Database & ORM**: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `drizzle-zod`.
- **UI & Styling**: `tailwindcss`, `@radix-ui/react-*`, `shadcn/ui` components, `lucide-react`.
- **State & Data Fetching**: `@tanstack/react-query`, `wouter`, `react-hook-form`, `zod`.
- **Session & Authentication**: `express-session`, `connect-pg-simple`.
- **Image Upload & Storage**: `sharp`, `@aws-sdk/client-s3` (Cloudflare R2), `multer`, `cloudinary`.
- **Email Marketing**: `@getbrevo/brevo`.