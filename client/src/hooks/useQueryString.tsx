import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export function useQueryString() {
  const [_, setLocation] = useLocation();
  
  const [searchParams, setSearchParams] = useState(() => {
    return new URLSearchParams(window.location.search);
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

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
    setSearchParams(new URLSearchParams(newSearch));
  }, [setLocation]);

  return {
    searchParams,
    updateParams,
    get: (key: string) => searchParams.get(key),
    getAll: () => Object.fromEntries(searchParams.entries()),
    queryString: searchParams.toString(),
  };
}
