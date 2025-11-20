import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Ear, Home as HomeIcon, Handshake, Clock } from "lucide-react";
import { Link } from "wouter";
import { usePageMeta } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import type { Property, Post } from "@shared/schema";

export default function Home() {
  usePageMeta({
    title: 'Vendita e Affitto Immobili a Milano e Varese',
    description: 'Agenzia immobiliare specializzata in vendita e affitto di proprietà a Milano e Varese. Professionalità, esperienza e servizio personalizzato dal 1985.',
  });

  const values = [
    {
      icon: Ear,
      title: "Ascolto profondo",
      description: "Prima di ogni proposta",
    },
    {
      icon: HomeIcon,
      title: "Conoscenza diretta",
      description: "Di immobili e persone",
    },
    {
      icon: Handshake,
      title: "Mediazione autentica",
      description: "Tra esigenze diverse",
    },
    {
      icon: Clock,
      title: "Presenza costante",
      description: "Dal primo contatto in poi",
    },
  ];

  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = useQuery<{
    properties: Array<{
      id: string;
      slug: string;
      title: string;
      price: string;
      for_rent: boolean;
      area_mq: number;
      location: string;
      images: string[];
    }>;
    pagination: any;
  }>({
    queryKey: ['/api/properties', 'perPage=3&sort=recente'],
    queryFn: async () => {
      const response = await fetch('/api/properties?perPage=3&sort=recente');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const { data: postsData, isLoading: isLoadingPosts, error: postsError } = useQuery<{
    posts: Post[];
    pagination: any;
  }>({
    queryKey: ['/api/posts', 'perPage=3'],
    queryFn: async () => {
      const response = await fetch('/api/posts?perPage=3');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const featuredProperties = propertiesData?.properties || [];
  const latestBlogPosts = postsData?.posts || [];

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
            {isLoadingProperties ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse" data-testid={`skeleton-property-${i}`}>
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </Card>
              ))
            ) : propertiesError ? (
              <div className="col-span-full text-center py-12">
                <p className="text-destructive" data-testid="text-error-properties">
                  Errore nel caricamento degli immobili
                </p>
              </div>
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property) => {
                const formattedPrice = property.for_rent 
                  ? `€ ${parseFloat(property.price).toLocaleString('it-IT')}/mese`
                  : `€ ${parseFloat(property.price).toLocaleString('it-IT')}`;
                
                return (
                  <PropertyCard
                    key={property.id}
                    slug={property.slug}
                    title={property.title}
                    location={property.location}
                    price={formattedPrice}
                    images={property.images}
                    type={property.for_rent ? "affitto" : "vendita"}
                    area={property.area_mq}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-properties">
                  Nessun immobile disponibile al momento
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Separator between Properties and Blog */}
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium tracking-wider uppercase">Dal Nostro Blog</span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
          </div>
        </div>
      </div>

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
            {isLoadingPosts ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse" data-testid={`skeleton-post-${i}`}>
                  <div className="aspect-video bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ))
            ) : postsError ? (
              <div className="col-span-full text-center py-12">
                <p className="text-destructive" data-testid="text-error-posts">
                  Errore nel caricamento degli articoli
                </p>
              </div>
            ) : latestBlogPosts.length > 0 ? (
              latestBlogPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  title={post.titolo}
                  excerpt={post.sottotitolo || post.contenuto.substring(0, 150) + '...'}
                  image={post.cover || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'}
                  category={post.categoria || 'Blog'}
                  date={new Date(post.publishedAt || post.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  readTime={post.readingTimeMin ? `${post.readingTimeMin} min` : '5 min'}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-posts">
                  Nessun articolo disponibile al momento
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-3">
              Il nostro approccio
            </h2>
            <p className="text-muted-foreground text-lg">
              Quando lavoriamo per te
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="p-6 space-y-3 hover-elevate transition-all" data-testid={`card-value-${value.title.toLowerCase()}`}>
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-semibold text-xl text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
