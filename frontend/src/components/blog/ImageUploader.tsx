import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onColdKeyChange?: (key: string) => void;
}

export function ImageUploader({ value, onChange, onColdKeyChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 8 * 1024 * 1024;
    const minSize = 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Formato file non supportato. Utilizza JPEG, PNG, WebP o GIF.';
    }

    if (file.size > maxSize) {
      return 'Il file supera la dimensione massima di 8MB.';
    }

    if (file.size < minSize) {
      return 'Il file è troppo piccolo.';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Errore di validazione",
        description: validationError,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/upload-post-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore nel caricamento');
      }

      const result = await response.json();
      
      setUploadProgress(100);
      
      onChange(result.hot_url);
      setPreviewUrl(result.hot_url);
      
      if (onColdKeyChange) {
        onColdKeyChange(result.cold_key);
      }

      URL.revokeObjectURL(localPreviewUrl);

      toast({
        title: "Immagine caricata",
        description: "L'immagine di copertina è stata caricata con successo.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(value);
      
      toast({
        variant: "destructive",
        title: "Errore nel caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento dell'immagine.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onChange('');
    if (onColdKeyChange) {
      onColdKeyChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file-hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <img
              src={previewUrl}
              alt="Anteprima copertina"
              className="w-full h-full object-cover"
              data-testid="img-preview"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              data-testid="button-remove-image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative aspect-video w-full rounded-md border-2 border-dashed
            flex flex-col items-center justify-center gap-2
            transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          data-testid="dropzone-upload"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Trascina un'immagine qui o clicca per selezionarla
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP o GIF (max 8MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Caricamento in corso...</span>
            <span className="text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} data-testid="progress-upload" />
        </div>
      )}
    </div>
  );
}
