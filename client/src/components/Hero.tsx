import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Italian_villa_hero_image_8b4b5e4b.png";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Villa italiana di lusso con giardino"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="max-w-2xl">
          <h1 className="font-serif font-bold text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 leading-tight">
            Ancora qui quando ti serve
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Quarant'anni al tuo fianco, ben oltre la firma
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/immobili">
              <Button
                size="lg"
                variant="default"
                className="gap-2 text-base"
                data-testid="button-discover-properties"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
                Scopri le Proprietà
              </Button>
            </Link>
            <Link href="/contatti">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
                data-testid="button-contact-us"
              >
                Contattaci
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
