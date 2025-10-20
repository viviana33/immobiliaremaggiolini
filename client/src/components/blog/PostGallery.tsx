import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import type { PostImage } from "@shared/schema";

interface PostGalleryProps {
  postId: string;
}

export function PostGallery({ postId }: PostGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<PostImage[]>({
    queryKey: [`/api/admin/posts/${postId}/images`],
    enabled: !!postId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(`/api/admin/posts/${postId}/images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Errore nel caricamento");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}/images`] });
      toast({
        title: "Immagini caricate",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/posts/images/${imageId}`, {});
      if (!res.ok) {
        throw new Error("Errore nell'eliminazione");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}/images`] });
      toast({
        title: "Immagine eliminata",
        description: "L'immagine è stata rimossa dalla galleria",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare l'immagine",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (imageOrders: { id: string; position: number }[]) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${postId}/images/reorder`, {
        imageOrders,
      });
      if (!res.ok) {
        throw new Error("Errore nel riordinamento");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}/images`] });
      toast({
        title: "Ordine aggiornato",
        description: "L'ordine delle immagini è stato aggiornato",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare l'ordine",
      });
    },
  });

  const restoreImagesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/posts/${postId}/images/restore`);
      if (!res.ok) {
        throw new Error("Errore nel ripristino");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}/images`] });
      toast({
        title: "Immagini ripristinate",
        description: data.message || "Le immagini sono state ripristinate con successo",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel ripristino delle immagini",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      toast({
        variant: "destructive",
        title: "Limite superato",
        description: `Puoi avere massimo 10 immagini. Attualmente ne hai ${images.length}.`,
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(files);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((img, idx) => ({
      id: img.id,
      position: idx,
    }));

    reorderMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Caricamento galleria...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Galleria Immagini</h3>
          <p className="text-sm text-muted-foreground">
            {images.length}/10 immagini (opzionale)
          </p>
        </div>
        <div className="flex gap-2">
          {images.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => restoreImagesMutation.mutate()}
              disabled={restoreImagesMutation.isPending}
              data-testid="button-ripristina-immagini-post"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${restoreImagesMutation.isPending ? 'animate-spin' : ''}`} />
              {restoreImagesMutation.isPending ? "Ripristino..." : "Ripristina"}
            </Button>
          )}
          {images.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              data-testid="button-add-images"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Caricamento..." : "Aggiungi Immagini"}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-image-upload"
      />

      {images.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="text-muted-foreground">
            <Upload className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Nessuna immagine nella galleria</p>
            <p className="text-xs mt-2">
              La galleria è opzionale. Puoi aggiungere fino a 10 immagini.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="overflow-hidden group relative">
              <div className="aspect-square relative">
                <img
                  src={image.hotUrl}
                  alt={`Immagine ${index + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`image-gallery-${index}`}
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => moveImage(index, "left")}
                    disabled={index === 0 || reorderMutation.isPending}
                    className="h-8 w-8"
                    data-testid={`button-move-left-${index}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(image.id)}
                    disabled={deleteMutation.isPending}
                    className="h-8 w-8"
                    data-testid={`button-delete-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => moveImage(index, "right")}
                    disabled={index === images.length - 1 || reorderMutation.isPending}
                    className="h-8 w-8"
                    data-testid={`button-move-right-${index}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
