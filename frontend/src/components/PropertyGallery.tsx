import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PropertyImage } from "@shared/schema";

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
}

const getCloudinaryUrl = (url: string, width?: number, height?: number) => {
  if (!url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push('c_fill', 'f_auto', 'q_auto');
  
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

export default function PropertyGallery({ images, propertyTitle }: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Nessuna immagine disponibile</p>
      </div>
    );
  }

  const mainImage = images[0];
  const thumbnails = images.slice(1, 15);

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <>
      <div className="space-y-4">
        <button 
          className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate border-0 p-0"
          onClick={() => setSelectedImage(0)}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(0)}
          data-testid="image-main"
          aria-label={`Apri galleria immagini - ${propertyTitle}`}
        >
          <img
            src={getCloudinaryUrl(mainImage.urlHot, 1200, 675)}
            alt={`${propertyTitle} - Immagine principale`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </button>

        {thumbnails.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {thumbnails.map((image, index) => (
              <button
                key={image.id}
                className="relative aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover-elevate border-0 p-0"
                onClick={() => setSelectedImage(index + 1)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(index + 1)}
                data-testid={`image-thumbnail-${index + 1}`}
                aria-label={`Visualizza immagine ${index + 2} di ${images.length}`}
              >
                <img
                  src={getCloudinaryUrl(image.urlHot, 300, 300)}
                  alt={`${propertyTitle} - Immagine ${index + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent 
          className="max-w-7xl w-full p-0 gap-0"
          onKeyDown={handleKeyDown}
        >
          <div className="relative bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
              data-testid="button-close-gallery"
              aria-label="Chiudi galleria"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>

            {selectedImage !== null && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePrevious}
                  data-testid="button-previous-image"
                  aria-label="Immagine precedente"
                >
                  <ChevronLeft className="h-8 w-8" aria-hidden="true" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleNext}
                  data-testid="button-next-image"
                  aria-label="Immagine successiva"
                >
                  <ChevronRight className="h-8 w-8" aria-hidden="true" />
                </Button>

                <div className="flex items-center justify-center min-h-[80vh]">
                  <img
                    src={getCloudinaryUrl(images[selectedImage].urlHot, 1920, 1080)}
                    alt={`${propertyTitle} - Immagine ${selectedImage + 1}`}
                    className="max-w-full max-h-[80vh] object-contain"
                    data-testid="image-lightbox"
                  />
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
