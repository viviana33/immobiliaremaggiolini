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
import { Plus, Trash2, GripVertical, Image as ImageIcon, Upload, Loader2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { useToast } from "@/hooks/use-toast";

export interface ContentSection {
  id: string;
  type: "heading" | "text" | "image";
  headingLevel?: "h2" | "h3";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSize?: "small" | "medium" | "large" | "full";
  imageAlign?: "left" | "center" | "right";
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
    } else if (line.match(/<div class="my-6/)) {
      flushTextSection();
      const imgMatch = line.match(/<img.*?src="(.*?)".*?alt="(.*?)".*?class="(.*?)"/);
      const alignMatch = line.match(/class="my-6 (.*?)"/);
      
      if (imgMatch) {
        const imgClasses = imgMatch[3];
        const alignClass = alignMatch?.[1] || "mx-auto";
        
        const size = imgClasses.includes("max-w-xs") ? "small" :
                    imgClasses.includes("max-w-lg") ? "medium" :
                    imgClasses.includes("max-w-2xl") ? "large" :
                    "full";
        
        const align = alignClass.includes("mr-auto") ? "left" :
                     alignClass.includes("ml-auto") ? "right" :
                     "center";
        
        sections.push({
          id: `section-${idCounter++}`,
          type: "image",
          content: "",
          imageUrl: imgMatch[1],
          imageAlt: imgMatch[2],
          imageSize: size,
          imageAlign: align,
        });
      }
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
          imageSize: "medium",
          imageAlign: "center",
        });
      }
    } else if (line.trim() === "") {
      if (currentTextLines.length > 0) {
        flushTextSection();
      }
    } else if (!line.match(/<\/div>/)) {
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
        const size = section.imageSize || "medium";
        const align = section.imageAlign || "center";
        const sizeClass = size === "small" ? "max-w-xs" : 
                        size === "medium" ? "max-w-lg" :
                        size === "large" ? "max-w-2xl" :
                        "w-full";
        const alignClass = align === "left" ? "mr-auto" :
                         align === "right" ? "ml-auto" :
                         "mx-auto";
        return `<div class="my-6 ${alignClass}"><img src="${section.imageUrl}" alt="${alt}" class="${sizeClass} rounded-md" /></div>`;
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

  const imageSize = section.imageSize || "medium";
  const imageAlign = section.imageAlign || "center";

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small": return "max-w-xs";
      case "medium": return "max-w-lg";
      case "large": return "max-w-2xl";
      case "full": return "w-full";
      default: return "max-w-lg";
    }
  };

  const getAlignClass = (align: string) => {
    switch (align) {
      case "left": return "mr-auto";
      case "center": return "mx-auto";
      case "right": return "ml-auto";
      default: return "mx-auto";
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

      <div className="flex gap-2 flex-wrap">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`image-size-${section.id}`}>Dimensione</Label>
          <Select
            value={imageSize}
            onValueChange={(value) => onUpdate({ imageSize: value as "small" | "medium" | "large" | "full" })}
          >
            <SelectTrigger id={`image-size-${section.id}`} data-testid={`select-image-size-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Piccola</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="full">Larghezza piena</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`image-align-${section.id}`}>Allineamento</Label>
          <Select
            value={imageAlign}
            onValueChange={(value) => onUpdate({ imageAlign: value as "left" | "center" | "right" })}
          >
            <SelectTrigger id={`image-align-${section.id}`} data-testid={`select-image-align-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Sinistra
                </div>
              </SelectItem>
              <SelectItem value="center">
                <div className="flex items-center gap-2">
                  <AlignCenter className="h-4 w-4" />
                  Centro
                </div>
              </SelectItem>
              <SelectItem value="right">
                <div className="flex items-center gap-2">
                  <AlignRight className="h-4 w-4" />
                  Destra
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {section.imageUrl && (
        <div className="mt-2 rounded-md border p-4">
          <p className="text-xs text-muted-foreground mb-2">Anteprima con dimensione e allineamento selezionati:</p>
          <div className={`${getAlignClass(imageAlign)}`}>
            <img
              src={section.imageUrl}
              alt={section.imageAlt || "Anteprima"}
              className={`${getSizeClass(imageSize)} rounded`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              data-testid={`img-preview-${index}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function SimpleContentEditor({ value, onChange }: SimpleContentEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>(() => convertToSections(value));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      imageSize: type === "image" ? "medium" : undefined,
      imageAlign: type === "image" ? "center" : undefined,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    setDraggedIndex(index);
    setSections(newSections);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const htmlContent = useMemo(() => {
    const markdown = convertToMarkdown(sections);
    if (!markdown) return "";

    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSanitize, {
          ...defaultSchema,
          attributes: {
            ...defaultSchema.attributes,
            div: [
              ...(defaultSchema.attributes?.div || []),
              'className',
              ['className', 'my-6', 'mr-auto', 'ml-auto', 'mx-auto']
            ],
            img: [
              ...(defaultSchema.attributes?.img || []),
              'src',
              'alt',
              'className',
              ['className', 'max-w-xs', 'max-w-lg', 'max-w-2xl', 'w-full', 'rounded-md']
            ],
          },
          tagNames: [...(defaultSchema.tagNames || []), 'div'],
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
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
          <Card 
            key={section.id} 
            className={`p-4 transition-all ${draggedIndex === index ? 'opacity-50' : ''}`}
            data-testid={`section-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 hover-elevate rounded"
                    data-testid={`drag-handle-${index}`}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
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
