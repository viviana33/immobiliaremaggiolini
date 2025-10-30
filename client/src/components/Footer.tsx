import { Link } from "wouter";
import { Building2, Mail, Phone, MapPin, Instagram, Lock, Shield, BadgeCheck, Star } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/Logo Geometrico su Fondo Rosso_1761237729319.png";

export default function Footer() {

  return (
    <footer style={{ backgroundColor: '#600005' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Immobiliare Maggiolini" className="w-10 h-10 object-contain" />
              <span className="text-sm text-white" style={{ fontFamily: "'Michroma', sans-serif", fontWeight: 400, letterSpacing: '0.08em' }}>
                Immobiliare MAGGIOLINI
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Da oltre 20 anni al vostro fianco per trovare la casa dei vostri sogni. 
              Un rapporto di fiducia che dura nel tempo.
            </p>
            <div className="flex gap-3 pt-2">
              <a 
                href="https://www.instagram.com/immobiliaremaggiolini?igsh=NGx4ZHpwbWlscDV2" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Seguici su Instagram"
              >
                <Button variant="ghost" size="icon" className="hover-elevate text-white" data-testid="button-social-instagram">
                  <Instagram className="w-5 h-5" />
                </Button>
              </a>
              <a 
                href="https://www.facebook.com/immobiliaremaggiolini" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Seguici su Facebook"
              >
                <Button variant="ghost" size="icon" className="hover-elevate text-white" data-testid="button-social-facebook">
                  <SiFacebook className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm text-white" style={{ fontFamily: "'Michroma', sans-serif", fontWeight: 400, letterSpacing: '0.08em' }}>Link Veloci</h3>
            <ul className="space-y-2">
              {[
                { path: "/", label: "Home", testId: "link-footer-home" },
                { path: "/proprieta", label: "Proprietà", testId: "link-footer-proprieta" },
                { path: "/blog", label: "Blog", testId: "link-footer-blog" },
                { path: "/chi-siamo", label: "Chi Siamo", testId: "link-footer-chi-siamo" },
                { path: "/privacy", label: "Privacy Policy", testId: "link-footer-privacy" },
              ].map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="text-white/80 hover:text-white text-sm transition-colors cursor-pointer" data-testid={link.testId}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm text-white" style={{ fontFamily: "'Michroma', sans-serif", fontWeight: 400, letterSpacing: '0.08em' }}>Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Via Paolo Castelnovo, 14, 20015 Parabiago (MI)</span>
              </li>
              <li className="flex items-center gap-2 text-white/80 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+39 02 1234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-white/80 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@maggiolini.it</span>
              </li>
            </ul>
            <div className="pt-2 text-sm text-white/80">
              <p className="font-semibold">Orari:</p>
              <p>Lun-Ven 9:30-13:00/14:30-18:30</p>
            </div>
          </div>

        </div>

        <div className="border-t border-white/20 pt-8 pb-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            
            {/* Badge 1: SSL Sicuro */}
            <div className="flex items-center gap-2 text-sm text-white/80" data-testid="badge-ssl">
              <Lock className="w-5 h-5 text-[#8B9D83]" />
              <span>Connessione Sicura SSL</span>
            </div>
            
            {/* Badge 2: GDPR */}
            <Link 
              href="/privacy"
            >
              <div className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors cursor-pointer" data-testid="badge-gdpr">
                <Shield className="w-5 h-5 text-[#C87D6C]" />
                <span>GDPR Compliant</span>
              </div>
            </Link>
            
            {/* Badge 3: Agenzia Verificata */}
            <div className="flex items-center gap-2 text-sm text-white/80" data-testid="badge-verified">
              <BadgeCheck className="w-5 h-5 text-[#8B9D83]" />
              <div className="flex flex-col">
                <span className="font-semibold">Agenzia Verificata</span>
                <span className="text-xs">20+ anni di esperienza</span>
              </div>
            </div>
            
            {/* Badge 4: Google Reviews */}
            <div className="flex items-center gap-2 text-sm text-white/80" data-testid="badge-reviews">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <div className="flex flex-col">
                <span className="font-semibold">4.9/5 su Google</span>
                <span className="text-xs">50+ recensioni</span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="pt-6 text-center border-t border-white/20">
          <p className="text-sm text-white/70">© 2024 Immobiliare Maggiolini. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
