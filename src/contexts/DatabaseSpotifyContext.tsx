"use client";

import { useToast } from "@/hooks/useToast";
import { ClientSpotifyUtils } from "@/lib/utils";
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
  refreshAccessToken: () => Promise<boolean>;
  getValidAccessToken: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

const DatabaseSpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useDatabaseSpotify = () => {
  const context = useContext(DatabaseSpotifyContext);
  if (!context) {
    throw new Error("useDatabaseSpotify must be used within a DatabaseSpotifyProvider");
  }
  return context;
};

export const DatabaseSpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<SpotifyTokens>({
    refreshToken: null,
    accessToken: null,
    accessTokenExpiry: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError, info } = useToast();

  // Load tokens from database on mount
  useEffect(() => {
    const loadTokensFromDatabase = async () => {
      try {
        console.log("🔍 DatabaseSpotifyContext: Loading tokens from database...");
        setLoading(true);
        setError(null);

        const response = await fetch("/api/spotify/get-token");

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const { access_token, refresh_token, expires_in } = data.data;
            const expiry = expires_in ? Date.now() + expires_in * 1000 : null;

            console.log("✅ DatabaseSpotifyContext: Found tokens in database");
            setTokens({
              refreshToken: refresh_token,
              accessToken: access_token,
              accessTokenExpiry: expiry,
            });
            info("Spotify Connected", "Your Spotify tokens are loaded from the database");
          } else {
            console.log("ℹ️ DatabaseSpotifyContext: No tokens found in database");
            setTokens({
              refreshToken: null,
              accessToken: null,
              accessTokenExpiry: null,
            });
          }
        } else {
          console.log("⚠️ DatabaseSpotifyContext: Failed to load tokens from database");
          setTokens({
            refreshToken: null,
            accessToken: null,
            accessTokenExpiry: null,
          });
        }
      } catch (err: any) {
        console.error("❌ DatabaseSpotifyContext: Error loading tokens:", err);
        setError(err.message);
        showError("Database Error", `Failed to load Spotify tokens: ${err.message}`);
        setTokens({
          refreshToken: null,
          accessToken: null,
          accessTokenExpiry: null,
        });
      } finally {
        setLoading(false);
      }
    };

    loadTokensFromDatabase();
  }, [info, showError]);

  const updateRefreshToken = async (token: string) => {
    console.log("🔄 DatabaseSpotifyContext: Updating refresh token");
    setTokens((prev) => ({ ...prev, refreshToken: token }));
  };

  const updateAccessToken = async (token: string, expiresIn: number = 3600) => {
    console.log("🔄 DatabaseSpotifyContext: Updating access token");
    const expiry = Date.now() + expiresIn * 1000;
    setTokens((prev) => ({ ...prev, accessToken: token, accessTokenExpiry: expiry }));
  };

  const clearTokens = async () => {
    console.log("🗑️ DatabaseSpotifyContext: Clearing all tokens");
    setTokens({
      refreshToken: null,
      accessToken: null,
      accessTokenExpiry: null,
    });
  };

  const hasValidAccessToken = (): boolean => {
    if (!tokens.accessToken || !tokens.accessTokenExpiry) return false;
    return Date.now() < tokens.accessTokenExpiry;
  };

  const hasRefreshToken = (): boolean => {
    return !!tokens.refreshToken;
  };

  const getTokenForAPI = (): string | null => {
    // First try to get a valid access token
    if (hasValidAccessToken()) {
      console.log("🔑 Using access token for API call");
      return tokens.accessToken;
    }

    // Fallback to refresh token
    if (hasRefreshToken()) {
      console.log("🔄 No valid access token, using refresh token for API call");
      return tokens.refreshToken;
    }

    console.log("❌ No tokens available for API call");
    return null;
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!tokens.refreshToken) {
      console.error("No refresh token available");
      return false;
    }

    try {
      console.log("🔄 Refreshing access token...");

      // Call the API to refresh the token
      const response = await fetch("/api/spotify/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          updateAccessToken(data.data.access_token, data.data.expires_in);
          info("Token Refreshed", "Spotify access token has been refreshed");
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      showError("Token Refresh Failed", "Failed to refresh Spotify token");
    }
    return false;
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!tokens.accessToken) {
      return null;
    }

    // Check if token is about to expire (5 minutes buffer)
    if (tokens.accessTokenExpiry && ClientSpotifyUtils.isTokenAboutToExpire(tokens.accessTokenExpiry, 5)) {
      console.log("🔄 Token is about to expire, refreshing...");
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return tokens.accessToken; // Updated token
      }
    }

    return tokens.accessToken;
  };

  const contextValue: SpotifyContextType = {
    tokens,
    updateRefreshToken,
    updateAccessToken,
    clearTokens,
    hasValidAccessToken,
    hasRefreshToken,
    getTokenForAPI,
    refreshAccessToken,
    getValidAccessToken,
    loading,
    error,
  };

  return <DatabaseSpotifyContext.Provider value={contextValue}>{children}</DatabaseSpotifyContext.Provider>;
};
