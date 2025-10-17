import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            data-testid="textarea-markdown"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="p-6 min-h-[400px]">
            {value ? (
              <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="preview-content">
                <div className="whitespace-pre-wrap">{value}</div>
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
