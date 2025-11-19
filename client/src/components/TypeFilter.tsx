import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQueryString } from "@/hooks/useQueryString";

export default function TypeFilter() {
  const { searchParams, updateParams } = useQueryString();
  
  const [typeValue, setTypeValue] = useState(() => searchParams.get("tipo") || "tutti");

  useEffect(() => {
    const urlTipo = searchParams.get("tipo") || "tutti";
    setTypeValue(urlTipo);
  }, [searchParams]);

  const handleTypeChange = (value: string) => {
    updateParams({ tipo: value });
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
