"use client";

import { MusicServicePanel } from "@/components/admin/services/MusicServicePanel";
import { usePublicSpotifyNowPlaying, useSpotifyAuth } from "@/hooks/useSpotify";
import { ADMIN_UI } from "@/lib/constants";

export function SpotifyPanel() {
  const { isConnected, loading: connectionLoading, authenticate, disconnect, refreshToken } = useSpotifyAuth();
  const { payload, loading: previewLoading } = usePublicSpotifyNowPlaying();

  return (
    <MusicServicePanel
      copy={ADMIN_UI.SPOTIFY}
      isConnected={isConnected}
      connectionLoading={connectionLoading}
      previewLoading={previewLoading}
      payload={payload}
      authenticate={authenticate}
      refreshToken={refreshToken}
      disconnect={disconnect}
    />
  );
}
