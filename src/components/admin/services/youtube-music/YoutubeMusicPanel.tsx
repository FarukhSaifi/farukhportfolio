"use client";

import { MusicServicePanel } from "@/components/admin/services/MusicServicePanel";
import { useYoutubeMusicAuth } from "@/hooks/useYoutubeMusic";
import { ADMIN_UI } from "@/lib/constants";

export function YoutubeMusicPanel() {
  const { isConnected, loading: connectionLoading, authenticate, disconnect, refreshToken } = useYoutubeMusicAuth();

  return (
    <MusicServicePanel
      copy={ADMIN_UI.YOUTUBE_MUSIC}
      isConnected={isConnected}
      connectionLoading={connectionLoading}
      previewLoading={false}
      payload={null}
      hidePreview
      authenticate={authenticate}
      refreshToken={refreshToken}
      disconnect={disconnect}
    />
  );
}
