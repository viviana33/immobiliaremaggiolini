import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Preferenze() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Preferenze Newsletter</h1>
        <p className="text-muted-foreground">
          Gestisci le tue preferenze di notifica
        </p>
      </div>

      <Card>
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
            <Switch id="nuovi-articoli" data-testid="toggle-nuovi-articoli" />
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
            <Switch id="nuovi-immobili" data-testid="toggle-nuovi-immobili" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
