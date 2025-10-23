import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import apartmentImage from "@assets/generated_images/Apartment_interior_property_image_66b8a52c.png";
import countrysideImage from "@assets/generated_images/Countryside_property_image_dddb1072.png";
import penthouseImage from "@assets/generated_images/Penthouse_terrace_property_image_6980bf5a.png";
import blogImage1 from "@assets/generated_images/Blog_lifestyle_image_1_9c81ebb5.png";
import blogImage2 from "@assets/generated_images/Blog_lifestyle_image_2_e0f97e8e.png";
import { usePageMeta } from "@/lib/seo";

export default function Home() {
  usePageMeta({
    title: 'Vendita e Affitto Immobili a Milano, Monza e Brianza',
    description: 'Agenzia immobiliare specializzata in vendita e affitto di proprietà a Milano, Monza e Brianza. Professionalità, esperienza e servizio personalizzato dal 1985.',
  });
  const featuredProperties = [
    {
      id: "1",
      title: "Elegante Appartamento Centro",
      location: "Milano, Porta Nuova",
      price: "€ 450.000",
      image: apartmentImage,
      type: "vendita" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
    },
    {
      id: "2",
      title: "Villa con Giardino",
      location: "Monza, Centro Storico",
      price: "€ 2.800/mese",
      image: countrysideImage,
      type: "affitto" as const,
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
    },
    {
      id: "3",
      title: "Attico con Terrazza Panoramica",
      location: "Como, Lungolago",
      price: "€ 890.000",
      image: penthouseImage,
      type: "vendita" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
    },
  ];

  const latestBlogPosts = [
    {
      id: "1",
      title: "Come Scegliere il Quartiere Perfetto per la Tua Famiglia",
      excerpt: "Scopri i fattori chiave da considerare quando cerchi la zona ideale dove vivere: scuole, servizi, trasporti e qualità della vita.",
      image: blogImage1,
      category: "Consigli Casa",
      date: "15 Marzo 2024",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "Tendenze del Mercato Immobiliare Primavera 2024",
      excerpt: "Analisi dettagliata delle tendenze attuali nel mercato immobiliare lombardo e previsioni per i prossimi mesi.",
      image: blogImage2,
      category: "Mercato",
      date: "10 Marzo 2024",
      readTime: "7 min",
    },
    {
      id: "3",
      title: "Vivere a Milano: I Quartieri Più Ricercati",
      excerpt: "Una guida completa ai quartieri milanesi più desiderati, con focus su prezzi, servizi e stile di vita.",
      image: blogImage1,
      category: "Territorio",
      date: "5 Marzo 2024",
      readTime: "6 min",
    },
  ];

  return (
    <div>
      <Hero />

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
                Proprietà in Evidenza
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Scopri le migliori opportunità selezionate per te
              </p>
            </div>
            <Link href="/immobili">
              <Button variant="outline" className="gap-2" data-testid="button-view-all-properties">
                Vedi Tutte
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4 p-6 rounded-md hover-elevate transition-all">
              <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
                <span className="text-2xl text-primary-foreground">🤝</span>
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground">
                Servizio Personalizzato
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ogni cliente è unico. Ti accompagniamo passo dopo passo nella ricerca della tua casa ideale.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-md hover-elevate transition-all">
              <div className="w-12 h-12 rounded-md bg-accent flex items-center justify-center">
                <span className="text-2xl text-accent-foreground">🏡</span>
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground">
                Esperienza Locale
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Conosciamo il territorio come nessun altro. 20 anni di presenza sul mercato lombardo.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-md hover-elevate transition-all">
              <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
                <span className="text-2xl text-primary-foreground">💚</span>
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground">
                Rapporto di Fiducia
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Non siamo solo agenti immobiliari, ma amici che ti sostengono in ogni momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
                Dal Nostro Blog
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Consigli, novità e storie dal mondo immobiliare
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="gap-2" data-testid="button-view-all-blog">
                Leggi Tutto
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-6">
          <h2 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl">
            Pronti a Trovare la Vostra Casa dei Sogni?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            Contattaci oggi stesso per una consulenza gratuita. 
            Siamo qui per aiutarvi a realizzare il vostro sogno.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/contatti">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                data-testid="button-cta-contact"
              >
                Contattaci Ora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/immobili">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-cta-properties"
              >
                Esplora Proprietà
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
