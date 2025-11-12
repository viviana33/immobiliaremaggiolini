import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function PostListTable() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("DELETE", `/api/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Post eliminato",
        description: "Il post è stato eliminato con successo",
      });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'eliminazione del post",
        variant: "destructive",
      });
    },
  });

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagsSet = new Set<string>();
    posts.forEach((post) => {
      if (post.tag && Array.isArray(post.tag)) {
        post.tag.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      const matchesSearch = post.titolo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || post.stato === statusFilter;

      const matchesTag =
        tagFilter === "all" ||
        (post.tag && Array.isArray(post.tag) && post.tag.includes(tagFilter));

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [posts, searchTerm, statusFilter, tagFilter]);

  const handleDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="text-sm font-medium mb-2 block">
            Cerca per titolo
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Cerca articoli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
              data-testid="input-search"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-[180px]">
          <label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
            Stato
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" data-testid="select-status-filter">
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="bozza">Bozza</SelectItem>
              <SelectItem value="pubblicato">Pubblicato</SelectItem>
              <SelectItem value="archiviato">Archiviato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {allTags.length > 0 && (
          <div className="w-[180px]">
            <label htmlFor="tag-filter" className="text-sm font-medium mb-2 block">
              Tag
            </label>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger id="tag-filter" data-testid="select-tag-filter">
                <SelectValue placeholder="Tutti i tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(searchTerm || statusFilter !== "all" || tagFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTagFilter("all");
            }}
            data-testid="button-reset-filters"
          >
            Azzera filtri
          </Button>
        )}
      </div>

      {filteredPosts.length === 0 && posts && posts.length > 0 ? (
        <div className="text-center py-12" data-testid="no-results">
          <p className="text-muted-foreground">Nessun post trovato con i filtri selezionati</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTagFilter("all");
            }}
            className="mt-2"
          >
            Azzera filtri
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-posts">
          <p className="text-muted-foreground">Nessun post trovato</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea il tuo primo articolo cliccando su "Nuovo Articolo"
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titolo</TableHead>
                <TableHead className="w-32">Stato</TableHead>
                <TableHead className="w-48">Pubblicato il</TableHead>
                <TableHead className="w-48">Aggiornato il</TableHead>
                <TableHead className="text-right w-32">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium" data-testid={`text-post-title-${post.id}`}>
                    <div>
                      <div>{post.titolo}</div>
                      {post.tag && post.tag.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {post.tag.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs" data-testid={`badge-tag-${tag}`}>
                              {tag}
                            </Badge>
                          ))}
                          {post.tag.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tag.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(post.stato)} data-testid={`badge-status-${post.id}`}>
                      {getStatusLabel(post.stato)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-post-published-${post.id}`}>
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "dd MMM yyyy, HH:mm", { locale: it })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-post-updated-${post.id}`}>
                    {format(new Date(post.updatedAt), "dd MMM yyyy, HH:mm", { locale: it })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/admin/blog/${post.id}`)}
                        data-testid={`button-edit-post-${post.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post)}
                        disabled={deleteMutation.isPending}
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
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il post "{postToDelete?.titolo}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
