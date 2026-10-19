"use client";

import { ADMIN_SERVICE_IDS, ADMIN_UI, DEFAULT_ADMIN_SERVICE_ID } from "@/lib/constants";
import type { AdminServiceDefinition, AdminServiceId } from "@/lib/interfaces";
import { AppleMusicPanel } from "./apple-music/AppleMusicPanel";
import { SpotifyPanel } from "./spotify/SpotifyPanel";
import { YoutubeMusicPanel } from "./youtube-music/YoutubeMusicPanel";

export type { AdminServiceDefinition, AdminServiceId } from "@/lib/interfaces";
export { DEFAULT_ADMIN_SERVICE_ID };

/**
 * Service registry for the admin dashboard.
 * Add a panel module + a row here (and wire `enabled`) to grow the tab bar.
 */
export const ADMIN_SERVICES: AdminServiceDefinition[] = [
  {
    id: ADMIN_SERVICE_IDS.SPOTIFY,
    label: ADMIN_UI.SPOTIFY.HEADING,
    enabled: true,
    Panel: SpotifyPanel,
  },
  {
    id: ADMIN_SERVICE_IDS.YOUTUBE_MUSIC,
    label: ADMIN_UI.YOUTUBE_MUSIC.HEADING,
    enabled: true,
    Panel: YoutubeMusicPanel,
  },
  {
    id: ADMIN_SERVICE_IDS.APPLE_MUSIC,
    label: ADMIN_UI.APPLE_MUSIC.HEADING,
    enabled: true,
    Panel: AppleMusicPanel,
  },
];

export function isAdminServiceId(value: string | null | undefined): value is AdminServiceId {
  return ADMIN_SERVICES.some((service) => service.id === value);
}

export function getAdminService(id: AdminServiceId): AdminServiceDefinition {
  return ADMIN_SERVICES.find((service) => service.id === id) ?? ADMIN_SERVICES[0];
}
