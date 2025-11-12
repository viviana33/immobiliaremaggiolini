import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SortingControls() {
  const [location, setLocation] = useLocation();
  const currentPath = location.split('?')[0];
  const queryString = location.includes('?') ? location.split('?')[1] : '';
  
  const [sortValue, setSortValue] = useState(() => {
    const params = new URLSearchParams(queryString);
    return params.get("sort") || "recente";
  });

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const urlSort = params.get("sort") || "recente";
    setSortValue(urlSort);
  }, [queryString]);

  const handleSortChange = (value: string) => {
    const newSearchParams = new URLSearchParams(queryString);
    
    if (value === "recente") {
      newSearchParams.delete("sort");
    } else {
      newSearchParams.set("sort", value);
    }
    
    newSearchParams.delete("page");
    
    const newQueryString = newSearchParams.toString();
    const newLocation = newQueryString ? `${currentPath}?${newQueryString}` : currentPath;
    setLocation(newLocation);
  };

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="sort-select" className="text-sm font-medium whitespace-nowrap">
        Ordina per:
      </Label>
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger 
          id="sort-select"
          className="w-[180px]" 
          data-testid="select-sort"
        >
          <SelectValue placeholder="Seleziona ordinamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recente" data-testid="option-sort-recente">Più recente</SelectItem>
          <SelectItem value="prezzo_asc" data-testid="option-sort-prezzo-asc">Prezzo ↑</SelectItem>
          <SelectItem value="prezzo_desc" data-testid="option-sort-prezzo-desc">Prezzo ↓</SelectItem>
          <SelectItem value="mq_asc" data-testid="option-sort-mq-asc">MQ ↑</SelectItem>
          <SelectItem value="mq_desc" data-testid="option-sort-mq-desc">MQ ↓</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
