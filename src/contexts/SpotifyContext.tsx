"use client";

import { SpotifyClient } from "@/utils/spotifyClient";
import React, { createContext, useContext, useEffect, useState } from "react";

interface SpotifyTokens {
  refreshToken: string | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
}

interface SpotifyContextType {
  tokens: SpotifyTokens;
  updateRefreshToken: (token: string) => void;
  updateAccessToken: (token: string, expiresIn?: number) => void;
  clearTokens: () => void;
  hasValidAccessToken: () => boolean;
  hasRefreshToken: () => boolean;
  getTokenForAPI: () => string | null;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
};

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<SpotifyTokens>({
    refreshToken: null,
    accessToken: null,
    accessTokenExpiry: null,
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    console.log("🔍 SpotifyContext: Loading tokens from localStorage...");

    const refreshToken = SpotifyClient.getStoredToken();
    const accessToken = SpotifyClient.getStoredAccessToken();
    const accessTokenExpiry = SpotifyClient.getStoredAccessTokenExpiry();

    console.log("🔍 SpotifyContext: Found tokens:", {
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken,
      accessTokenExpiry: accessTokenExpiry ? new Date(accessTokenExpiry).toISOString() : null,
    });

    setTokens({
      refreshToken,
      accessToken,
      accessTokenExpiry,
    });
  }, []);

  const updateRefreshToken = (token: string) => {
    console.log("🔄 SpotifyContext: Updating refresh token");
    SpotifyClient.storeToken(token);
    setTokens((prev) => ({ ...prev, refreshToken: token }));
  };

  const updateAccessToken = (token: string, expiresIn: number = 3600) => {
    console.log("🔄 SpotifyContext: Updating access token");
    SpotifyClient.storeAccessToken(token, expiresIn);
    const expiry = Date.now() + expiresIn * 1000;
    setTokens((prev) => ({ ...prev, accessToken: token, accessTokenExpiry: expiry }));
  };

  const clearTokens = () => {
    console.log("🗑️ SpotifyContext: Clearing all tokens");
    SpotifyClient.clearAllTokens();
    setTokens({
      refreshToken: null,
      accessToken: null,
      accessTokenExpiry: null,
    });
  };

  const hasValidAccessToken = (): boolean => {
    return SpotifyClient.hasValidAccessToken();
  };

  const hasRefreshToken = (): boolean => {
    return SpotifyClient.hasToken();
  };

  const getTokenForAPI = (): string | null => {
    return SpotifyClient.getTokenForAPI();
  };

  const contextValue: SpotifyContextType = {
    tokens,
    updateRefreshToken,
    updateAccessToken,
    clearTokens,
    hasValidAccessToken,
    hasRefreshToken,
    getTokenForAPI,
  };

  return <SpotifyContext.Provider value={contextValue}>{children}</SpotifyContext.Provider>;
};
