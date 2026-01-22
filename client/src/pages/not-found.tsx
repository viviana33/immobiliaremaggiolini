import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    document.title = "Pagina Non Trovata | Immobiliare Maggiolini";
    
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', 'noindex, nofollow');
    
    return () => {
      if (robotsTag) {
        robotsTag.setAttribute('content', 'index, follow');
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">Pagina Non Trovata</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
          
          <Link href="/">
            <a className="mt-4 inline-block text-primary hover:underline">
              Torna alla Home
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
