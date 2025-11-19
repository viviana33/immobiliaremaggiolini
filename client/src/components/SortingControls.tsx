import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQueryString } from "@/hooks/useQueryString";

export default function SortingControls() {
  const { searchParams, updateParams } = useQueryString();
  
  // Leggi valore direttamente dall'URL (no state locale)
  const sortValue = searchParams.get("sort") || "recente";

  const handleSortChange = (value: string) => {
    // Se "recente", rimuovi il parametro passando null
    updateParams({ sort: value === 'recente' ? null : value });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="sort-select" className="text-sm font-medium">
        Ordina per
      </Label>
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger 
          id="sort-select"
          className="w-[160px]" 
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
