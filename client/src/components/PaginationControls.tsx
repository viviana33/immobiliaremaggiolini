import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function PaginationControls({ currentPage, totalPages, total }: PaginationControlsProps) {
  const [location, setLocation] = useLocation();
  const currentPath = location.split('?')[0];
  const queryString = location.includes('?') ? location.split('?')[1] : '';
  
  const goToPage = (page: number) => {
    const searchParams = new URLSearchParams(queryString);
    
    if (page === 1) {
      searchParams.delete("page");
    } else {
      searchParams.set("page", page.toString());
    }
    
    const newQueryString = searchParams.toString();
    const newLocation = newQueryString ? `${currentPath}?${newQueryString}` : currentPath;
    setLocation(newLocation);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          data-testid="button-page-first"
          aria-label="Prima pagina"
        >
          <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          data-testid="button-page-prev"
          aria-label="Pagina precedente"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            typeof page === "number" ? (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="min-w-[2.5rem]"
                data-testid={`button-page-${page}`}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-muted-foreground">
                {page}
              </span>
            )
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          data-testid="button-page-next"
          aria-label="Pagina successiva"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          data-testid="button-page-last"
          aria-label="Ultima pagina"
        >
          <ChevronsRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
        Pagina {currentPage} di {totalPages} ({total} {total === 1 ? "immobile" : "immobili"})
      </p>
    </div>
  );
}
