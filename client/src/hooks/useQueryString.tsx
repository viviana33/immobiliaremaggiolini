import { useMemo, useCallback, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook per gestire query string URL.
 * Sincronizza wouter location con window.location.search per gestire correttamente i query parameters.
 */
export function useQueryString() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState(() => window.location.search);
  
  // Sincronizza search con window.location.search quando location cambia
  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);
  
  // Estrai search params da window.location.search
  const searchParams = useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  // Funzione per aggiornare i parametri URL
  const updateParams = useCallback((
    updates: Record<string, string | null>, 
    options?: { deletePage?: boolean }
  ) => {
    // Leggi SEMPRE dall'URL del browser (window.location) per avere i parametri più recenti
    // Questo previene race conditions quando setLocation non ha ancora aggiornato wouter
    const currentUrl = new URL(window.location.href);
    const currentPath = currentUrl.pathname;
    const newParams = new URLSearchParams(currentUrl.search);
    
    // Applica gli aggiornamenti
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'tutti' || value === 'recente') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Rimuovi page se richiesto (default: true quando si applicano filtri)
    if (options?.deletePage !== false) {
      newParams.delete('page');
    }
    
    // Costruisci nuovo URL
    const newSearch = newParams.toString();
    const newLocation = newSearch ? `${currentPath}?${newSearch}` : currentPath;
    
    // Aggiorna location tramite wouter
    setLocation(newLocation);
  }, [setLocation]);

  return {
    searchParams,
    updateParams,
    get: (key: string) => searchParams.get(key),
    getAll: () => Object.fromEntries(searchParams.entries()),
    queryString: searchParams.toString(),
  };
}
