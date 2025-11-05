import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { useToast } from "@/hooks/use-toast";

export interface ContentSection {
  id: string;
  type: "heading" | "text" | "image";
  headingLevel?: "h2" | "h3";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface SimpleContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function convertToSections(markdown: string): ContentSection[] {
  if (!markdown || markdown.trim() === "") {
    return [];
  }

  const sections: ContentSection[] = [];
  const lines = markdown.split("\n");
  let currentTextLines: string[] = [];
  let idCounter = 0;

  const flushTextSection = () => {
    if (currentTextLines.length > 0) {
      const textContent = currentTextLines.join("\n");
      sections.push({
        id: `section-${idCounter++}`,
        type: "text",
        content: textContent,
      });
      currentTextLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith("## ")) {
      flushTextSection();
      sections.push({
        id: `section-${idCounter++}`,
        type: "heading",
        headingLevel: "h2",
        content: line.substring(3).trim(),
      });
    } else if (line.startsWith("### ")) {
      flushTextSection();
      sections.push({
        id: `section-${idCounter++}`,
        type: "heading",
        headingLevel: "h3",
        content: line.substring(4).trim(),
      });
    } else if (line.match(/!\[(.*?)\]\((.*?)\)/)) {
      flushTextSection();
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        sections.push({
          id: `section-${idCounter++}`,
          type: "image",
          content: "",
          imageUrl: match[2],
          imageAlt: match[1],
        });
      }
    } else if (line.trim() === "") {
      if (currentTextLines.length > 0) {
        flushTextSection();
      }
    } else {
      currentTextLines.push(line);
    }
  }

  flushTextSection();

  return sections.length > 0 ? sections : [];
}

function convertToMarkdown(sections: ContentSection[]): string {
  return sections
    .map((section) => {
      if (section.type === "heading") {
        const prefix = section.headingLevel === "h2" ? "## " : "### ";
        return prefix + section.content;
      } else if (section.type === "text") {
        return section.content;
      } else if (section.type === "image" && section.imageUrl) {
        const alt = section.imageAlt || "";
        return `![${alt}](${section.imageUrl})`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

interface ImageSectionUploaderProps {
  section: ContentSection;
  index: number;
  onUpdate: (updates: Partial<ContentSection>) => void;
}

function ImageSectionUploader({ section, index, onUpdate }: ImageSectionUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 8 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato non supportato",
        description: "Utilizza JPEG, PNG, WebP o GIF.",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File troppo grande",
        description: "Il file supera la dimensione massima di 8MB.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-post-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore nel caricamento');
      }

      const result = await response.json();
      
      onUpdate({ imageUrl: result.hot_url });

      toast({
        title: "Immagine caricata",
        description: "L'immagine è stata caricata con successo.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore nel caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        data-testid={`input-file-hidden-${index}`}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-testid={`button-upload-image-${index}`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Carica immagine
        </Button>
        <span className="text-sm text-muted-foreground self-center">
          oppure inserisci URL manualmente
        </span>
      </div>

      <div>
        <Label htmlFor={`image-${section.id}`}>URL dell'immagine</Label>
        <Input
          id={`image-${section.id}`}
          placeholder="https://esempio.com/immagine.jpg"
          value={section.imageUrl || ""}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          data-testid={`input-image-url-${index}`}
        />
      </div>

      <div>
        <Label htmlFor={`image-alt-${section.id}`}>Testo alternativo (opzionale)</Label>
        <Input
          id={`image-alt-${section.id}`}
          placeholder="Descrizione dell'immagine per accessibilità"
          value={section.imageAlt || ""}
          onChange={(e) => onUpdate({ imageAlt: e.target.value })}
          data-testid={`input-image-alt-${index}`}
        />
      </div>

      {section.imageUrl && (
        <div className="mt-2 rounded-md border p-2">
          <img
            src={section.imageUrl}
            alt={section.imageAlt || "Anteprima"}
            className="max-h-40 rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            data-testid={`img-preview-${index}`}
          />
        </div>
      )}
    </div>
  );
}

export function SimpleContentEditor({ value, onChange }: SimpleContentEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>(() => convertToSections(value));

  useEffect(() => {
    const markdown = convertToMarkdown(sections);
    onChange(markdown);
  }, [sections]);

  useEffect(() => {
    if (value !== convertToMarkdown(sections)) {
      setSections(convertToSections(value));
    }
  }, [value]);

  const addSection = (type: "heading" | "text" | "image") => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      content: "",
      headingLevel: type === "heading" ? "h2" : undefined,
      imageUrl: type === "image" ? "" : undefined,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  const htmlContent = useMemo(() => {
    const markdown = convertToMarkdown(sections);
    if (!markdown) return "";

    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .processSync(markdown);

      return String(result);
    } catch (error) {
      console.error("Errore nella conversione markdown:", error);
      return "<p>Errore nella conversione del markdown</p>";
    }
  }, [sections]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" data-testid="tab-edit">
            Modifica
          </TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-preview">
            Anteprima
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addSection("heading")}
          data-testid="button-add-heading"
        >
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi Titolo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addSection("text")}
          data-testid="button-add-text"
        >
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi Testo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addSection("image")}
          data-testid="button-add-image"
        >
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi Immagine
        </Button>
      </div>

      {sections.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground" data-testid="text-empty-sections">
            Nessuna sezione. Clicca sui pulsanti sopra per iniziare a creare il contenuto del tuo articolo.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id} className="p-4" data-testid={`section-${index}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {section.type === "heading" && (
                    <Select
                      value={section.headingLevel}
                      onValueChange={(value) =>
                        updateSection(section.id, { headingLevel: value as "h2" | "h3" })
                      }
                    >
                      <SelectTrigger className="w-32" data-testid={`select-heading-level-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h2">Titolo Grande</SelectItem>
                        <SelectItem value="h3">Sottotitolo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">
                    {section.type === "heading" && "Titolo"}
                    {section.type === "text" && "Paragrafo"}
                    {section.type === "image" && "Immagine"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveSection(section.id, "up")}
                    disabled={index === 0}
                    data-testid={`button-move-up-${index}`}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveSection(section.id, "down")}
                    disabled={index === sections.length - 1}
                    data-testid={`button-move-down-${index}`}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteSection(section.id)}
                    data-testid={`button-delete-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {section.type === "heading" && (
                <div>
                  <Label htmlFor={`heading-${section.id}`}>Testo del titolo</Label>
                  <Input
                    id={`heading-${section.id}`}
                    placeholder="Inserisci il titolo della sezione"
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    data-testid={`input-heading-content-${index}`}
                  />
                </div>
              )}

              {section.type === "text" && (
                <div>
                  <Label htmlFor={`text-${section.id}`}>Contenuto del paragrafo</Label>
                  <Textarea
                    id={`text-${section.id}`}
                    placeholder="Scrivi il testo del paragrafo qui..."
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    className="min-h-[120px]"
                    data-testid={`textarea-content-${index}`}
                  />
                </div>
              )}

              {section.type === "image" && (
                <ImageSectionUploader
                  section={section}
                  index={index}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="p-8 min-h-[400px]">
            {sections.length > 0 ? (
              <article 
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                data-testid="preview-content"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg" data-testid="preview-empty">
                  Nessun contenuto da visualizzare. Aggiungi sezioni nell'editor per vedere l'anteprima.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
