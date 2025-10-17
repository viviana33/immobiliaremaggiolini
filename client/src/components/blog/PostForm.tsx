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
import { MarkdownEditor } from "./MarkdownEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

interface PostFormProps {
  postId?: string;
}

const formSchema = insertPostSchema.extend({
  titolo: z.string().min(1, "Il titolo è obbligatorio"),
  sottotitolo: z.string().optional(),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  cover: z.string().optional(),
  contenuto: z.string().min(1, "Il contenuto è obbligatorio"),
  tag: z.array(z.string()).optional(),
  categoria: z.string().optional(),
  autore: z.string().min(1, "L'autore è obbligatorio"),
  stato: z.enum(["bozza", "pubblicato", "archiviato"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PostForm({ postId }: PostFormProps) {
  const isEdit = Boolean(postId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titolo: "",
      sottotitolo: "",
      slug: "",
      cover: "",
      contenuto: "",
      tag: [],
      categoria: "",
      autore: "Admin",
      stato: "bozza",
      metaTitle: "",
      metaDescription: "",
    },
  });

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
                <FormLabel>Immagine di copertina (URL)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://esempio.com/immagine.jpg"
                    data-testid="input-cover-image"
                    {...field}
                  />
                </FormControl>
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
            variant="outline" 
            data-testid="button-save-draft"
            disabled={true}
          >
            Salva Bozza
          </Button>
          <Button 
            data-testid="button-publish"
            disabled={true}
          >
            Pubblica
          </Button>
        </div>
      </form>
    </Form>
  );
}
