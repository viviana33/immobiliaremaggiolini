import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { useEffect } from "react";
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

  const properties = data?.properties || [];

  return (
    <div className="min-h-screen bg-background">
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

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive text-lg">
                Errore nel caricamento delle proprietà. Riprova più tardi.
              </p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Nessuna proprietà disponibile al momento.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-muted-foreground text-sm">
                  Mostrando <span className="font-semibold text-foreground">{properties.length}</span> {properties.length === 1 ? 'proprietà' : 'proprietà'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => {
                  const priceNum = parseFloat(property.price.replace(/[^\d.-]/g, ''));
                  const formattedPrice = property.for_rent 
                    ? `€ ${priceNum.toLocaleString('it-IT')}/mese`
                    : `€ ${priceNum.toLocaleString('it-IT')}`;
                  
                  return (
                    <PropertyCard
                      key={property.id}
                      slug={property.slug}
                      title={property.title}
                      location={property.location}
                      price={formattedPrice}
                      images={property.images}
                      type={property.for_rent ? "affitto" : "vendita"}
                      bedrooms={2}
                      bathrooms={1}
                      area={property.area_mq}
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
