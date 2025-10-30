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
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

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

  return (
    <div className="space-y-4">
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
                <div className="space-y-2">
                  <div>
                    <Label htmlFor={`image-${section.id}`}>URL dell'immagine</Label>
                    <Input
                      id={`image-${section.id}`}
                      placeholder="https://esempio.com/immagine.jpg"
                      value={section.imageUrl || ""}
                      onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                      data-testid={`input-image-url-${index}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`image-alt-${section.id}`}>Testo alternativo (opzionale)</Label>
                    <Input
                      id={`image-alt-${section.id}`}
                      placeholder="Descrizione dell'immagine per accessibilità"
                      value={section.imageAlt || ""}
                      onChange={(e) => updateSection(section.id, { imageAlt: e.target.value })}
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
                  <p className="text-xs text-muted-foreground">
                    Puoi usare le immagini dalla galleria del post
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
