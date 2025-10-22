import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import SortingControls from "@/components/SortingControls";
import PaginationControls from "@/components/PaginationControls";
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

  const [location] = useLocation();
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Lista Immobili</h1>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="heading-immobili">Lista Immobili</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              0 immobili trovati
            </p>
          </div>
          <SortingControls />
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg" data-testid="text-no-properties">
            Nessun immobile disponibile al momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8" data-testid="heading-immobili">Lista Immobili</h1>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {pagination?.total || 0} {pagination?.total === 1 ? "immobile trovato" : "immobili trovati"}
          </p>
        </div>
        <SortingControls />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const priceValue = typeof property.price === 'string' 
            ? parseFloat(property.price) 
            : property.price;
          
          return (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              location={property.location}
              price={`€ ${priceValue.toLocaleString('it-IT')}`}
              image="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop"
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
  );
}
