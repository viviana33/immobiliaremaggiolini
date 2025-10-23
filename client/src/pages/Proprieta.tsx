import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { usePageMeta } from "@/lib/seo";

interface Property {
  id: string;
  slug: string;
  title: string;
  price: string;
  for_rent: boolean;
  area_mq: number;
  location: string;
  annuncio?: string | null;
  images?: string[];
}

interface PaginationData {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface PropertiesResponse {
  properties: Property[];
  pagination: PaginationData;
}

export default function Proprieta() {
  usePageMeta({
    title: 'Proprietà in Vendita e Affitto',
    description: 'Esplora le nostre proprietà selezionate in vendita e affitto. Trova casa a Milano, Monza e Brianza con Immobiliare Maggiolini.',
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [location] = useLocation();

  useEffect(() => {
    sessionStorage.setItem('propertyListSource', '/proprieta');
  }, []);

  const queryParams = location.includes('?') ? location.split('?')[1] : '';
  const queryKey = queryParams ? ['/api/properties', queryParams] : ['/api/properties'];
  const queryUrl = queryParams ? `/api/properties?${queryParams}` : '/api/properties';

  const { data, isLoading, error } = useQuery<PropertiesResponse>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
  });

  const allProperties = data?.properties || [];
  
  const filteredProperties = allProperties.filter(property => {
    const matchesSearch = searchQuery === "" || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "affitto" && property.for_rent) ||
      (typeFilter === "vendita" && !property.for_rent);
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Le Nostre Proprietà
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Esplora la nostra selezione di immobili in vendita e affitto
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cerca per località, tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-properties"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="vendita">Vendita</SelectItem>
                <SelectItem value="affitto">Affitto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {isLoading ? (
            <>
              <div className="mb-6">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">
                Errore nel caricamento delle proprietà. Riprova più tardi.
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nessuna proprietà disponibile al momento.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'proprietà' : 'proprietà'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => {
                  const priceNum = parseFloat(property.price.replace(/[^\d.-]/g, ''));
                  const formattedPrice = property.for_rent 
                    ? `€ ${priceNum.toLocaleString('it-IT')}/mese`
                    : `€ ${priceNum.toLocaleString('it-IT')}`;
                  
                  return (
                    <PropertyCard
                      key={property.id}
                      id={property.slug}
                      title={property.title}
                      location={property.location}
                      price={formattedPrice}
                      images={property.images}
                      type={property.for_rent ? "affitto" : "vendita"}
                      bedrooms={2}
                      bathrooms={1}
                      area={property.area_mq}
                      annuncio={property.annuncio}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
