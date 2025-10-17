import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

// TODO: Implementare interfaccia BlogPost e tipizzazione
// TODO: Implementare useQuery per caricare i post
// TODO: Implementare useMutation per eliminare i post
// TODO: Implementare AlertDialog per conferma eliminazione

export function PostListTable() {
  return (
    <div>
      <p className="text-muted-foreground mb-4">
        TODO: Implementare tabella con elenco articoli
      </p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Autore</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium" data-testid="text-post-title">
              Articolo di esempio
            </TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>
              <Badge variant="secondary">Generale</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="default">Pubblicato</Badge>
            </TableCell>
            <TableCell>17/10/2025</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-edit-post"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-delete-post"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
