import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Mail, ExternalLink, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Subscription } from "@shared/schema";
import { usePageMeta } from "@/lib/seo";

type SubscriptionResponse = {
  success: boolean;
  data?: Subscription;
  message?: string;
};

export default function Preferenze() {
  usePageMeta({
    title: 'Preferenze Newsletter',
    description: 'Gestisci le tue preferenze di iscrizione alle newsletter di Immobiliare Maggiolini. Scegli di ricevere notifiche sui nuovi immobili o articoli del blog.',
  });

  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [emailToLoad, setEmailToLoad] = useState<string | null>(null);
  const [blogUpdates, setBlogUpdates] = useState(false);
  const [newListings, setNewListings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const confirmedParam = params.get('confirmed');
    const unsubscribedParam = params.get('unsubscribed');
    
    if (emailParam) {
      setEmail(emailParam);
      setEmailToLoad(emailParam);
    }

    if (confirmedParam === 'true') {
      setSaveStatus("success");
      setErrorMessage("Email confermata con successo!");
    }

    if (unsubscribedParam === 'true') {
      setSaveStatus("success");
      setErrorMessage("Sei stato disiscritto con successo. Non riceverai più email da noi.");
      setIsLoaded(true);
      setBlogUpdates(false);
      setNewListings(false);
    }
  }, [location]);

  const { data, isLoading, error, refetch } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/subscribe', emailToLoad],
    enabled: !!emailToLoad,
    retry: false,
  });

  useEffect(() => {
    if (data?.success && data?.data) {
      setEmail(data.data.email);
      setBlogUpdates(data.data.blogUpdates);
      setNewListings(data.data.newListings);
      setIsLoaded(true);
      
      // Mostra suggerimento se l'utente ha solo una lista attiva
      const hasOnlyOne = (data.data.blogUpdates && !data.data.newListings) || 
                         (!data.data.blogUpdates && data.data.newListings);
      setShowQuickAdd(hasOnlyOne);
      
      // Non sovrascrivere il messaggio di conferma se presente
      const params = new URLSearchParams(window.location.search);
      if (params.get('confirmed') !== 'true') {
        setSaveStatus("idle");
        setErrorMessage("");
      }
    }
  }, [data, location]);

  useEffect(() => {
    if (error && !isLoading) {
      setSaveStatus("error");
      setErrorMessage("Errore nel caricamento delle preferenze. Riprova più tardi.");
      setIsLoaded(false);
    }
  }, [error, isLoading]);

  const loadPreferencesMutation = useMutation({
    mutationFn: async (emailToFetch: string) => {
      const response = await fetch(`/api/subscribe/${encodeURIComponent(emailToFetch)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore nel caricamento delle preferenze");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        setBlogUpdates(data.data.blogUpdates);
        setNewListings(data.data.newListings);
        setIsLoaded(true);
        setSaveStatus("idle");
        setErrorMessage("");
        
        // Mostra suggerimento se l'utente ha solo una lista attiva
        const hasOnlyOne = (data.data.blogUpdates && !data.data.newListings) || 
                           (!data.data.blogUpdates && data.data.newListings);
        setShowQuickAdd(hasOnlyOne);
      }
    },
    onError: (error: any) => {
      setSaveStatus("error");
      setErrorMessage(error?.message || "Iscrizione non trovata. Verifica l'indirizzo email.");
      setIsLoaded(false);
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/subscribe", {
        email,
        blogUpdates,
        newListings,
      });
      return response.json();
    },
    onSuccess: () => {
      setSaveStatus("success");
      setErrorMessage("Preferenze aggiornate con successo!");
      setShowQuickAdd(false);
    },
    onError: (error: any) => {
      setSaveStatus("error");
      setErrorMessage(
        error?.message || "Errore nell'aggiornamento delle preferenze. Riprova più tardi."
      );
    },
  });

  const quickAddMutation = useMutation({
    mutationFn: async (addBlog: boolean) => {
      const response = await apiRequest("PUT", "/api/subscribe", {
        email,
        blogUpdates: addBlog ? true : blogUpdates,
        newListings: addBlog ? newListings : true,
      });
      return response.json();
    },
    onSuccess: (_, addBlog) => {
      if (addBlog) {
        setBlogUpdates(true);
      } else {
        setNewListings(true);
      }
      setSaveStatus("success");
      setErrorMessage("Iscrizione aggiunta con successo!");
      setShowQuickAdd(false);
    },
    onError: (error: any) => {
      setSaveStatus("error");
      setErrorMessage(
        error?.message || "Errore nell'aggiunta dell'iscrizione. Riprova più tardi."
      );
    },
  });

  const handleLoadPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSaveStatus("idle");
      loadPreferencesMutation.mutate(email);
    }
  };

  const handleSavePreferences = () => {
    if (!isLoaded) return;
    setSaveStatus("idle");
    savePreferencesMutation.mutate();
  };

  const getUnsubscribeUrl = () => {
    if (!email) return "#";
    return `https://app.brevo.com/unsubscribe?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Preferenze Newsletter</h1>
        <p className="text-muted-foreground">
          Gestisci le tue preferenze di notifica
        </p>
      </div>

      {saveStatus === "success" && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {errorMessage || "Operazione completata con successo"}
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {isLoaded && showQuickAdd && (
        <Card className="mb-6 border-primary/30 bg-primary/5" data-testid="card-quick-add">
          <CardHeader>
            <CardTitle className="text-lg">Ti interessa anche l'altra lista?</CardTitle>
            <CardDescription>
              {blogUpdates && !newListings && 
                "Puoi ricevere notifiche anche quando aggiungiamo nuovi immobili in vendita o affitto"
              }
              {!blogUpdates && newListings && 
                "Puoi ricevere notifiche anche quando pubblichiamo nuovi articoli sul blog"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => quickAddMutation.mutate(!blogUpdates)}
              disabled={quickAddMutation.isPending}
              className="w-full"
              data-testid="button-aggiungi-altra-lista"
            >
              {quickAddMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiunta in corso...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {blogUpdates && !newListings && "Aggiungi Nuovi Immobili"}
                  {!blogUpdates && newListings && "Aggiungi Nuovi Articoli"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Indirizzo Email</CardTitle>
          <CardDescription>
            Inserisci la tua email per gestire le tue preferenze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoadPreferences} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="la-tua-email@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoaded}
                data-testid="input-email"
              />
            </div>
            {!isLoaded && (
              <Button
                type="submit"
                disabled={loadPreferencesMutation.isPending || !email}
                data-testid="button-carica-preferenze"
              >
                {loadPreferencesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Carica
                  </>
                )}
              </Button>
            )}
            {isLoaded && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLoaded(false);
                  setBlogUpdates(false);
                  setNewListings(false);
                  setSaveStatus("idle");
                  setErrorMessage("");
                }}
                data-testid="button-cambia-email"
              >
                Cambia Email
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isLoaded && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notifiche</CardTitle>
              <CardDescription>
                Scegli quali aggiornamenti desideri ricevere via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nuovi-articoli" className="text-base">
                    Nuovi articoli
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi notifiche quando pubblichiamo nuovi articoli sul blog
                  </p>
                </div>
                <Switch
                  id="nuovi-articoli"
                  checked={blogUpdates}
                  onCheckedChange={setBlogUpdates}
                  data-testid="toggle-nuovi-articoli"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nuovi-immobili" className="text-base">
                    Nuovi immobili
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi notifiche quando aggiungiamo nuovi immobili in vendita o affitto
                  </p>
                </div>
                <Switch
                  id="nuovi-immobili"
                  checked={newListings}
                  onCheckedChange={setNewListings}
                  data-testid="toggle-nuovi-immobili"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3">
              <Button
                variant="outline"
                asChild
                data-testid="link-disiscrizione"
              >
                <a
                  href={getUnsubscribeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Disiscriviti completamente
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                onClick={handleSavePreferences}
                disabled={savePreferencesMutation.isPending}
                data-testid="button-salva-preferenze"
              >
                {savePreferencesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva Preferenze"
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            <p>
              Puoi modificare le tue preferenze in qualsiasi momento tornando su questa pagina.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
