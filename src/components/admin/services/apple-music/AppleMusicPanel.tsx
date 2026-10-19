"use client";

import { MusicServicePanel } from "@/components/admin/services/MusicServicePanel";
import { useAppleMusicAuth, usePublicAppleMusicNowPlaying } from "@/hooks/useAppleMusic";
import { ADMIN_UI } from "@/lib/constants";

export function AppleMusicPanel() {
  const { isConnected, loading: connectionLoading, authenticate, disconnect, refreshToken } = useAppleMusicAuth();
  const { payload, loading: previewLoading } = usePublicAppleMusicNowPlaying();

  return (
    <MusicServicePanel
      copy={ADMIN_UI.APPLE_MUSIC}
      isConnected={isConnected}
      connectionLoading={connectionLoading}
      previewLoading={previewLoading}
      payload={payload}
      connectMode="async"
      unoptimizedPreviewImage
      treatIdleAsLastPlayed
      authenticate={authenticate}
      refreshToken={refreshToken}
      disconnect={disconnect}
    />
  );
}
