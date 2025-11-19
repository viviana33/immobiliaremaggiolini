import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import SortingControls from "@/components/SortingControls";
import PaginationControls from "@/components/PaginationControls";
import CitySearchBar from "@/components/CitySearchBar";
import TypeFilter from "@/components/TypeFilter";
import { usePageMeta } from "@/lib/seo";
import { useEffect } from "react";
import { useQueryString } from "@/hooks/useQueryString";

interface Property {
  id: string;
  slug: string;
  title: string;
  price: string;
  for_rent: boolean;
  area_mq: number;
  location: string;
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

export default function Immobili() {
  usePageMeta({
    title: 'Immobili in Vendita e Affitto',
    description: 'Trova il tuo immobile ideale tra le nostre proprietà selezionate in vendita e affitto a Milano, Monza e Brianza. Appartamenti, ville, attici e molto altro.',
  });

  const { searchParams } = useQueryString();

  useEffect(() => {
    sessionStorage.setItem('propertyListSource', '/immobili');
  }, []);

  const queryString = searchParams.toString();

  const { data, isLoading, error} = useQuery<PropertiesResponse>({
    queryKey: ['/api/properties', queryString],
    queryFn: async () => {
      const url = queryString ? `/api/properties?${queryString}` : '/api/properties';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return await response.json();
    },
  });

  const properties = data?.properties || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Lista Immobili</h1>
        <div className="text-center py-12">
          <p className="text-destructive text-lg" data-testid="text-error">
            Errore nel caricamento degli immobili. Riprova più tardi.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-secondary py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Immobili
            </h1>
            <p className="text-muted-foreground text-lg">
              Scopri tutte le nostre proprietà disponibili
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <CitySearchBar />
                </div>
                <TypeFilter />
                <SortingControls />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-secondary py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4" data-testid="heading-immobili">
              Immobili
            </h1>
            <p className="text-muted-foreground text-lg">
              Scopri tutte le nostre proprietà disponibili
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <CitySearchBar />
                </div>
                <TypeFilter />
                <SortingControls />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                  0 immobili trovati
                </p>
              </div>
            </div>
            
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg" data-testid="text-no-properties">
                Nessun immobile disponibile al momento.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4" data-testid="heading-immobili">
            Immobili
          </h1>
          <p className="text-muted-foreground text-lg">
            Scopri tutte le nostre proprietà disponibili
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <CitySearchBar />
              </div>
              <div className="flex flex-row gap-4">
                <TypeFilter />
                <SortingControls />
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {pagination?.total || 0} {pagination?.total === 1 ? "immobile trovato" : "immobili trovati"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => {
              const priceValue = typeof property.price === 'string' 
                ? parseFloat(property.price) 
                : property.price;
              
              return (
                <PropertyCard
                  key={property.id}
                  slug={property.slug}
                  title={property.title}
                  location={property.location}
                  price={`€ ${priceValue.toLocaleString('it-IT')}`}
                  images={property.images}
                  type={property.for_rent ? "affitto" : "vendita"}
                  bedrooms={2}
                  bathrooms={1}
                  area={property.area_mq}
                />
              );
            })}
          </div>
          
          {pagination && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
            />
          )}
        </div>
      </section>
    </div>
  );
}
