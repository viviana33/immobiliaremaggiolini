import { Award, Heart, TrendingUp, Users } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Award,
      value: "20+",
      label: "Anni di Esperienza",
    },
    {
      icon: Users,
      value: "500+",
      label: "Famiglie Servite",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Clienti Soddisfatti",
    },
    {
      icon: Heart,
      value: "100%",
      label: "Dedizione e Passione",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3 p-6 rounded-md hover-elevate active-elevate-2 transition-all"
              data-testid={`badge-${badge.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <badge.icon className="w-10 h-10 text-primary" />
              <div className="font-serif font-bold text-3xl md:text-4xl text-foreground">
                {badge.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {badge.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
