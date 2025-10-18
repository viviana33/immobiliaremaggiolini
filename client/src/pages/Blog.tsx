import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * RENDERING STRATEGY: Client-Side Rendering (CSR)
 * 
 * Questo progetto usa Vite + React con rendering lato client.
 * Non è possibile implementare SSR (Server-Side Rendering) o ISR (Incremental Static Regeneration)
 * senza un framework come Next.js, Remix, o configurazione custom SSR.
 * 
 * CONSIDERAZIONI SEO:
 * - CSR: Il contenuto viene caricato via JavaScript dopo il primo paint. I crawler moderni
 *   (Google, Bing) eseguono JavaScript, ma il rendering iniziale è vuoto.
 * - SSR: Il server genera l'HTML completo prima dell'invio. Ottimo per SEO e First Contentful Paint.
 * - ISR: Simile a SSR ma con cache e rigenerazione incrementale (solo Next.js).
 * 
 * SCELTA ATTUALE: CSR (unica opzione con Vite/React standard)
 * 
 * MIGLIORAMENTI SEO POSSIBILI CON CSR:
 * 1. Meta tags statici nel <head> (già implementati in index.html)
 * 2. Prerendering statico con Vite plugin (vite-plugin-ssr)
 * 3. Generazione sitemap.xml dinamica
 * 4. Structured data (JSON-LD) per articoli
 * 5. Migrazione futura a Next.js per SSR nativo se SEO diventa prioritario
 */

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const categories = useMemo(() => {
    if (!posts) return ["all"];
    const uniqueCategories = new Set(
      posts.map((p) => p.categoria).filter((cat): cat is string => Boolean(cat))
    );
    return ["all", ...Array.from(uniqueCategories)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (selectedCategory === "all") return posts;
    return posts.filter((post) => post.categoria === selectedCategory);
  }, [posts, selectedCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Il Nostro Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Consigli, approfondimenti e storie dal mondo immobiliare e dalla vita quotidiana
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category === "all" ? "all" : (category?.toLowerCase().replace(/\s+/g, "-") || "uncategorized")}`}
              >
                {category === "all" ? "Tutti gli Articoli" : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Caricamento articoli...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>
                Impossibile caricare gli articoli. Riprova più tardi.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Nessun articolo disponibile in questa categoria.
              </p>
            </div>
          )}

          {!isLoading && !error && visiblePosts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visiblePosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    data-testid="button-load-more-articles"
                  >
                    Carica Altri Articoli
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
