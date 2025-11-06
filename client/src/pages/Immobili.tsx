import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import SortingControls from "@/components/SortingControls";
import PaginationControls from "@/components/PaginationControls";
import { useLocation } from "wouter";
import { usePageMeta } from "@/lib/seo";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  const [location, setLocation] = useLocation();
  const queryParams = location.includes('?') ? location.split('?')[1] : '';
  
  // Parse URL params
  const urlParams = new URLSearchParams(queryParams);
  const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
  const [includeArchived, setIncludeArchived] = useState(urlParams.get('includeArchived') === 'true');

  useEffect(() => {
    sessionStorage.setItem('propertyListSource', '/immobili');
  }, []);
  
  const handleSearch = () => {
    const params = new URLSearchParams(queryParams);
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    if (includeArchived) {
      params.set('includeArchived', 'true');
    } else {
      params.delete('includeArchived');
    }
    
    // Reset to page 1 when searching
    params.delete('page');
    
    const newQuery = params.toString();
    setLocation(`/immobili${newQuery ? `?${newQuery}` : ''}`);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setIncludeArchived(false);
    const params = new URLSearchParams(queryParams);
    params.delete('search');
    params.delete('includeArchived');
    params.delete('page');
    const newQuery = params.toString();
    setLocation(`/immobili${newQuery ? `?${newQuery}` : ''}`);
  };

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
        <div className="mb-6 space-y-4">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
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
    const hasActiveFilters = searchTerm || includeArchived;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="heading-immobili">Lista Immobili</h1>
        
        {/* Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Cerca immobile (es: trilocale, milano, via meda, 11...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                data-testid="input-search-property"
              />
            </div>
            <Button 
              onClick={handleSearch}
              data-testid="button-search"
            >
              <Search className="w-4 h-4 mr-2" />
              Cerca
            </Button>
            {(searchTerm || includeArchived) && (
              <Button 
                variant="outline"
                onClick={handleClearSearch}
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4 mr-2" />
                Cancella
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-archived" 
              checked={includeArchived}
              onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
              data-testid="checkbox-include-archived"
            />
            <Label 
              htmlFor="include-archived" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Includi immobili archiviati
            </Label>
          </div>
        </div>
        
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
            {hasActiveFilters 
              ? "Nessun immobile trovato con i criteri di ricerca selezionati."
              : "Nessun immobile disponibile al momento."}
          </p>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleClearSearch}
              className="mt-4"
              data-testid="button-clear-filters"
            >
              Cancella filtri di ricerca
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8" data-testid="heading-immobili">Lista Immobili</h1>
      
      {/* Search Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Cerca immobile (es: trilocale, milano, via meda, 11...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              data-testid="input-search-property"
            />
          </div>
          <Button 
            onClick={handleSearch}
            data-testid="button-search"
          >
            <Search className="w-4 h-4 mr-2" />
            Cerca
          </Button>
          {(searchTerm || includeArchived) && (
            <Button 
              variant="outline"
              onClick={handleClearSearch}
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4 mr-2" />
              Cancella
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-archived" 
            checked={includeArchived}
            onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
            data-testid="checkbox-include-archived"
          />
          <Label 
            htmlFor="include-archived" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Includi immobili archiviati
          </Label>
        </div>
      </div>
      
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
  );
}
