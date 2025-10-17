import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, Home, FileText, Users } from "lucide-react";
import { useLocation } from "wouter";

function AdminDashboardContent() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Area Amministrativa</h1>
            <p className="text-muted-foreground">Gestisci il tuo sito immobiliare</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/immobili")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Immobili</CardTitle>
                  <CardDescription>Gestisci proprietà</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aggiungi, modifica o elimina immobili dal catalogo
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Blog</CardTitle>
                  <CardDescription>Gestisci articoli</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prossimamente disponibile
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Lead</CardTitle>
                  <CardDescription>Gestisci contatti</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prossimamente disponibile
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Benvenuto Admin</CardTitle>
                <CardDescription>
                  Hai effettuato l'accesso con successo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Usa il pannello qui sopra per navigare tra le diverse sezioni amministrative.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
