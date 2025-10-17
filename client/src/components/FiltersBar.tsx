import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FiltersBarProps {
  onFiltersChange?: (filters: Record<string, string>) => void;
}

export default function FiltersBar({ onFiltersChange }: FiltersBarProps) {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [tipo, setTipo] = useState<string>(searchParams.get("tipo") || "");
  const [prezzoMin, setPrezzoMin] = useState<string>(searchParams.get("prezzoMin") || "");
  const [prezzoMax, setPrezzoMax] = useState<string>(searchParams.get("prezzoMax") || "");
  const [mqMin, setMqMin] = useState<string>(searchParams.get("mqMin") || "");

  const updateURL = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    setLocation(`?${queryString}`, { replace: true });
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const applyFilters = () => {
    updateURL({
      tipo,
      prezzoMin,
      prezzoMax,
      mqMin,
    });
  };

  const resetFilters = () => {
    setTipo("");
    setPrezzoMin("");
    setPrezzoMax("");
    setMqMin("");
    setLocation("", { replace: true });
    
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const hasActiveFilters = tipo || prezzoMin || prezzoMax || mqMin;

  const activeFiltersCount = [tipo, prezzoMin, prezzoMax, mqMin].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" data-testid="heading-filters">Filtri di Ricerca</h2>
        {hasActiveFilters && (
          <Badge variant="secondary" data-testid="badge-active-filters">
            {activeFiltersCount} {activeFiltersCount === 1 ? "filtro attivo" : "filtri attivi"}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="tipo" data-testid="label-tipo">Tipo</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tipo === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo("")}
              className="flex-1"
              data-testid="button-tipo-tutti"
            >
              Tutti
            </Button>
            <Button
              type="button"
              variant={tipo === "vendita" ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo("vendita")}
              className="flex-1"
              data-testid="button-tipo-vendita"
            >
              Vendita
            </Button>
            <Button
              type="button"
              variant={tipo === "affitto" ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo("affitto")}
              className="flex-1"
              data-testid="button-tipo-affitto"
            >
              Affitto
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prezzoMin" data-testid="label-prezzo-min">Prezzo Min (€)</Label>
          <Input
            id="prezzoMin"
            type="number"
            placeholder="Es: 100000"
            value={prezzoMin}
            onChange={(e) => setPrezzoMin(e.target.value)}
            data-testid="input-prezzo-min"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prezzoMax" data-testid="label-prezzo-max">Prezzo Max (€)</Label>
          <Input
            id="prezzoMax"
            type="number"
            placeholder="Es: 500000"
            value={prezzoMax}
            onChange={(e) => setPrezzoMax(e.target.value)}
            data-testid="input-prezzo-max"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mqMin" data-testid="label-mq-min">MQ Min</Label>
          <Input
            id="mqMin"
            type="number"
            placeholder="Es: 60"
            value={mqMin}
            onChange={(e) => setMqMin(e.target.value)}
            data-testid="input-mq-min"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={applyFilters}
          data-testid="button-apply-filters"
        >
          Applica Filtri
        </Button>
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={resetFilters}
            data-testid="button-reset-filters"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
