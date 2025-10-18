import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Loader2, AlertCircle, Search, X, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";

/**
 * SCELTA PAGINAZIONE: URL-based pagination (page param)
 * 
 * TRADE-OFF SEO vs UX:
 * 
 * PAGINAZIONE CON URL PARAMS (SCELTA IMPLEMENTATA):
 * ✅ SEO PRO: I crawler possono scoprire e indicizzare tutte le pagine (/blog?page=2, /blog?page=3)
 * ✅ UX PRO: Gli utenti possono condividere link, usare il tasto indietro del browser, bookmarkare pagine specifiche
 * ✅ Migliore per contenuti statici o semi-statici come blog
 * ⚠️ UX CON: Richiede un click per caricare la pagina successiva (non seamless come infinite scroll)
 * ⚠️ SEO CON: Richiede rel="next"/"prev" per ottimizzare il crawling (opzionale, miglioramento futuro)
 * 
 * ALTERNATIVA "CARICA ALTRI" (Load More):
 * ⚠️ SEO CON: I crawler vedono solo la prima pagina, contenuti successivi nascosti dietro JavaScript
 * ✅ UX PRO: Esperienza più fluida, nessuna interruzione di pagina
 * ⚠️ UX CON: Impossibile condividere o bookmarkare stati intermedi
 * ⚠️ Peggiore per SEO: richiede prerendering o sitemap XML molto dettagliata
 * 
 * CONCLUSIONE: Per un blog, la SEO è prioritaria. La paginazione URL-based garantisce
 * che tutti gli articoli siano indicizzabili e condivisibili, essenziale per la visibilità organica.
 */

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default function Blog() {
  const [location, setLocation] = useLocation();
  
  const queryParams = useMemo(() => {
    return location.includes('?') ? location.split('?')[1] : '';
  }, [location]);
  
  const { categoria, searchQuery, selectedTag, currentPage } = useMemo(() => {
    const searchParams = new URLSearchParams(queryParams);
    return {
      categoria: searchParams.get("categoria") || "",
      searchQuery: searchParams.get("search") || "",
      selectedTag: searchParams.get("tag") || "",
      currentPage: parseInt(searchParams.get("page") || "1"),
    };
  }, [queryParams]);
  
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const queryKey = queryParams ? ['/api/posts', queryParams] : ['/api/posts'];

  const { data, isLoading, error } = useQuery<PostsResponse>({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const params = queryKey[1] as string | undefined;
      const url = params ? `/api/posts?${params}` : '/api/posts';
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const allPosts = data?.posts || [];
  const pagination = data?.pagination;

  const hasActiveFilters = Boolean(categoria || searchQuery || selectedTag);

  const updateFilters = (updates: {
    categoria?: string;
    search?: string;
    tag?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(queryParams);
    
    if (updates.categoria !== undefined) {
      if (updates.categoria) {
        params.set("categoria", updates.categoria);
      } else {
        params.delete("categoria");
      }
    }
    
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
    }
    
    if (updates.tag !== undefined) {
      if (updates.tag) {
        params.set("tag", updates.tag);
      } else {
        params.delete("tag");
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set("page", updates.page.toString());
      } else {
        params.delete("page");
      }
    }

    const newQueryString = params.toString();
    const newUrl = `/blog${newQueryString ? `?${newQueryString}` : ""}`;
    setLocation(newUrl);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput, page: 1 });
  };

  const clearSearch = () => {
    setSearchInput("");
    updateFilters({ search: "", page: 1 });
  };

  const toggleTag = (tag: string) => {
    if (selectedTag === tag) {
      updateFilters({ tag: "", page: 1 });
    } else {
      updateFilters({ tag, page: 1 });
    }
  };

  const setCategory = (cat: string) => {
    updateFilters({ categoria: cat === "all" ? "" : cat, page: 1 });
  };

  const goToPage = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setLocation("/blog");
  };

  const allCategories = Array.from(
    new Set(
      (allPosts || [])
        .map(p => p.categoria)
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const allTags = Array.from(
    new Set(
      (allPosts || [])
        .flatMap(post => post.tag || [])
    )
  ).sort();

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
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-6">
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca per titolo o sottotitolo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-20"
              data-testid="input-search-posts"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-14 top-1/2 -translate-y-1/2 h-7 px-2"
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              data-testid="button-submit-search"
            >
              Cerca
            </Button>
          </form>

          {!isLoading && allCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Categorie</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!categoria ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("all")}
                  data-testid="button-category-all"
                >
                  Tutte
                </Button>
                {allCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoria === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tag</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => toggleTag(tag)}
                    data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {tag}
                    {selectedTag === tag && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtri attivi:</span>
              {categoria && (
                <Badge variant="secondary" data-testid="active-filter-categoria">
                  Categoria: {categoria}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" data-testid="active-filter-search">
                  Cerca: "{searchQuery}"
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" data-testid="active-filter-tag">
                  Tag: {selectedTag}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2"
                data-testid="button-clear-all-filters"
              >
                Rimuovi tutti
              </Button>
            </div>
          )}
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

          {!isLoading && !error && allPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center" data-testid="empty-state">
              <div className="rounded-full bg-muted p-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-semibold text-2xl text-foreground">
                  Nessun articolo trovato
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {hasActiveFilters
                    ? "Prova a modificare i filtri di ricerca o rimuovili per vedere tutti gli articoli disponibili."
                    : "Non ci sono articoli pubblicati al momento. Torna presto per nuovi contenuti!"}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  data-testid="button-reset-filters"
                >
                  Rimuovi filtri
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && allPosts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                      const showPage =
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                      const showEllipsisAfter =
                        page === currentPage + 2 && currentPage < pagination.totalPages - 2;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          {showPage && (
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className="min-w-9"
                              data-testid={`button-page-${page}`}
                            >
                              {page}
                            </Button>
                          )}
                          {showEllipsisAfter && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                        </div>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                    Pagina {pagination.page} di {pagination.totalPages} ({pagination.total}{" "}
                    articol{pagination.total === 1 ? "o" : "i"} totali)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
