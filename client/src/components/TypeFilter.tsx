import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryString } from "@/hooks/useQueryString";

export default function TypeFilter() {
  const { searchParams, updateParams } = useQueryString();
  
  // Leggi valore direttamente dall'URL
  const activeType = searchParams.get("tipo") || "tutti";

  const handleTypeClick = (type: string) => {
    // Se "tutti", rimuovi il parametro passando null
    updateParams({ tipo: type === 'tutti' ? null : type });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Tipo</Label>
      <div className="flex gap-2">
        <Button
          variant={activeType === "tutti" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeClick("tutti")}
          data-testid="filter-type-tutti"
        >
          Tutti
        </Button>
        <Button
          variant={activeType === "vendita" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeClick("vendita")}
          data-testid="filter-type-vendita"
        >
          Vendita
        </Button>
        <Button
          variant={activeType === "affitto" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeClick("affitto")}
          data-testid="filter-type-affitto"
        >
          Affitto
        </Button>
      </div>
    </div>
  );
}
