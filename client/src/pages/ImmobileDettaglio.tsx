import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PropertyGallery from "@/components/PropertyGallery";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import PropertyCard from "@/components/PropertyCard";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Building2, 
  Zap, 
  Home,
  ArrowLeft,
  Mail
} from "lucide-react";
import type { Property, PropertyImage } from "@shared/schema";

interface PropertyDetailResponse extends Property {
  images: PropertyImage[];
  similarProperties: Property[];
}

const energyClassMap: Record<string, string> = {
  A4: "A4 - Eccellente",
  A3: "A3 - Ottima",
  A2: "A2 - Ottima",
  A1: "A1 - Buona",
  B: "B - Buona",
  C: "C - Media",
  D: "D - Media",
  E: "E - Bassa",
  F: "F - Bassa",
  G: "G - Molto Bassa",
};

export default function ImmobileDettaglio() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug;

  const { data: property, isLoading, error } = useQuery<PropertyDetailResponse>({
    queryKey: [`/api/properties/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento immobile...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Immobile Non Trovato</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              L'immobile che stai cercando non esiste o non è più disponibile.
            </p>
            <Button onClick={() => setLocation("/immobili")} data-testid="button-back-to-properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna agli Immobili
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAvailable = property.stato === "disponibile";
  const formattedPrice = property.tipo === "affitto" 
    ? `€ ${Number(property.prezzo).toLocaleString()}/mese`
    : `€ ${Number(property.prezzo).toLocaleString()}`;

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "disponibile":
        return "default";
      case "riservato":
        return "secondary";
      case "venduto":
      case "affittato":
        return "destructive";
      default:
        return "default";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "disponibile":
        return "Disponibile";
      case "riservato":
        return "Riservato";
      case "venduto":
        return "Venduto";
      case "affittato":
        return "Affittato";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/immobili")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna agli Immobili
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PropertyGallery 
              images={property.images} 
              propertyTitle={property.titolo}
            />

            {property.linkVideo && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Video Tour</h3>
                <YouTubeEmbed 
                  videoUrl={property.linkVideo} 
                  title={`Video tour - ${property.titolo}`}
                />
              </div>
            )}

            <div>
              <h2 className="text-3xl font-serif font-bold mb-4" data-testid="text-property-title">
                {property.titolo}
              </h2>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-5 h-5" />
                <span className="text-lg" data-testid="text-location">{property.zona}</span>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold mb-3">Descrizione</h3>
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                  {property.descrizione}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-3xl font-bold" data-testid="text-price">
                    {formattedPrice}
                  </CardTitle>
                  <Badge 
                    variant={property.tipo === "vendita" ? "default" : "secondary"}
                    data-testid={`badge-type-${property.tipo}`}
                  >
                    {property.tipo === "vendita" ? "Vendita" : "Affitto"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAvailable && (
                  <Badge 
                    variant={statusBadgeVariant(property.stato)} 
                    className="w-full justify-center py-2"
                    data-testid={`badge-status-${property.stato}`}
                  >
                    {statusLabel(property.stato)}
                  </Badge>
                )}

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Maximize className="w-5 h-5" />
                      <span>Superficie</span>
                    </div>
                    <span className="font-semibold" data-testid="text-area">{property.mq} m²</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bed className="w-5 h-5" />
                      <span>Stanze</span>
                    </div>
                    <span className="font-semibold" data-testid="text-rooms">{property.stanze}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bath className="w-5 h-5" />
                      <span>Bagni</span>
                    </div>
                    <span className="font-semibold" data-testid="text-bathrooms">{property.bagni}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-5 h-5" />
                      <span>Piano</span>
                    </div>
                    <span className="font-semibold" data-testid="text-floor">{property.piano}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="w-5 h-5" />
                      <span>Classe Energetica</span>
                    </div>
                    <span className="font-semibold" data-testid="text-energy-class">
                      {energyClassMap[property.classeEnergetica] || property.classeEnergetica}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Home className="w-5 h-5" />
                      <span>Stato</span>
                    </div>
                    <span className="font-semibold" data-testid="text-status">
                      {statusLabel(property.stato)}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  asChild
                  data-testid="button-contact"
                >
                  <Link href={`/contatti?ref=immobile&context=${property.id}`}>
                    <Mail className="mr-2 h-5 w-5" />
                    Richiedi Informazioni
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {!isAvailable && property.similarProperties && property.similarProperties.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-bold mb-6">Immobili Simili</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.similarProperties.map((similar) => (
                <Link 
                  key={similar.id} 
                  href={`/immobile/${similar.slug}`}
                  data-testid={`link-similar-${similar.slug}`}
                >
                  <PropertyCard
                    id={similar.id}
                    title={similar.titolo}
                    location={similar.zona}
                    price={similar.tipo === "affitto" 
                      ? `€ ${Number(similar.prezzo).toLocaleString()}/mese`
                      : `€ ${Number(similar.prezzo).toLocaleString()}`
                    }
                    type={similar.tipo}
                    bedrooms={similar.stanze}
                    bathrooms={similar.bagni}
                    area={similar.mq}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
