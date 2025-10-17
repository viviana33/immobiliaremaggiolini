import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  slug: string;
  title: string;
  price: string;
  for_rent: boolean;
  area_mq: number;
  location: string;
}

export default function Immobili() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-properties" />
        </div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Lista Immobili</h1>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            title={property.title}
            location={property.location}
            price={`€ ${parseFloat(property.price).toLocaleString('it-IT')}`}
            image="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop"
            type={property.for_rent ? "affitto" : "vendita"}
            bedrooms={2}
            bathrooms={1}
            area={property.area_mq}
          />
        ))}
      </div>
    </div>
  );
}
