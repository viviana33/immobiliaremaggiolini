import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "@/components/ImageCarousel";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import PropertyCard from "@/components/PropertyCard";
import ContactForm from "@/components/ContactForm";
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
import { useEffect } from "react";

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
    queryKey: ['/api/properties/resolve', slug],
    queryFn: async () => {
      const response = await fetch(`/api/properties/resolve/${encodeURIComponent(slug!)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NOT_FOUND');
        }
        throw new Error('Failed to fetch property');
      }
      return response.json();
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!property) return;

    const siteUrl = window.location.origin;
    const pageUrl = `${siteUrl}/immobile/${property.slug}`;
    
    const formattedPrice = property.tipo === "affitto" 
      ? `€ ${Number(property.prezzo).toLocaleString()}/mese`
      : `€ ${Number(property.prezzo).toLocaleString()}`;

    const metaTitle = `${property.titolo} | Immobiliare Maggiolini`;
    document.title = metaTitle;

    const sanitizeDescription = (text: string, maxLength: number = 160): string => {
      const plainText = text
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/>\s+/g, '')
        .replace(/[-*+]\s+/g, '')
        .replace(/\d+\.\s+/g, '')
        .replace(/\n\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (plainText.length <= maxLength) return plainText;
      
      const ellipsis = '...';
      const targetLength = maxLength - ellipsis.length;
      const truncated = plainText.substring(0, targetLength);
      const lastSpace = truncated.lastIndexOf(' ');
      
      return lastSpace > targetLength - 30 
        ? truncated.substring(0, lastSpace) + ellipsis
        : truncated + ellipsis;
    };

    const metaDescription = sanitizeDescription(property.descrizione, 160);
    
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDescription);

    const ogTags = [
      { property: 'og:type', content: 'product' },
      { property: 'og:title', content: metaTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:url', content: pageUrl },
      { property: 'og:site_name', content: 'Maggiolini Immobiliare' },
    ];

    const coverImage = property.images?.[0]?.urlHot || property.images?.[0]?.urlCold;
    if (coverImage) {
      ogTags.push({ property: 'og:image', content: coverImage });
      ogTags.push({ property: 'og:image:alt', content: property.titolo });
    }

    ogTags.forEach(({ property: prop, content }) => {
      let tag = document.querySelector(`meta[property="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: metaTitle },
      { name: 'twitter:description', content: metaDescription },
    ];

    if (coverImage) {
      twitterTags.push({ name: 'twitter:image', content: coverImage });
    }

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    const propertySchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": property.tipo === "vendita" ? "Product" : "RentAction",
      "name": property.titolo,
      "description": property.descrizione,
      "url": pageUrl,
    };

    if (property.tipo === "vendita") {
      propertySchema["offers"] = {
        "@type": "Offer",
        "price": property.prezzo,
        "priceCurrency": "EUR",
        "availability": property.stato === "disponibile" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "RealEstateAgent",
          "name": "Immobiliare Maggiolini"
        }
      };
    } else {
      propertySchema["object"] = {
        "@type": "Product",
        "name": property.titolo,
        "description": property.descrizione
      };
      propertySchema["priceSpecification"] = {
        "@type": "UnitPriceSpecification",
        "price": property.prezzo,
        "priceCurrency": "EUR",
        "unitText": "MONTH"
      };
    }

    if (coverImage) {
      propertySchema["image"] = coverImage;
    }

    propertySchema["additionalProperty"] = [
      {
        "@type": "PropertyValue",
        "name": "Area",
        "value": `${property.mq} m²`
      },
      {
        "@type": "PropertyValue",
        "name": "Stanze",
        "value": property.stanze
      },
      {
        "@type": "PropertyValue",
        "name": "Bagni",
        "value": property.bagni
      },
      {
        "@type": "PropertyValue",
        "name": "Classe Energetica",
        "value": property.classeEnergetica
      },
      {
        "@type": "PropertyValue",
        "name": "Piano",
        "value": property.piano
      },
      {
        "@type": "PropertyValue",
        "name": "Zona",
        "value": property.zona
      }
    ];

    let scriptTag = document.querySelector('script[type="application/ld+json"][id="property-schema"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'property-schema');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(propertySchema);

    return () => {
      document.title = 'Immobiliare Maggiolini';
      const tagsToRemove = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], script[id="property-schema"]');
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, [property]);

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
            <Button 
              onClick={() => {
                const source = sessionStorage.getItem('propertyListSource') || '/immobili';
                setLocation(source);
              }} 
              data-testid="button-back-to-properties"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna Indietro
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
          onClick={() => {
            const source = sessionStorage.getItem('propertyListSource') || '/immobili';
            setLocation(source);
          }}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna Indietro
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-property-title">
                {property.titolo}
              </h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-lg" data-testid="text-location">{property.zona}</span>
              </div>

              <div className="text-3xl font-bold mb-6" data-testid="text-price-main">
                {formattedPrice}
              </div>
            </div>

            <ImageCarousel 
              images={property.images.map(img => img.urlHot)}
              showThumbnails={true}
              title={property.titolo}
            />

            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Descrizione</h2>
              <div className="prose prose-slate max-w-none">
                {property.descrizione.split('\n\n').map((paragraph, index) => (
                  <p 
                    key={index} 
                    className="text-muted-foreground mb-4 last:mb-0" 
                    data-testid={index === 0 ? "text-description" : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Caratteristiche</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Superficie</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-area">{property.mq} m²</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bed className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Stanze</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-rooms">{property.stanze}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bath className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Bagni</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-bathrooms">{property.bagni}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Piano</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-floor">{property.piano}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Classe Energetica</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-energy-class">
                    {energyClassMap[property.classeEnergetica] || property.classeEnergetica}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm">Stato</span>
                  </div>
                  <span className="font-semibold text-lg" data-testid="text-status">
                    {statusLabel(property.stato)}
                  </span>
                </div>
              </div>
            </div>

            {property.linkVideo && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Video Tour</h3>
                <div className="max-w-sm">
                  <YouTubeEmbed 
                    videoUrl={property.linkVideo} 
                    title={`Video tour - ${property.titolo}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge 
                    variant={property.tipo === "vendita" ? "default" : "secondary"}
                    data-testid={`badge-type-${property.tipo}`}
                  >
                    {property.tipo === "vendita" ? "Vendita" : "Affitto"}
                  </Badge>
                  {!isAvailable && (
                    <Badge 
                      variant={statusBadgeVariant(property.stato)} 
                      data-testid={`badge-status-${property.stato}`}
                    >
                      {statusLabel(property.stato)}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold mt-2" data-testid="text-price">
                  {formattedPrice}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  asChild
                  data-testid="button-contact"
                >
                  <Link href={`/contatti?ref=immobile&context=${property.id}`}>
                    <Mail className="mr-2 h-5 w-5" />
                    Contattaci
                  </Link>
                </Button>
                
                <div className="text-sm text-muted-foreground text-center pt-2 border-t">
                  <p>Richiedi maggiori informazioni su questo immobile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Contatto */}
        <div className="mt-16">
          <h3 className="text-2xl font-serif font-bold mb-6">Richiedi Informazioni</h3>
          <div className="max-w-2xl">
            <ContactForm source="immobile" contextId={property.id} />
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
                    slug={similar.slug}
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
