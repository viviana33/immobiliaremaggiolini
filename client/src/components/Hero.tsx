import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import heroImage from "@assets/generated_images/Italian_villa_hero_image_8b4b5e4b.png";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="max-w-2xl">
          <h1 className="font-serif font-bold text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 leading-tight">
            La Tua Casa dei Sogni Ti Aspetta
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Con oltre 20 anni di esperienza, accompagniamo le famiglie nella ricerca della casa perfetta. 
            Un rapporto di fiducia e amicizia che dura nel tempo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-base"
              data-testid="button-discover-properties"
            >
              <Search className="w-5 h-5" />
              Scopri le Proprietà
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
              data-testid="button-contact-us"
            >
              Contattaci
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
