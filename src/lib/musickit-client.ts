import { APPLE_MUSIC_CONFIG, ERROR_MESSAGES } from "@/lib/constants";
import type { MusicKitGlobal } from "@/lib/interfaces";

declare global {
  interface Window {
    MusicKit?: MusicKitGlobal;
  }
}

function loadMusicKitScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error(ERROR_MESSAGES.APPLE_MUSIC.SCRIPT_LOAD_FAILED));
  }
  if (window.MusicKit) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${APPLE_MUSIC_CONFIG.MUSICKIT_SCRIPT_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(ERROR_MESSAGES.APPLE_MUSIC.SCRIPT_LOAD_FAILED)), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = APPLE_MUSIC_CONFIG.MUSICKIT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(ERROR_MESSAGES.APPLE_MUSIC.SCRIPT_LOAD_FAILED));
    document.head.appendChild(script);
  });
}

/**
 * Configure MusicKit with a server-issued developer JWT and prompt the user
 * for a Music User Token via authorize().
 */
export async function authorizeAppleMusicUser(developerToken: string, musicKitId: string): Promise<string> {
  await loadMusicKitScript();
  if (!window.MusicKit) {
    throw new Error(ERROR_MESSAGES.APPLE_MUSIC.SCRIPT_LOAD_FAILED);
  }

  const music = await window.MusicKit.configure({
    developerToken,
    app: {
      name: musicKitId,
      build: APPLE_MUSIC_CONFIG.MUSICKIT_APP_BUILD,
    },
  });

  const userToken = await music.authorize();
  if (!userToken || typeof userToken !== "string") {
    throw new Error(ERROR_MESSAGES.APPLE_MUSIC.AUTH_CANCELLED);
  }
  return userToken;
}
