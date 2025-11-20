import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { insertPropertySchema, type Property, type PropertyImage } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPropertySchema.extend({
  piano: z.string().min(1, "Piano richiesto"),
  mq: z.coerce.number().min(1, "Metratura minima 1 mq"),
  stanze: z.coerce.number().min(0, "Numero stanze non valido"),
  bagni: z.coerce.number().min(0, "Numero bagni non valido"),
  prezzo: z.string().min(1, "Prezzo richiesto"),
});

type FormData = z.infer<typeof formSchema>;

interface PropertyWithImages extends Property {
  images?: PropertyImage[];
}

export default function AdminImmobileForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isEdit = Boolean(id);

  const { data: property, isLoading } = useQuery<PropertyWithImages>({
    queryKey: ["/api/admin/properties", id],
    enabled: isEdit,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      citta: "",
      titolo: "",
      descrizione: "",
      prezzo: "",
      tipo: "vendita",
      mq: 0,
      stanze: 0,
      bagni: 0,
      piano: "Pianoterra",
      classeEnergetica: "G",
      zona: "",
      stato: "disponibile",
      linkVideo: "",
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        slug: property.slug,
        citta: property.citta,
        titolo: property.titolo,
        descrizione: property.descrizione,
        prezzo: String(property.prezzo),
        tipo: property.tipo,
        mq: property.mq,
        stanze: property.stanze,
        bagni: property.bagni,
        piano: property.piano,
        classeEnergetica: property.classeEnergetica,
        zona: property.zona,
        stato: property.stato,
        linkVideo: property.linkVideo || "",
      });
      if (property.images) {
        setExistingImages(property.images);
      }
    }
  }, [property, form]);

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value.toString());
        }
      });

      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Errore nella creazione");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Immobile creato",
        description: "L'immobile è stato creato con successo",
      });
      setLocation("/admin/immobili");
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nella creazione dell'immobile",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value.toString());
        }
      });

      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        body: data,
      });

      if (!res.ok) throw new Error("Errore nell'aggiornamento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", id] });
      toast({
        title: "Immobile aggiornato",
        description: "L'immobile è stato aggiornato con successo",
      });
      setLocation("/admin/immobili");
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'immobile",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/properties/${id}/images/${imageId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", id] });
      toast({
        title: "Immagine eliminata",
        description: "L'immagine è stata eliminata con successo",
      });
    },
  });

  const restoreImagesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/properties/${id}/images/restore`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", id] });
      toast({
        title: "Immagini ripristinate",
        description: data.message || "Le immagini sono state ripristinate con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nel ripristino delle immagini",
        variant: "destructive",
      });
    },
  });

  const reorderImagesMutation = useMutation({
    mutationFn: async (imageOrders: { id: string; position: number }[]) => {
      const res = await apiRequest("PUT", `/api/admin/properties/${id}/images/reorder`, {
        imageOrders,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", id] });
      toast({
        title: "Ordine aggiornato",
        description: "L'ordine delle immagini è stato aggiornato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'ordine",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = selectedFiles.length + existingImages.length + files.length;

    if (totalFiles > 15) {
      toast({
        title: "Troppi file",
        description: "Puoi caricare massimo 15 immagini totali",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSelectedFile = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedFiles.length) return;

    const reordered = [...selectedFiles];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setSelectedFiles(reordered);
  };

  const removeExistingImage = (imageId: string) => {
    deleteImageMutation.mutate(imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...existingImages];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    setExistingImages(reordered);
    setDraggedIndex(null);

    const updates = reordered.map((img, idx) => ({
      id: img.id,
      position: idx,
    }));

    reorderImagesMutation.mutate(updates);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= existingImages.length) return;

    const reordered = [...existingImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setExistingImages(reordered);

    const updates = reordered.map((img, idx) => ({
      id: img.id,
      position: idx,
    }));

    reorderImagesMutation.mutate(updates);
  };

  const onSubmit = (data: FormData) => {
    console.log('[AdminImmobileForm] onSubmit called with data:', data);
    console.log('[AdminImmobileForm] isEdit:', isEdit, 'id:', id);
    console.log('[AdminImmobileForm] selectedFiles:', selectedFiles);
    console.log('[AdminImmobileForm] existingImages:', existingImages);
    console.log('[AdminImmobileForm] form.formState.isValid:', form.formState.isValid);
    console.log('[AdminImmobileForm] form.formState.errors:', form.formState.errors);
    
    if (isEdit) {
      console.log('[AdminImmobileForm] Calling updateMutation');
      updateMutation.mutate(data);
    } else {
      console.log('[AdminImmobileForm] Calling createMutation');
      createMutation.mutate(data);
    }
  };

  const onError = (errors: any) => {
    console.error('[AdminImmobileForm] Form validation errors:', errors);
    console.error('[AdminImmobileForm] Full form state:', form.formState);
  };

  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/admin/immobili")}
          data-testid="button-indietro"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Modifica Immobile" : "Nuovo Immobile"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Modifica i dati dell'immobile"
              : "Inserisci i dati del nuovo immobile"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Hidden slug field for edit mode */}
          {isEdit && (
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Principali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="citta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Città</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Es: Milano" data-testid="input-citta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titolo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Es: Appartamento centro storico" data-testid="input-titolo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descrizione"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descrizione dettagliata dell'immobile..."
                        rows={6}
                        data-testid="input-descrizione"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo">
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendita">Vendita</SelectItem>
                          <SelectItem value="affitto">Affitto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prezzo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezzo (€)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="150000"
                          data-testid="input-prezzo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dettagli Tecnici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="mq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Superficie (mq)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="80"
                          data-testid="input-mq"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stanze"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stanze</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="3"
                          data-testid="input-stanze"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bagni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bagni</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="2"
                          data-testid="input-bagni"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="piano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Piano</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-piano">
                            <SelectValue placeholder="Seleziona piano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pianoterra">Pianoterra</SelectItem>
                          <SelectItem value="Rialzato">Rialzato</SelectItem>
                          {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classeEnergetica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe Energetica</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-classe-energetica">
                            <SelectValue placeholder="Seleziona classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"].map((classe) => (
                            <SelectItem key={classe} value={classe}>
                              {classe}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posizione e Stato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zona"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Es: Centro Storico"
                          data-testid="input-zona"
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-stato">
                            <SelectValue placeholder="Seleziona stato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="disponibile">Disponibile</SelectItem>
                          <SelectItem value="riservato">Riservato</SelectItem>
                          <SelectItem value="venduto">Venduto</SelectItem>
                          <SelectItem value="affittato">Affittato</SelectItem>
                          <SelectItem value="archiviato">Archiviato</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="linkVideo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link YouTube (opzionale)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://www.youtube.com/watch?v=..."
                        data-testid="input-link-video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Immagini (max 15)</CardTitle>
              {isEdit && existingImages.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => restoreImagesMutation.mutate()}
                  disabled={restoreImagesMutation.isPending}
                  data-testid="button-ripristina-immagini"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${restoreImagesMutation.isPending ? 'animate-spin' : ''}`} />
                  {restoreImagesMutation.isPending ? "Ripristino..." : "Ripristina immagini"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Immagini esistenti ({existingImages.length}) - Trascina per riordinare
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div
                        key={img.id}
                        className={`relative group cursor-move ${
                          draggedIndex === index ? "opacity-50" : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        data-testid={`image-container-${index}`}
                      >
                        <img
                          src={img.urlHot}
                          alt="Immagine immobile"
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={() => moveImage(index, "left")}
                            disabled={index === 0 || reorderImagesMutation.isPending}
                            className="h-8 w-8"
                            data-testid={`button-move-left-${index}`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeExistingImage(img.id)}
                            disabled={deleteImageMutation.isPending}
                            className="h-8 w-8"
                            data-testid={`button-rimuovi-immagine-${img.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={() => moveImage(index, "right")}
                            disabled={index === existingImages.length - 1 || reorderImagesMutation.isPending}
                            className="h-8 w-8"
                            data-testid={`button-move-right-${index}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {img.archiviato && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Archiviata
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nuove immagini da caricare ({selectedFiles.length}) - Usa le frecce per riordinare
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group" data-testid={`file-container-${index}`}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={() => moveSelectedFile(index, "left")}
                            disabled={index === 0}
                            className="h-8 w-8"
                            data-testid={`button-move-file-left-${index}`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeSelectedFile(index)}
                            className="h-8 w-8"
                            data-testid={`button-rimuovi-file-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={() => moveSelectedFile(index, "right")}
                            disabled={index === selectedFiles.length - 1}
                            className="h-8 w-8"
                            data-testid={`button-move-file-right-${index}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" asChild>
                    <span className="cursor-pointer" data-testid="button-seleziona-immagini">
                      <Upload className="h-4 w-4 mr-2" />
                      Seleziona Immagini
                    </span>
                  </Button>
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Totale immagini: {existingImages.length + selectedFiles.length} / 15
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/immobili")}
              data-testid="button-annulla"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-salva"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvataggio..."
                : isEdit
                ? "Aggiorna Immobile"
                : "Crea Immobile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
