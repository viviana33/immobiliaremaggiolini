import { Link, useLocation } from "wouter";
import { Home, Building2, FileText, Users, Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";
import logoImg from "@assets/Logo Geometrico su Fondo Rosso_1761237729319.png";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/proprieta", label: "Proprietà", icon: Building2 },
    { path: "/blog", label: "Blog", icon: FileText },
    { path: "/chi-siamo", label: "Chi Siamo", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#600005' }}>
      <nav className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all cursor-pointer">
              <img src={logoImg} alt="Immobiliare Maggiolini" className="w-10 h-10 object-contain" aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm text-white" style={{ fontFamily: "'Michroma', sans-serif", fontWeight: 400, letterSpacing: '0.08em' }}>
                  Immobiliare
                </span>
                <span className="text-sm text-white" style={{ fontFamily: "'Michroma', sans-serif", fontWeight: 400, letterSpacing: '0.08em' }}>
                  MAGGIOLINI
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className="gap-2 text-white/90 hover:text-white"
                  style={location === item.path ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link href="/contatti">
              <Button variant="default" className="gap-2 ml-2" data-testid="button-contact">
                <Phone className="w-4 h-4" aria-hidden="true" />
                Contatti
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={mobileMenuOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-white/90 hover:text-white"
                    style={location === item.path ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link href="/contatti">
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Contatti
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
