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
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function PostListTable() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-posts">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Caricamento post...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive" data-testid="error-posts">
        <p className="font-medium">Errore nel caricamento dei post</p>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : "Si è verificato un errore imprevisto"}
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-posts">
        <p className="text-muted-foreground">Nessun post trovato</p>
        <p className="text-sm text-muted-foreground mt-1">
          Crea il tuo primo articolo cliccando su "Nuovo Articolo"
        </p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pubblicato":
        return "default";
      case "bozza":
        return "secondary";
      case "archiviato":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pubblicato":
        return "Pubblicato";
      case "bozza":
        return "Bozza";
      case "archiviato":
        return "Archiviato";
      default:
        return status;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Titolo</TableHead>
          <TableHead className="w-32">Stato</TableHead>
          <TableHead className="w-48">Aggiornato il</TableHead>
          <TableHead className="text-right w-32">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-mono text-xs text-muted-foreground" data-testid={`text-post-id-${post.id}`}>
              {post.id.slice(0, 8)}...
            </TableCell>
            <TableCell className="font-medium" data-testid={`text-post-title-${post.id}`}>
              {post.titolo}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(post.stato)} data-testid={`badge-status-${post.id}`}>
                {getStatusLabel(post.stato)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground" data-testid={`text-post-date-${post.id}`}>
              {format(new Date(post.updatedAt), "dd MMM yyyy, HH:mm", { locale: it })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  data-testid={`button-edit-post-${post.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  data-testid={`button-delete-post-${post.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
