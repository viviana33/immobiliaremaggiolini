import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function TypeFilter() {
  const [location, setLocation] = useLocation();
  
  const queryString = location.includes('?') ? location.split('?')[1] : '';
  const [typeValue, setTypeValue] = useState(() => {
    const params = new URLSearchParams(queryString);
    return params.get("tipo") || "tutti";
  });

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const urlTipo = params.get("tipo") || "tutti";
    setTypeValue(urlTipo);
  }, [queryString]);

  const handleTypeChange = (value: string) => {
    const currentPath = window.location.pathname;
    const currentQueryString = window.location.search.replace('?', '');
    const newSearchParams = new URLSearchParams(currentQueryString);
    
    if (value === "tutti") {
      newSearchParams.delete("tipo");
    } else {
      newSearchParams.set("tipo", value);
    }
    
    newSearchParams.delete("page");
    
    const newQueryString = newSearchParams.toString();
    const newLocation = newQueryString ? `${currentPath}?${newQueryString}` : currentPath;
    setLocation(newLocation);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-select" className="text-sm font-medium">
        Tipo
      </Label>
      <Select value={typeValue} onValueChange={handleTypeChange}>
        <SelectTrigger 
          id="type-select"
          className="w-[160px]" 
          data-testid="select-type"
        >
          <SelectValue placeholder="Seleziona tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tutti" data-testid="option-type-tutti">Tutti</SelectItem>
          <SelectItem value="vendita" data-testid="option-type-vendita">Vendita</SelectItem>
          <SelectItem value="affitto" data-testid="option-type-affitto">Affitto</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
