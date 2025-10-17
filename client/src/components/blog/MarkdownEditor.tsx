import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  List 
} from "lucide-react";
import { useRef, useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = 
      value.substring(0, start) + 
      before + 
      textToInsert + 
      after + 
      value.substring(end);
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => {
    insertMarkdown("**", "**", "testo in grassetto");
  };

  const handleItalic = () => {
    insertMarkdown("*", "*", "testo in corsivo");
  };

  const handleH2 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const currentLine = value.substring(lineStart, actualLineEnd);
    const newLine = currentLine.startsWith('## ') ? currentLine : '## ' + currentLine;
    
    const newText = 
      value.substring(0, lineStart) + 
      newLine + 
      value.substring(actualLineEnd);
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleH3 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const currentLine = value.substring(lineStart, actualLineEnd);
    const newLine = currentLine.startsWith('### ') ? currentLine : '### ' + currentLine;
    
    const newText = 
      value.substring(0, lineStart) + 
      newLine + 
      value.substring(actualLineEnd);
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleLink = () => {
    insertMarkdown("[", "](https://esempio.com)", "testo del link");
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
    
    const currentLine = value.substring(lineStart, actualLineEnd);
    const newLine = currentLine.startsWith('- ') ? currentLine : '- ' + currentLine;
    
    const newText = 
      value.substring(0, lineStart) + 
      newLine + 
      value.substring(actualLineEnd);
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const htmlContent = useMemo(() => {
    if (!value) return "";

    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .processSync(value);

      return String(result);
    } catch (error) {
      console.error("Errore nella conversione markdown:", error);
      return "<p>Errore nella conversione del markdown</p>";
    }
  }, [value]);

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
        
        <TabsContent value="edit" className="mt-4 space-y-4">
          <Card className="p-2">
            <div 
              className="flex flex-wrap gap-1"
              role="toolbar"
              aria-label="Barra di formattazione markdown"
            >
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleBold}
                aria-label="Grassetto"
                title="Grassetto (Ctrl+B)"
                data-testid="button-bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleItalic}
                aria-label="Corsivo"
                title="Corsivo (Ctrl+I)"
                data-testid="button-italic"
              >
                <Italic className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-8 mx-1" />
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleH2}
                aria-label="Titolo H2"
                title="Titolo H2"
                data-testid="button-h2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleH3}
                aria-label="Titolo H3"
                title="Titolo H3"
                data-testid="button-h3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-8 mx-1" />
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleLink}
                aria-label="Inserisci link"
                title="Inserisci link"
                data-testid="button-link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleList}
                aria-label="Lista puntata"
                title="Lista puntata"
                data-testid="button-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <div>
            <label htmlFor="markdown-textarea" className="sr-only">
              Editor Markdown
            </label>
            <Textarea
              id="markdown-textarea"
              ref={textareaRef}
              placeholder="Scrivi il contenuto dell'articolo in Markdown..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              data-testid="textarea-markdown"
              aria-label="Editor di testo Markdown"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="p-6 min-h-[400px]">
            {value ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert" 
                data-testid="preview-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                aria-live="polite"
                aria-label="Anteprima del contenuto markdown"
              />
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
