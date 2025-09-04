import { useState, useEffect } from 'react';

const STORAGE_KEY = 'spotify_refresh_token';

export function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem(STORAGE_KEY);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const storeToken = (newToken: string) => {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
    console.log('✅ Token stored in localStorage');
  };

  const clearToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    console.log('🗑️ Token cleared from localStorage');
  };

  const hasToken = !!token;

  return {
    token,
    setToken: storeToken,
    clearToken,
    hasToken,
    isLoading
  };
}
