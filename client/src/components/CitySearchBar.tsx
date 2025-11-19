import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryString } from "@/hooks/useQueryString";

export default function CitySearchBar() {
  const { searchParams, updateParams } = useQueryString();
  
  const [searchValue, setSearchValue] = useState(() => searchParams.get("citta") || "");

  useEffect(() => {
    const urlCitta = searchParams.get("citta") || "";
    setSearchValue(urlCitta);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    updateParams({ citta: value.trim() || null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue);
    }
  };

  const handleBlur = () => {
    handleSearch(searchValue);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label htmlFor="city-search" className="text-sm font-medium">
        Cerca per città
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="city-search"
          type="text"
          placeholder="Es: Milano, Roma, Torino..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="pl-10"
          data-testid="input-city-search"
        />
      </div>
    </div>
  );
}
