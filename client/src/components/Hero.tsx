import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Italian_villa_hero_image_8b4b5e4b.png";

export default function Hero() {
  return (
    <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-start overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-top md:bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Villa italiana di lusso con giardino"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-3xl">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-4 leading-tight">
            Ancora qui quando ti serve
          </h1>
          <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            Quarant'anni al tuo fianco, ben oltre la firma
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/immobili" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="default"
                className="w-full sm:w-auto gap-2 text-lg sm:text-base"
                data-testid="button-discover-properties"
              >
                <Search className="w-6 h-6 sm:w-5 sm:h-5" aria-hidden="true" />
                Scopri le Proprietà
              </Button>
            </Link>
            <Link href="/contatti" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 text-lg sm:text-base bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
                data-testid="button-contact-us"
              >
                Contattaci
                <ArrowRight className="w-6 h-6 sm:w-5 sm:h-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
