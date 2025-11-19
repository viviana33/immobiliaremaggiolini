import { useMemo, useCallback, useSyncExternalStore } from 'react';
import { useLocation } from 'wouter';

// Singleton store per gestire i listener dell'URL
// Questo garantisce che i listener rimangano attivi finché almeno un componente li usa
class URLSearchStore {
  private listeners = new Set<() => void>();
  private originalPushState: typeof window.history.pushState | null = null;
  private originalReplaceState: typeof window.history.replaceState | null = null;
  
  getSnapshot() {
    return window.location.search;
  }
  
  subscribe(callback: () => void) {
    // Aggiungi il listener al set
    this.listeners.add(callback);
    
    // Se è il primo listener, inizializza i wrapper
    if (this.listeners.size === 1) {
      this.initializeHistoryWrappers();
    }
    
    // Ritorna funzione di cleanup
    return () => {
      this.listeners.delete(callback);
      
      // Se non ci sono più listener, ripristina i metodi originali
      if (this.listeners.size === 0) {
        this.cleanupHistoryWrappers();
      }
    };
  }
  
  private initializeHistoryWrappers() {
    // Salva i metodi originali
    this.originalPushState = window.history.pushState.bind(window.history);
    this.originalReplaceState = window.history.replaceState.bind(window.history);
    
    // Listener per popstate (back/forward del browser)
    window.addEventListener('popstate', this.notifyListeners);
    
    // Wrapper per pushState
    window.history.pushState = (...args) => {
      this.originalPushState!.apply(window.history, args);
      this.notifyListeners();
    };
    
    // Wrapper per replaceState
    window.history.replaceState = (...args) => {
      this.originalReplaceState!.apply(window.history, args);
      this.notifyListeners();
    };
  }
  
  private cleanupHistoryWrappers() {
    // Rimuovi listener popstate
    window.removeEventListener('popstate', this.notifyListeners);
    
    // Ripristina metodi originali
    if (this.originalPushState) {
      window.history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      window.history.replaceState = this.originalReplaceState;
    }
    
    this.originalPushState = null;
    this.originalReplaceState = null;
  }
  
  private notifyListeners = () => {
    this.listeners.forEach(listener => listener());
  };
}

// Singleton instance
const urlSearchStore = new URLSearchStore();

/**
 * Hook per gestire query string URL.
 * Usa useSyncExternalStore per sincronizzare automaticamente con window.location.search.
 */
export function useQueryString() {
  const [, setLocation] = useLocation();
  
  // Sincronizza con window.location.search usando useSyncExternalStore e il singleton store
  const search = useSyncExternalStore(
    urlSearchStore.subscribe.bind(urlSearchStore),
    urlSearchStore.getSnapshot.bind(urlSearchStore),
    urlSearchStore.getSnapshot.bind(urlSearchStore)
  );
  
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
