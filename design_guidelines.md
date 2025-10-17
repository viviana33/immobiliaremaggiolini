# Design Guidelines: Immobiliare Maggiolini

## Design Approach
**Reference-Based: Warm Mediterranean Real Estate**

Drawing inspiration from boutique real estate platforms like Airbnb's property showcasing and Italian lifestyle aesthetics. The design emphasizes trust, warmth, and human connection through a Mediterranean color palette, generous photography, and approachable typography.

**Core Principle**: Create an inviting digital home that reflects 20+ years of trusted relationships - sophisticated yet warm, professional yet personal.

---

## Color Palette

### Light Mode
- **Primary Brand**: Terracotta/Warm Clay - `18 65% 55%` (main CTAs, accents)
- **Secondary**: Warm Sand - `35 40% 85%` (backgrounds, cards)
- **Accent**: Sage Green - `140 25% 45%` (success states, subtle highlights)
- **Neutrals**: 
  - Charcoal - `20 10% 25%` (headings, primary text)
  - Warm Gray - `25 8% 50%` (secondary text)
  - Cream - `40 30% 96%` (page backgrounds)

### Dark Mode
- **Primary**: Lighter Terracotta - `18 60% 65%`
- **Background**: Deep Warm Gray - `20 12% 12%`
- **Surface**: Elevated Gray - `20 10% 18%`
- **Text**: Warm White - `40 15% 95%`

**Color Philosophy**: Earth tones that evoke Mediterranean warmth, natural materials, and home comfort. Avoid cool blues/grays that feel corporate.

---

## Typography

### Font Families
- **Headings**: 'Playfair Display' (serif) - elegant, established, trustworthy
- **Body**: 'Inter' (sans-serif) - modern, readable, friendly
- **Accents**: 'Crimson Text' (serif) - for quotes, testimonials, special callouts

### Type Scale
- **Hero Heading**: text-5xl md:text-6xl lg:text-7xl, font-bold
- **Section Heading**: text-3xl md:text-4xl lg:text-5xl, font-semibold
- **Card Title**: text-xl md:text-2xl, font-semibold
- **Body Large**: text-lg md:text-xl, font-normal
- **Body**: text-base, leading-relaxed
- **Caption**: text-sm, text-warm-gray

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16, 20, 24** for consistent rhythm.

### Container Strategy
- **Full-width Hero**: w-full with inner max-w-7xl mx-auto
- **Content Sections**: max-w-6xl mx-auto px-6 md:px-8
- **Reading Content**: max-w-4xl (blog articles)

### Section Padding
- **Desktop**: py-20 md:py-24 lg:py-32
- **Mobile**: py-12 md:py-16
- **Cards/Components**: p-6 md:p-8

### Grid Systems
- **Property Listings**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- **Blog Articles**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Team Members**: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8
- **Feature Cards**: grid-cols-1 md:grid-cols-3 gap-6

---

## Component Library

### Navigation
- Sticky header with backdrop-blur-md, warm cream background (bg-cream/95)
- Logo left, navigation center, CTA button (terracotta) right
- Mobile: Hamburger menu with smooth slide-in drawer
- Include phone number prominently in header

### Hero Section
- **Height**: min-h-[85vh] - impactful but not forced full viewport
- **Layout**: Asymmetric split - 55% full-bleed image, 45% content overlay or side-by-side on desktop
- **Image**: Large, high-quality photo of beautiful Italian home exterior/interior with warm afternoon light
- **Content**: Headline + subheadline + dual CTAs (primary: "Scopri le Proprietà", secondary outline: "Contattaci")
- **Overlay**: If text over image, use gradient overlay (from terracotta/80 to transparent) or backdrop-blur on content card

### Property Cards
- Rounded corners (rounded-xl)
- High-quality property image with 4:3 aspect ratio
- Overlay price badge (top-right, terracotta background with white text)
- Card content: Location, property type, bedrooms/bathrooms icons, brief description
- Hover: Subtle lift (hover:shadow-xl transform hover:-translate-y-1 transition-all)
- "Vendita" or "Affitto" tag (small, sage green or terracotta)

### Blog Article Cards
- Featured image with 16:9 aspect ratio
- Category tag (warm sand background)
- Title, excerpt (2 lines max), read time, date
- Author info with small circular photo (if available)

### Team Section
- Circular profile photos (rounded-full, border-4 border-warm-sand)
- Name, role, personal quote or specialty
- Warm, genuine photos - not corporate headshots
- Arrange in asymmetric grid for personality

### Contact Form
- Two-column layout on desktop: Form left, contact info/map right
- Generous input padding (p-4)
- Warm focus states (focus:ring-terracotta focus:border-terracotta)
- Submit button with loading state
- Include office hours, response time expectation, phone, email, address

### Footer
- Multi-column layout: Logo/tagline, Quick Links, Properties, Blog, Contact
- Newsletter signup ("Resta Aggiornato" - warm sand background section)
- Social media icons (minimal, warm-gray, hover:terracotta)
- Trust indicators: "20+ anni di esperienza", "Oltre 500 famiglie servite"
- Soft warm-sand background (bg-warm-sand)

---

## Images Strategy

### Essential Images

**Hero Section**:
- Large, warm photograph of beautiful Italian home (villa, apartment with terrace, or countryside property) during golden hour lighting
- Alt approach: Family enjoying home, warm interior with natural light

**Property Listings**:
- High-quality exterior and interior photos
- Lifestyle shots showing rooms in use (not empty)
- Natural lighting preferred

**Team Section**:
- Authentic team photos - outdoor, office, or on-location
- Smiling, approachable poses
- Natural backgrounds, not studio

**Blog**:
- Lifestyle imagery related to articles (home tips, local area, Italian living)
- Mix of homes, neighborhoods, and daily life moments

**About Us Page**:
- Founder/owner photo with warm, personal setting
- Office exterior or team group photo
- Historical photos showing agency evolution (if available)

---

## Page-Specific Layouts

### Homepage
1. **Hero** (85vh): Large image + headline + CTAs
2. **Trust Indicators**: Single row with icons - 20+ anni, properties sold, happy clients
3. **Featured Properties** (py-20): 3-column grid of latest/best properties
4. **Why Choose Us**: 3-column feature cards (personalized service, local expertise, trusted relationships)
5. **Latest Blog Articles** (py-20): 3-column article preview grid
6. **Testimonial Section**: Centered, large quote format with client photo
7. **CTA Section**: Full-width warm terracotta background, centered CTA
8. **Footer**

### Proprietà (Properties) Page
- Filter sidebar (left, desktop) / collapsible (mobile): Type, Price, Location, Bedrooms
- Property grid (responsive)
- Load more or pagination

### Blog Page
- Hero with blog title/description
- Category filters (horizontal pills)
- Article grid (masonry-style or standard grid)

### Chi Siamo (About) Page
- Story section with founder photo
- Mission/values cards
- Team grid with photos and descriptions
- Timeline of agency milestones (optional but nice)

---

## Animations & Interactions

**Use Sparingly**:
- Smooth scroll to sections
- Fade-in on scroll for sections (subtle, once)
- Property card hover lift
- Button hover states (built-in, no custom)

**Avoid**: Parallax, carousel autoplay, distracting transitions

---

## Accessibility & Dark Mode

- Maintain WCAG AA contrast ratios
- Dark mode: Preserve warmth through color temperature, not just inverting
- Focus indicators visible in both modes
- Form inputs maintain consistent styling across themes
- Alt text for all images, especially properties

---

**Design Philosophy**: Every element should reinforce trust, warmth, and human connection. Think Mediterranean hospitality meets modern web design - professional but never cold, sophisticated but always approachable.