import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import apartmentImage from "@assets/generated_images/Apartment_interior_property_image_66b8a52c.png";
import countrysideImage from "@assets/generated_images/Countryside_property_image_dddb1072.png";
import penthouseImage from "@assets/generated_images/Penthouse_terrace_property_image_6980bf5a.png";

export default function Proprieta() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const properties = [
    {
      id: "1",
      title: "Elegante Appartamento Centro",
      location: "Milano, Porta Nuova",
      price: "€ 450.000",
      image: apartmentImage,
      type: "vendita" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
    },
    {
      id: "2",
      title: "Villa con Giardino",
      location: "Monza, Centro Storico",
      price: "€ 2.800/mese",
      image: countrysideImage,
      type: "affitto" as const,
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
    },
    {
      id: "3",
      title: "Attico con Terrazza Panoramica",
      location: "Como, Lungolago",
      price: "€ 890.000",
      image: penthouseImage,
      type: "vendita" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
    },
    {
      id: "4",
      title: "Bilocale Moderno",
      location: "Milano, Navigli",
      price: "€ 1.200/mese",
      image: apartmentImage,
      type: "affitto" as const,
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
    },
    {
      id: "5",
      title: "Casa Indipendente",
      location: "Brianza, Residenziale",
      price: "€ 650.000",
      image: countrysideImage,
      type: "vendita" as const,
      bedrooms: 5,
      bathrooms: 3,
      area: 250,
    },
    {
      id: "6",
      title: "Loft Industriale",
      location: "Milano, Isola",
      price: "€ 520.000",
      image: penthouseImage,
      type: "vendita" as const,
      bedrooms: 2,
      bathrooms: 2,
      area: 110,
    },
  ];

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
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-price-filter">
                <SelectValue placeholder="Prezzo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Prezzi</SelectItem>
                <SelectItem value="low">Fino a € 300.000</SelectItem>
                <SelectItem value="medium">€ 300.000 - € 600.000</SelectItem>
                <SelectItem value="high">Oltre € 600.000</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" data-testid="button-more-filters">
              <SlidersHorizontal className="w-4 h-4" />
              Filtri
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{properties.length}</span> proprietà
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" data-testid="button-load-more">
              Carica Altre Proprietà
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
