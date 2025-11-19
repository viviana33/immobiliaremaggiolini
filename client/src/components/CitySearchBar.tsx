import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function CitySearchBar() {
  const [location, setLocation] = useLocation();
  const currentPath = location.split('?')[0];
  const queryString = location.includes('?') ? location.split('?')[1] : '';
  
  const [searchValue, setSearchValue] = useState(() => {
    const params = new URLSearchParams(queryString);
    return params.get("citta") || "";
  });

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const urlCitta = params.get("citta") || "";
    setSearchValue(urlCitta);
  }, [queryString]);

  const handleSearch = (value: string) => {
    const newSearchParams = new URLSearchParams(queryString);
    
    if (value.trim() === "") {
      newSearchParams.delete("citta");
    } else {
      newSearchParams.set("citta", value.trim());
    }
    
    newSearchParams.delete("page");
    
    const newQueryString = newSearchParams.toString();
    const newLocation = newQueryString ? `${currentPath}?${newQueryString}` : currentPath;
    setLocation(newLocation);
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
