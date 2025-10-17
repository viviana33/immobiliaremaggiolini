import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminImmobili() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/properties/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Immobile eliminato",
        description: "L'immobile è stato eliminato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione dell'immobile",
        variant: "destructive",
      });
    },
  });

  const getStatoBadge = (stato: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      disponibile: "default",
      riservato: "secondary",
      venduto: "destructive",
      affittato: "destructive",
    };
    return (
      <Badge variant={variants[stato] || "default"} data-testid={`badge-stato-${stato}`}>
        {stato.charAt(0).toUpperCase() + stato.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento immobili...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestione Immobili</h1>
            <p className="text-muted-foreground">
              Gestisci il catalogo degli immobili
            </p>
          </div>
        </div>
        <Button
          onClick={() => setLocation("/admin/immobili/nuovo")}
          data-testid="button-nuovo-immobile"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Immobile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Immobili</CardTitle>
        </CardHeader>
        <CardContent>
          {!properties || properties.length === 0 ? (
            <div className="text-center py-12" data-testid="text-nessun-immobile">
              <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nessun immobile presente</p>
              <p className="text-muted-foreground mb-6">
                Inizia aggiungendo il primo immobile
              </p>
              <Button
                onClick={() => setLocation("/admin/immobili/nuovo")}
                data-testid="button-aggiungi-primo"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi il primo immobile
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prezzo</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                      <TableCell className="font-medium" data-testid={`text-titolo-${property.id}`}>
                        {property.titolo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-tipo-${property.id}`}>
                          {property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-prezzo-${property.id}`}>
                        € {parseFloat(property.prezzo).toLocaleString("it-IT")}
                      </TableCell>
                      <TableCell data-testid={`text-zona-${property.id}`}>
                        {property.zona}
                      </TableCell>
                      <TableCell>{getStatoBadge(property.stato)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setLocation(`/admin/immobili/${property.id}`)
                            }
                            data-testid={`button-modifica-${property.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-elimina-${property.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata. L'immobile
                                  e tutte le sue immagini verranno eliminate
                                  permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-testid="button-annulla-elimina">
                                  Annulla
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(property.id)}
                                  data-testid="button-conferma-elimina"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
