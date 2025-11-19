import { useMemo, useCallback, useState, useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'wouter';

// Store esterno per sincronizzare window.location.search con React
function getSearchSnapshot() {
  return window.location.search;
}

function subscribeToSearch(callback: () => void) {
  // Listener per popstate (back/forward del browser)
  window.addEventListener('popstate', callback);
  
  // Listener personalizzato per quando setLocation viene chiamato
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    callback();
  };
  
  window.history.replaceState = function(...args) {
    originalReplaceState.apply(window.history, args);
    callback();
  };
  
  return () => {
    window.removeEventListener('popstate', callback);
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  };
}

/**
 * Hook per gestire query string URL.
 * Usa useSyncExternalStore per sincronizzare automaticamente con window.location.search.
 */
export function useQueryString() {
  const [, setLocation] = useLocation();
  
  // Sincronizza con window.location.search usando useSyncExternalStore
  const search = useSyncExternalStore(subscribeToSearch, getSearchSnapshot, getSearchSnapshot);
  
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
