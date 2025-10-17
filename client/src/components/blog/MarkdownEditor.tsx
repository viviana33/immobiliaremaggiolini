import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// TODO: Implementare parsing markdown per preview
// TODO: Implementare toolbar con pulsanti formattazione (grassetto, corsivo, link, immagini)
// TODO: Integrare con react-hook-form (controllato dal parent PostForm)
// TODO: Aggiungere supporto per caricamento immagini

export function MarkdownEditor() {
  const [content, setContent] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        TODO: Implementare editor Markdown con preview
      </p>
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" data-testid="tab-edit">
            Modifica
          </TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-preview">
            Anteprima
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Textarea
            placeholder="Scrivi il contenuto dell'articolo in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            data-testid="textarea-markdown"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="p-6 min-h-[400px]">
            {content ? (
              <div className="prose prose-sm max-w-none" data-testid="preview-content">
                <p className="text-muted-foreground italic">
                  TODO: Renderizzare Markdown qui
                </p>
                <pre className="mt-4 text-xs bg-muted p-4 rounded">
                  {content}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground italic" data-testid="preview-empty">
                Nessun contenuto da visualizzare
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
