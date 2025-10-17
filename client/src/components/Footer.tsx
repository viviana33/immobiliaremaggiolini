import { Link } from "wouter";
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7 text-primary" />
              <span className="font-serif font-bold text-xl text-foreground">
                Immobiliare Maggiolini
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Da oltre 20 anni al vostro fianco per trovare la casa dei vostri sogni. 
              Un rapporto di fiducia che dura nel tempo.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-social-facebook">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-social-instagram">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-social-linkedin">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg text-foreground">Link Veloci</h3>
            <ul className="space-y-2">
              {[
                { path: "/", label: "Home" },
                { path: "/proprieta", label: "Proprietà" },
                { path: "/blog", label: "Blog" },
                { path: "/chi-siamo", label: "Chi Siamo" },
              ].map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg text-foreground">Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Via Roma 123, 20121 Milano</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+39 02 1234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@maggiolini.it</span>
              </li>
            </ul>
            <div className="pt-2 text-sm text-muted-foreground">
              <p className="font-semibold">Orari:</p>
              <p>Lun-Ven: 9:00 - 19:00</p>
              <p>Sab: 9:00 - 13:00</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg text-foreground">Resta Aggiornato</h3>
            <p className="text-muted-foreground text-sm">
              Iscriviti alla newsletter per ricevere le ultime novità e proprietà.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter"
              />
              <Button type="submit" className="w-full" data-testid="button-newsletter">
                Iscriviti
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4 justify-center">
              <span>🏆 20+ anni di esperienza</span>
              <span>✓ Oltre 500 famiglie servite</span>
              <span>💚 Sempre al tuo fianco</span>
            </div>
            <p>© 2024 Immobiliare Maggiolini. Tutti i diritti riservati.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
