"use client";

import { usePriorityMusicNowPlaying } from "@/hooks/useMusicNowPlaying";
import { APPLE_MUSIC_UI, DATABASE_CONFIG, NOW_PLAYING_UI, SPOTIFY_UI } from "@/lib/constants";
import type { MusicDisplaySource } from "@/lib/interfaces";
import { Avatar, Button, Flex, RevealFx, Spinner, Text } from "@once-ui-system/core";
import { useState } from "react";
import MarqueeTextCSS from "./MarqueeTextCSS";

function statusLabelFor(isPlaying: boolean, source: MusicDisplaySource | null | undefined): string {
  if (isPlaying) {
    return SPOTIFY_UI.CURRENTLY_LISTENING_LABEL;
  }
  if (source === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC) {
    return APPLE_MUSIC_UI.LAST_PLAYED_LABEL;
  }
  return SPOTIFY_UI.LAST_PLAYED_LABEL;
}

/**
 * About-page currently listening / last-played widget.
 * Uses `/api/music/public-now-playing?service=all`:
 * Spotify live → freshest non–YouTube Music last-played within 30 min; else hidden.
 * Never shows youtube_music-labeled rows.
 */
export default function NowPlaying() {
  const { payload, loading, source } = usePriorityMusicNowPlaying();
  const [hover, setHover] = useState(false);

  if (loading) {
    return (
      <Flex gap="s" vertical="center">
        <Spinner size="s" />
      </Flex>
    );
  }

  // About never surfaces YouTube Music (live or last-played).
  if (!payload?.track || source === DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC) {
    return null;
  }

  const track = payload.track;
  const showLiveBadge = Boolean(payload.isPlaying);
  const statusLabel = statusLabelFor(showLiveBadge, source);
  const unoptimizedImage = NOW_PLAYING_UI.UNOPTIMIZED_IMAGE_HOST_MARKERS.some((marker) =>
    track.imageUrl.includes(marker),
  );
  const hoverPanel = NOW_PLAYING_UI.HOVER_PANEL;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <RevealFx translateY="12" delay={0.4} horizontal="start">
        <Flex direction="column" gap="4" horizontal="center">
          <Text variant="label-default-s" onBackground={showLiveBadge ? "brand-weak" : "neutral-weak"}>
            {statusLabel}
          </Text>
          <Button
            id={NOW_PLAYING_UI.BUTTON_ID}
            data-border="rounded"
            href={track.songUrl || NOW_PLAYING_UI.FALLBACK_HREF}
            variant="secondary"
            size="l"
            arrowIcon
          >
            <Flex gap="8" vertical="center">
              {track.imageUrl ? (
                <Avatar
                  style={{
                    marginLeft: NOW_PLAYING_UI.AVATAR_MARGIN_LEFT,
                    marginRight: NOW_PLAYING_UI.AVATAR_MARGIN_RIGHT,
                  }}
                  src={track.imageUrl}
                  size="l"
                  unoptimized={unoptimizedImage}
                />
              ) : null}
              <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
                <MarqueeTextCSS maxWidth={NOW_PLAYING_UI.MARQUEE_MAX_WIDTH_BUTTON}>{track.title}</MarqueeTextCSS>
                {showLiveBadge && track.artist ? (
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    <MarqueeTextCSS maxWidth={NOW_PLAYING_UI.MARQUEE_MAX_WIDTH_BUTTON}>{track.artist}</MarqueeTextCSS>
                  </Text>
                ) : null}
              </Flex>
            </Flex>
          </Button>
        </Flex>
      </RevealFx>

      {hover ? (
        <div
          style={{
            position: "absolute",
            top: hoverPanel.TOP,
            left: 0,
            zIndex: hoverPanel.Z_INDEX,
            minWidth: hoverPanel.MIN_WIDTH,
            background: "var(--surface-background)",
            border: "1px solid var(--neutral-alpha-weak)",
            borderRadius: hoverPanel.BORDER_RADIUS,
            boxShadow: hoverPanel.BOX_SHADOW,
            padding: hoverPanel.PADDING,
          }}
        >
          <Flex gap="12" vertical="center">
            {track.imageUrl ? <Avatar src={track.imageUrl} size="l" unoptimized={unoptimizedImage} /> : null}
            <Flex direction="column" gap="4" style={{ minWidth: 0 }}>
              <div style={{ color: "var(--neutral-weak)", fontSize: hoverPanel.STATUS_FONT_SIZE }}>{statusLabel}</div>
              <div style={{ color: "var(--on-background-strong)", fontWeight: hoverPanel.TITLE_FONT_WEIGHT }}>
                <MarqueeTextCSS maxWidth={NOW_PLAYING_UI.MARQUEE_MAX_WIDTH_HOVER}>{track.title}</MarqueeTextCSS>
              </div>
              <div style={{ color: "var(--neutral-weak)", fontSize: hoverPanel.META_FONT_SIZE }}>
                <MarqueeTextCSS maxWidth={NOW_PLAYING_UI.MARQUEE_MAX_WIDTH_HOVER}>{track.artist}</MarqueeTextCSS>
              </div>
              <div style={{ color: "var(--neutral-weak)", fontSize: hoverPanel.META_FONT_SIZE }}>
                <MarqueeTextCSS maxWidth={NOW_PLAYING_UI.MARQUEE_MAX_WIDTH_HOVER}>{track.album}</MarqueeTextCSS>
              </div>
            </Flex>
          </Flex>
        </div>
      ) : null}
    </div>
  );
}
