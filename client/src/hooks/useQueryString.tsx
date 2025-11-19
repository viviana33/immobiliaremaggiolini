import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export function useQueryString() {
  const [_, setLocation] = useLocation();
  
  // Trigger per forzare re-render quando cambiano i params
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  useEffect(() => {
    // Ascolta cambiamenti di history (back/forward)
    const handlePopState = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Leggi sempre da window.location.search per evitare race conditions
  const searchParams = new URLSearchParams(window.location.search);

  const updateParams = useCallback((updates: Record<string, string | null>, options?: { deletePage?: boolean }) => {
    const currentPath = window.location.pathname;
    const newParams = new URLSearchParams(window.location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'tutti' || value === 'recente') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    if (options?.deletePage !== false) {
      newParams.delete('page');
    }
    
    const newSearch = newParams.toString();
    const newLocation = newSearch ? `${currentPath}?${newSearch}` : currentPath;
    
    setLocation(newLocation);
    // Aspetta che wouter aggiorni window.location, poi triggera re-render
    setTimeout(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 0);
  }, [setLocation]);

  return {
    searchParams,
    updateParams,
    get: (key: string) => searchParams.get(key),
    getAll: () => Object.fromEntries(searchParams.entries()),
    queryString: searchParams.toString(),
  };
}
