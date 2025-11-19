import { useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook per gestire query string URL usando SOLO wouter (no window.location).
 * Risolve race conditions sincronizzando perfettamente location e params.
 */
export function useQueryString() {
  const [location, setLocation] = useLocation();
  
  // Estrai search params da wouter location (format: "/path?query=value")
  const searchParams = useMemo(() => {
    const searchString = location.includes('?') ? location.split('?')[1] : '';
    return new URLSearchParams(searchString);
  }, [location]);

  // Funzione per aggiornare i parametri URL
  const updateParams = useCallback((
    updates: Record<string, string | null>, 
    options?: { deletePage?: boolean }
  ) => {
    // Ottieni path corrente e search params
    const [currentPath] = location.split('?');
    const newParams = new URLSearchParams(
      location.includes('?') ? location.split('?')[1] : ''
    );
    
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
    
    // Aggiorna location tramite wouter (sincrono dal punto di vista del componente)
    setLocation(newLocation);
  }, [location, setLocation]);

  return {
    searchParams,
    updateParams,
    get: (key: string) => searchParams.get(key),
    getAll: () => Object.fromEntries(searchParams.entries()),
    queryString: searchParams.toString(),
  };
}
