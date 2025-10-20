import { Card } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
  quote?: string;
  email?: string;
  phone?: string;
}

export default function TeamMember({
  name,
  role,
  image,
  quote,
  email,
  phone,
}: TeamMemberProps) {
  return (
    <Card className="overflow-hidden p-6 space-y-4 hover-elevate active-elevate-2 transition-all" data-testid={`card-team-${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-32 h-32 rounded-full object-cover border-4 border-secondary"
          />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-serif font-semibold text-xl text-foreground" data-testid="text-team-name">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm">{role}</p>
        {quote && (
          <p className="font-serif text-sm text-foreground/80 italic pt-2">
            "{quote}"
          </p>
        )}
      </div>
      {(email || phone) && (
        <div className="pt-3 border-t border-border space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
                {phone}
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
