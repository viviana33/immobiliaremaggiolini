# Immobiliare Maggiolini - Real Estate Platform

## Overview

Immobiliare Maggiolini is a real estate platform for a boutique Italian agency, aiming to project trust, warmth, and human connection. Its core purpose is to showcase property listings for sale and rent, provide informative blog content, and introduce the agency's team. The platform integrates a robust admin authentication system for content management. The design is inspired by Italian aesthetics, focusing on rich media display for properties and engaging blog articles to build client trust and market presence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18+ with TypeScript, Vite.
- **Routing**: Wouter with sessionStorage-based navigation tracking for property detail back navigation.
- **State Management**: TanStack Query for server state, React Context API for themes/sessions.
- **UI Framework**: shadcn/ui (Radix UI) with Tailwind CSS, custom Mediterranean color palette, responsive mobile-first design, dark mode.
- **Component Structure**: Organized by presentation, pages, UI primitives, and custom hooks.
- **Image Carousel**: Custom `ImageCarousel` component with keyboard navigation (Arrow keys), touch/pointer swipe support, lazy loading for non-current images, smart prefetch (only next image), aspect ratio preservation, thumbnail navigation, descriptive alt text support, and full accessibility (ARIA labels, focus rings). Supports empty state with placeholder fallback. Uses instance-scoped prefetch to prevent conflicts when multiple carousels are mounted.
- **Navigation UX**: Property listing pages (/proprieta and /immobili) set sessionStorage to track user's origin. Property detail pages read this value to correctly navigate back to the originating list when users click "Torna Indietro", with /immobili as safe fallback for direct links.

### Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with JSON, protected admin routes via session-based middleware.
- **Session Management**: Express-session with PostgreSQL storage, HTTP-only cookies.

### Data Layer
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver.
- **Database Schema**:
    - **Properties**: Includes details like title, description, price, type, area, rooms, bathrooms, energy class, zone, status, video link.
    - **Property Images**: Stores foreign keys to properties, hot/cold URLs, file hashes, and archive flags.
    - **Blog Posts**: Contains title, subtitle, slug, cover image, cover position (nascosta/inizio/fine), rich content, tags, category, author, status, SEO fields.
    - **Subscriptions**: Stores email, name, preferences (`blog_updates`, `new_listings`), consent data, and confirmation status.
    - **Leads**: Stores contact form submissions with nome, email, messaggio, fonte, contextId, newsletter consent, IP address, and creation timestamp.
- **Property Management**: Supports URL-based filtering, detailed property pages with image galleries, video embeds, and related properties. Price formatting handles numeric strings from API ("180000.00") via `parseFloat(price.replace(/[^\d.-]/g, ''))` for correct locale-formatted display.
- **Blog Management**: Admin forms use React Hook Form with Zod validation, professional WYSIWYG editor (`RichTextEditor`), and a dual-storage image upload system (R2 for cold, Cloudinary for hot delivery). Public blog pages feature category filtering, pagination, and SEO considerations.
  - **Cover Image Control**: Administrators can control if and where the cover image appears within blog post content via `coverPosition` field with three options:
    * **Nascosta** (Hidden): Cover image is used for SEO meta tags and social sharing but not displayed in the article content
    * **Inizio** (Start): Cover image appears before the article content (default behavior)
    * **Fine** (End): Cover image appears after the article content
    The setting is managed through a select field in the admin post form and persisted in the database with default value "inizio" for backward compatibility.
  - **RichTextEditor**: Professional Tiptap-based WYSIWYG editor providing complete creative control over blog content. Features include:
    * **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code with instant visual feedback
    * **Headings**: Three levels (H1, H2, H3) with customizable sizes - perfect for main headlines and section headings
    * **Colors & Highlighting**: Custom text colors and text highlights via intuitive color pickers - full creative freedom
    * **Text Alignment**: Left, Center, Right alignment for any content block
    * **Lists & Quotes**: Bullet lists, numbered lists, and blockquotes for structured content
    * **Images**: Insert via file upload or URL, fully resizable by clicking/dragging with visual resize handles, automatic responsive sizing. File uploads use the same `/api/admin/upload-post-image` endpoint as cover images (JPEG, PNG, WebP, GIF, max 8MB). Images can be repositioned using cut/paste, delete/re-insert, or alignment buttons.
    * **Undo/Redo**: Complete edit history with keyboard shortcuts
    * **Real-Time WYSIWYG**: Inline editing shows exactly how content will appear - no preview tab needed
    * **Security (Defense-in-Depth)**:
      - Editor-level: Blocks data: URIs (`allowBase64: false`)
      - HTML-level: rehype-sanitize blocks dangerous tags (script, iframe), event handlers (onclick, onerror), and dangerous protocols (javascript:)
      - Protocol-level: Only http/https/mailto allowed in URLs
      - CSS-level: Custom plugin whitelists only `color`, `background-color`, `text-align` and blocks all `url()` to prevent data: URI attacks
      - All content sanitized before rendering - no XSS vulnerabilities
    * **Persistence**: Content stored as HTML, preserving all formatting including colors, highlights, alignment
    * **Mobile-Friendly**: Responsive toolbar adapts to screen size
- **Newsletter System**: Manages user subscriptions with double opt-in via Brevo integration, including preference updates, confirmation flows, and rate limiting. It also includes a "Thank You" page with upgrade flows for subscription preferences and a dedicated "Preferences" page for managing subscriptions.
- **Property Listing Notifications**: Automated email notifications for new or newly available properties sent to subscribed users, integrated with Brevo transactional emails.
- **One-Click Unsubscribe**: Token-based unsubscribe system with personalized links in all automated emails (blog posts and property listings). When users click the unsubscribe link, they are immediately unsubscribed from all lists and redirected to the Preferences page with a confirmation message. Admin receives email notification when someone unsubscribes, including user details and previous subscription preferences.
- **Lead Management**: Admin interface for viewing and managing contact form submissions. Features include searchable lead list, detailed view dialog showing all lead information (nome, email, messaggio, fonte, newsletter consent, IP, timestamp), and delete functionality with confirmation. Accessible via `/admin/lead` route with protected admin authentication. Public lead submission via `/api/lead` endpoint includes honeypot anti-spam protection and automatic email notifications to admin and user.
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
- **Property Page SEO Optimizations**:
  - **Meta Title**: Format `Property.title | Immobiliare Maggiolini` for consistent branding
  - **Meta Description**: Sanitized from property description (strips HTML and Markdown: bold, italic, code, headings, links, lists, blockquotes), limited to 150-160 characters including ellipsis, truncated at word boundaries
  - **Image Alt Text**: Descriptive format `Property.title - immagine N` for all images (carousel main, thumbnails, property cards)
  - **Smart Image Prefetch**: Only the next image in carousel is prefetched using instance-scoped `<link rel="prefetch">` tags to optimize performance without aggressive resource loading

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