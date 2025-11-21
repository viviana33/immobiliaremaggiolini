import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  showThumbnails?: boolean;
  title?: string;
  aspectRatio?: string;
}

export default function ImageCarousel({ 
  images, 
  className,
  showThumbnails = true,
  title,
  aspectRatio = "aspect-[3/4] md:aspect-[4/3]"
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef(Math.random().toString(36).substring(7));

  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const totalImages = displayImages.length;

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      setCurrent(lightboxIndex);
    }
  }, [isLightboxOpen, lightboxIndex]);

  const handleThumbnailClick = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent(index);
  };

  useEffect(() => {
    const nextIndex = current === totalImages - 1 ? 0 : current + 1;
    const nextImage = displayImages[nextIndex];
    const instanceId = instanceIdRef.current;
    const prefetchSelector = `link[rel="prefetch"][data-carousel-id="${instanceId}"]`;
    
    if (nextImage && nextImage !== "/placeholder.jpg" && totalImages > 1) {
      const existingLink = document.querySelector(prefetchSelector);
      if (existingLink) {
        existingLink.setAttribute('href', nextImage);
      } else {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextImage;
        link.setAttribute('data-carousel-id', instanceId);
        link.as = 'image';
        document.head.appendChild(link);
      }
    }
    
    return () => {
      const link = document.querySelector(prefetchSelector);
      if (link) {
        link.remove();
      }
    };
  }, [current, displayImages, totalImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setLightboxIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setLightboxIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsLightboxOpen(false);
        }
      } else if (carouselRef.current?.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalImages, isLightboxOpen]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.pointerType === "mouse") {
      setTouchEnd(null);
      setTouchStart(e.clientX);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.pointerType === "mouse" && touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      ref={carouselRef} 
      className={cn("space-y-4", className)}
      tabIndex={0}
      role="region"
      aria-label="Carosello immagini"
      aria-live="polite"
    >
      <div className={cn("relative w-full bg-muted rounded-md overflow-hidden", aspectRatio)}>
        <div
          className="relative w-full h-full select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={(e) => {
            e.stopPropagation();
            setTouchStart(null);
            setTouchEnd(null);
          }}
        >
          {displayImages.map((image, index) => {
            const altText = title 
              ? `${title} - immagine ${index + 1}`
              : `Immagine ${index + 1} di ${totalImages}`;
            
            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "absolute inset-0 w-full h-full block border-0 p-0 transition-opacity duration-300",
                  index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLightboxIndex(current);
                  setIsLightboxOpen(true);
                }}
                aria-label={`Apri ${altText} a schermo intero`}
                data-testid={`carousel-image-${index}`}
              >
                <img
                  src={image}
                  alt={altText}
                  className="w-full h-full object-contain cursor-pointer"
                  loading={index === current ? "eager" : "lazy"}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white no-default-hover-elevate no-default-active-elevate"
          onClick={handlePrevious}
          aria-label="Immagine precedente"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white no-default-hover-elevate no-default-active-elevate"
          onClick={handleNext}
          aria-label="Immagine successiva"
          data-testid="button-carousel-next"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </Button>

        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {current + 1} / {totalImages}
          </div>
        )}
      </div>

      {showThumbnails && totalImages > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {displayImages.map((image, index) => {
            const altText = title 
              ? `${title} - immagine ${index + 1}`
              : `Miniatura ${index + 1}`;
            
            return (
              <button
                key={index}
                onClick={(e) => {
                  handleThumbnailClick(index, e);
                  setLightboxIndex(index);
                  setIsLightboxOpen(true);
                }}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all hover-elevate",
                  index === current
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent"
                )}
                aria-label={`Vai all'immagine ${index + 1}`}
                aria-pressed={index === current}
                data-testid={`thumbnail-${index}`}
              >
                <img
                  src={image}
                  alt={altText}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[100vw] w-full h-full p-0 gap-0 border-0 bg-black">
          <VisuallyHidden>
            <DialogTitle>
              {title ? `Galleria immagini - ${title}` : "Galleria immagini"}
            </DialogTitle>
            <DialogDescription>
              Visualizzazione a schermo intero delle immagini. Usa le frecce per navigare o premi ESC per chiudere.
            </DialogDescription>
          </VisuallyHidden>
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white no-default-hover-elevate no-default-active-elevate"
              onClick={() => setIsLightboxOpen(false)}
              data-testid="button-close-lightbox"
              aria-label="Chiudi visualizzazione a schermo intero"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>

            {totalImages > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white no-default-hover-elevate no-default-active-elevate"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                  }}
                  data-testid="button-lightbox-prev"
                  aria-label="Immagine precedente"
                >
                  <ChevronLeft className="h-8 w-8" aria-hidden="true" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white no-default-hover-elevate no-default-active-elevate"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                  }}
                  data-testid="button-lightbox-next"
                  aria-label="Immagine successiva"
                >
                  <ChevronRight className="h-8 w-8" aria-hidden="true" />
                </Button>
              </>
            )}

            <img
              src={displayImages[lightboxIndex]}
              alt={title ? `${title} - immagine ${lightboxIndex + 1}` : `Immagine ${lightboxIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              data-testid="lightbox-image"
            />

            {totalImages > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                {lightboxIndex + 1} / {totalImages}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
