import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { MapPin, Bed, Bath, Maximize, Info } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  image?: string;
  type: "vendita" | "affitto";
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  annuncio?: string | null;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop";

export default function PropertyCard({
  id,
  title,
  location,
  price,
  image = DEFAULT_IMAGE,
  type,
  bedrooms = 2,
  bathrooms = 1,
  area,
  annuncio,
}: PropertyCardProps) {
  return (
    <Link href={`/immobile/${id}`} data-testid={`link-property-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <Card
        className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group"
        data-testid={`card-property-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={`${title} - immagine 1`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            loading="lazy"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={type === "vendita" ? "default" : "secondary"} className="text-sm font-semibold">
              {type === "vendita" ? "Vendita" : "Affitto"}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-lg">
              {price}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {annuncio && (
            <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 text-yellow-900 dark:text-yellow-200 px-3 py-2 rounded-md text-sm" data-testid="text-annuncio">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="flex-1">{annuncio}</p>
            </div>
          )}
          <h3 className="font-serif font-semibold text-xl text-foreground line-clamp-1" data-testid="text-property-title">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bed className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm" aria-label={`${bedrooms} camere da letto`}>{bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bath className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm" aria-label={`${bathrooms} bagni`}>{bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Maximize className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm" aria-label={`${area} metri quadrati`}>{area}m²</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
