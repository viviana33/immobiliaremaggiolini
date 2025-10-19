import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail, Home, Loader2 } from "lucide-react";

export default function Grazie() {
  const [, setLocation] = useLocation();
  const [params, setParams] = useState<{
    lead?: string, 
    source?: string, 
    email?: string,
    blogUpdates?: boolean,
    newListings?: boolean
  }>({});
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<"newListings" | "blogUpdates" | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const lead = searchParams.get("lead") || undefined;
    const source = searchParams.get("source") || undefined;
    const email = searchParams.get("email") || undefined;
    const blogUpdates = searchParams.get("blogUpdates") === "true";
    const newListings = searchParams.get("newListings") === "true";
    
    setParams({ lead, source, email, blogUpdates, newListings });

    // Determina se mostrare l'invito a sottoscrivere l'altra lista in base alle preferenze correnti
    if (lead === "ok" && email) {
      // Se ha solo blogUpdates, offri newListings
      if (blogUpdates && !newListings) {
        setShowUpgrade(true);
        setUpgradeTarget("newListings");
      }
      // Se ha solo newListings, offri blogUpdates
      else if (!blogUpdates && newListings) {
        setShowUpgrade(true);
        setUpgradeTarget("blogUpdates");
      }
      // Se ha entrambi o nessuno dei due, non mostrare upgrade
      else {
        setShowUpgrade(false);
        setUpgradeTarget(null);
      }
    }
  }, []);

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      if (!params.email || !upgradeTarget) {
        throw new Error("Email o target mancante");
      }

      const updateData = {
        email: params.email,
        [upgradeTarget]: true,
      };

      const response = await apiRequest("PUT", "/api/subscribe", updateData);
      return response.json();
    },
    onSuccess: () => {
      setUpgradeSuccess(true);
      setShowUpgrade(false);
    },
  });

  const handleUpgrade = () => {
    upgradeMutation.mutate();
  };

  const getUpgradeText = () => {
    if (upgradeTarget === "newListings") {
      return "le notifiche sui nuovi immobili";
    }
    return "gli aggiornamenti del blog";
  };

  if (params.lead !== "ok") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-muted-foreground">Pagina non trovata</p>
          <Button
            onClick={() => setLocation("/")}
            className="mt-4"
            data-testid="button-home"
          >
            <Home className="mr-2 h-4 w-4" />
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="p-8 md:p-12" data-testid="card-grazie">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/20">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground" data-testid="text-title">
                Grazie!
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
                La tua richiesta è stata ricevuta con successo
              </p>
            </div>

            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20" data-testid="alert-confirmation">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Controlla la tua email!</strong> Ti abbiamo inviato un messaggio di conferma. 
                Clicca sul link per completare l'iscrizione (verifica anche la cartella spam).
              </AlertDescription>
            </Alert>

            {upgradeSuccess && (
              <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20" data-testid="alert-upgrade-success">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Perfetto! Riceverai anche {getUpgradeText()}.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>

        {showUpgrade && params.email && (
          <Card className="p-6 md:p-8 border-primary/30 bg-primary/5" data-testid="card-upgrade">
            <div className="text-center space-y-4">
              <h2 className="font-serif font-semibold text-xl text-foreground" data-testid="text-upgrade-title">
                Vuoi ricevere anche {getUpgradeText()}?
              </h2>
              <p className="text-muted-foreground">
                {upgradeTarget === "newListings" 
                  ? "Sii il primo a scoprire le nuove opportunità immobiliari. Ti avviseremo quando pubblichiamo nuovi immobili in vendita o affitto."
                  : "Ricevi i nostri articoli con consigli, guide e novità dal mondo immobiliare direttamente nella tua casella di posta."}
              </p>
              <Button
                onClick={handleUpgrade}
                disabled={upgradeMutation.isPending}
                className="w-full md:w-auto"
                data-testid="button-upgrade"
              >
                {upgradeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aggiunta in corso...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sì, aggiungi!
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-home"
          >
            <Home className="mr-2 h-4 w-4" />
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
}
