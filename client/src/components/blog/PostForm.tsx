import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "./MarkdownEditor";

// TODO: Implementare interfaccia BlogPost e schema Zod
// TODO: Implementare useForm con zodResolver
// TODO: Implementare useQuery per caricare il post (se in edit)
// TODO: Implementare useMutation per salvare il post
// TODO: Collegare MarkdownEditor al form

interface PostFormProps {
  postId?: string;
}

export function PostForm({ postId }: PostFormProps) {
  const isEdit = Boolean(postId);

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        TODO: Implementare form completo con validazione
      </p>

      <div className="space-y-6">
        {/* TODO: Avvolgere in <Form> component */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titolo</label>
            <Input
              placeholder="Inserisci il titolo dell'articolo"
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug URL</label>
            <Input
              placeholder="slug-articolo"
              data-testid="input-slug"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generale">Generale</SelectItem>
                  <SelectItem value="mercato">Mercato Immobiliare</SelectItem>
                  <SelectItem value="consigli">Consigli</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stato</label>
              <Select>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bozza">Bozza</SelectItem>
                  <SelectItem value="pubblicato">Pubblicato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contenuto</label>
            <MarkdownEditor />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            data-testid="button-cancel"
          >
            Annulla
          </Button>
          <Button
            data-testid="button-save"
          >
            {isEdit ? "Aggiorna Articolo" : "Crea Articolo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
