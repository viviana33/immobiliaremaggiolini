import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
import { MarkdownEditor } from "./MarkdownEditor";
import { ImageUploader } from "./ImageUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, type Post } from "@shared/schema";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PostFormProps {
  postId?: string;
}

const formSchema = insertPostSchema.extend({
  titolo: z.string().min(1, "Il titolo è obbligatorio"),
  sottotitolo: z.string().optional(),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  cover: z.string().optional(),
  contenuto: z.string().min(1, "Il contenuto è obbligatorio"),
  readingTimeMin: z.number().optional(),
  tag: z.array(z.string()).optional(),
  categoria: z.string().optional(),
  autore: z.string().min(1, "L'autore è obbligatorio"),
  stato: z.enum(["bozza", "pubblicato", "archiviato"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Utility function to calculate reading time from markdown content
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images first
    .replace(/\[.*?\]\(.*?\)/g, "") // Remove links
    .replace(/[#*`\[\]()]/g, "") // Then remove other markdown syntax
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function PostForm({ postId }: PostFormProps) {
  const isEdit = Boolean(postId);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titolo: "",
      sottotitolo: "",
      slug: "",
      cover: "",
      contenuto: "",
      readingTimeMin: 0,
      tag: [],
      categoria: "",
      autore: "Admin",
      stato: "bozza",
      metaTitle: "",
      metaDescription: "",
    },
  });

  // Fetch existing post data when editing
  const { data: existingPost, isLoading: isLoadingPost } = useQuery<Post>({
    queryKey: [`/api/admin/posts/${postId}`],
    enabled: isEdit && !!postId,
  });

  // Load existing post data into form
  useEffect(() => {
    if (existingPost) {
      form.reset({
        titolo: existingPost.titolo,
        sottotitolo: existingPost.sottotitolo || "",
        slug: existingPost.slug,
        cover: existingPost.cover || "",
        contenuto: existingPost.contenuto,
        readingTimeMin: existingPost.readingTimeMin || 0,
        tag: existingPost.tag || [],
        categoria: existingPost.categoria || "",
        autore: existingPost.autore,
        stato: existingPost.stato,
        metaTitle: existingPost.metaTitle || "",
        metaDescription: existingPost.metaDescription || "",
      });
    }
  }, [existingPost, form]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/admin/posts", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }
      return res.json();
    },
    onSuccess: (data: Post) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Post creato",
        description: data.stato === "pubblicato" 
          ? "Il post è stato pubblicato con successo" 
          : "Il post è stato salvato come bozza",
      });
      // Redirect to edit page after creation
      setLocation(`/admin/blog/${data.id}`);
    },
    onError: (error: any) => {
      // Set field-specific errors if they exist
      if (error.errors) {
        Object.keys(error.errors).forEach((field) => {
          form.setError(field as any, {
            type: "manual",
            message: error.errors[field],
          });
        });
      }
      
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Errore nella creazione del post",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${postId}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }
      return res.json();
    },
    onSuccess: (data: Post) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}`] });
      toast({
        title: "Post aggiornato",
        description: data.stato === "pubblicato" 
          ? "Il post è stato pubblicato con successo" 
          : "Il post è stato salvato come bozza",
      });
    },
    onError: (error: any) => {
      // Set field-specific errors if they exist
      if (error.errors) {
        Object.keys(error.errors).forEach((field) => {
          form.setError(field as any, {
            type: "manual",
            message: error.errors[field],
          });
        });
      }
      
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Errore nell'aggiornamento del post",
      });
    },
  });

  // Handle save draft
  const handleSaveDraft = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    const dataToSave = { ...formData, stato: "bozza" as const };

    if (isEdit) {
      updatePostMutation.mutate(dataToSave);
    } else {
      createPostMutation.mutate(dataToSave);
    }
  };

  // Validate publish requirements
  const validatePublishRequirements = (): boolean => {
    const formData = form.getValues();
    let hasErrors = false;

    // Check title
    if (!formData.titolo || formData.titolo.trim() === "") {
      form.setError("titolo", {
        type: "manual",
        message: "Il titolo è obbligatorio per la pubblicazione",
      });
      hasErrors = true;
    }

    // Check slug
    if (!formData.slug || formData.slug.trim() === "") {
      form.setError("slug", {
        type: "manual",
        message: "Lo slug è obbligatorio per la pubblicazione",
      });
      hasErrors = true;
    }

    // Check content
    if (!formData.contenuto || formData.contenuto.trim() === "") {
      form.setError("contenuto", {
        type: "manual",
        message: "Il contenuto è obbligatorio per la pubblicazione",
      });
      hasErrors = true;
    }

    // Check cover image
    if (!formData.cover || formData.cover.trim() === "") {
      form.setError("cover", {
        type: "manual",
        message: "L'immagine di copertina è obbligatoria per la pubblicazione",
      });
      hasErrors = true;
    }

    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Impossibile pubblicare",
        description: "Compila tutti i campi obbligatori prima di pubblicare",
      });
    }

    return !hasErrors;
  };

  // Handle publish button click - show confirmation dialog
  const handlePublishClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Check publish requirements
    if (!validatePublishRequirements()) {
      return;
    }

    // Show confirmation dialog
    setShowPublishDialog(true);
  };

  // Handle confirmed publish
  const handleConfirmPublish = () => {
    const formData = form.getValues();
    const dataToSave = { ...formData, stato: "pubblicato" as const };

    if (isEdit) {
      updatePostMutation.mutate(dataToSave);
    } else {
      createPostMutation.mutate(dataToSave);
    }
    
    setShowPublishDialog(false);
  };

  const isSaving = createPostMutation.isPending || updatePostMutation.isPending;

  // Autosave functionality - save draft every 10 seconds when editing
  useEffect(() => {
    if (!isEdit || !postId) return;

    const autosaveInterval = setInterval(async () => {
      // Only autosave if form has changes (is dirty)
      if (!form.formState.isDirty) return;

      const formData = form.getValues();
      
      // Validate silently without showing errors to user
      const validationResult = formSchema.safeParse(formData);
      if (!validationResult.success) return; // Skip autosave if invalid

      const dataToSave = { ...formData, stato: "bozza" as const };

      // Silent autosave (no toast notification)
      try {
        await apiRequest("PUT", `/api/admin/posts/${postId}`, dataToSave);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${postId}`] });
        // Reset form dirty state after successful autosave
        form.reset(formData);
      } catch (error) {
        // Silently fail autosave - user can still manually save
        console.error("Autosave failed:", error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(autosaveInterval);
  }, [isEdit, postId, form, queryClient]);

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "titolo") {
        const slug = value.titolo ? generateSlug(value.titolo) : "";
        form.setValue("slug", slug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Calculate reading time from content
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "contenuto") {
        const time = value.contenuto ? calculateReadingTime(value.contenuto) : 0;
        setReadingTime(time);
        form.setValue("readingTimeMin", time);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Show loading state while fetching existing post
  if (isEdit && isLoadingPost) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-post-form">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Caricamento post...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="titolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titolo *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inserisci il titolo dell'articolo"
                    data-testid="input-title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sottotitolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sottotitolo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inserisci un sottotitolo (opzionale)"
                    data-testid="input-subtitle"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="slug-articolo"
                    data-testid="input-slug"
                    readOnly
                    className="bg-muted"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Lo slug verrà generato automaticamente dal titolo</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Immagine di copertina *</FormLabel>
                <FormControl>
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Obbligatoria per la pubblicazione (max 8MB)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contenuto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contenuto *</FormLabel>
                <FormControl>
                  <MarkdownEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                {readingTime > 0 && (
                  <FormDescription className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-reading-time">
                      Tempo di lettura stimato: {readingTime} {readingTime === 1 ? 'minuto' : 'minuti'}
                    </span>
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci la categoria"
                      data-testid="input-category"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Seleziona stato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bozza">Bozza</SelectItem>
                      <SelectItem value="pubblicato">Pubblicato</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input
                    placeholder="tag1, tag2, tag3"
                    data-testid="input-tags"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) => {
                      const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                      field.onChange(tags);
                    }}
                  />
                </FormControl>
                <FormDescription>Separa i tag con virgole</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO</h3>
            
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Titolo SEO (opzionale)"
                      data-testid="input-seo-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrizione SEO (opzionale)"
                      data-testid="textarea-seo-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            data-testid="button-save-draft"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva Bozza
          </Button>
          <Button 
            type="button"
            data-testid="button-publish"
            onClick={handlePublishClick}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pubblica
          </Button>
        </div>
      </form>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent data-testid="dialog-publish-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma pubblicazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler pubblicare questo post? Il post sarà visibile pubblicamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-publish">Annulla</AlertDialogCancel>
            <AlertDialogAction 
              data-testid="button-confirm-publish"
              onClick={handleConfirmPublish}
            >
              Pubblica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
