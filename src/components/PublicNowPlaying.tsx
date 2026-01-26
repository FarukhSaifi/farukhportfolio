"use client";

import { usePublicSpotifyNowPlaying } from "@/hooks/useSpotify";
import { Avatar, Button, Flex, RevealFx, Spinner } from "@once-ui-system/core";
import { useState } from "react";
import MarqueeTextCSS from "./MarqueeTextCSS";

export default function PublicNowPlaying() {
  const { payload, loading, error } = usePublicSpotifyNowPlaying();
  const [hover, setHover] = useState(false);
  if (loading) {
    return (
      <Flex gap="s" vertical="center">
        <Spinner size="s" />
      </Flex>
    );
  }

  if (error) {
    return null;
  }

  if (!payload || !payload.isPlaying || !payload.track) {
    return null;
  }

  const track = payload.track;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHover((prev) => !prev)}
      onMouseLeave={() => setHover((prev) => !prev)}
    >
      <RevealFx translateY="12" delay={0.4} horizontal="start">
        <Button
          id="about"
          data-border="rounded"
          href={track.songUrl || "#"}
          variant="secondary"
          size="l"
          arrowIcon
        >
          <Flex gap="8" vertical="center">
            {track.imageUrl && (
              <Avatar
                style={{ marginLeft: "-1.5rem", marginRight: "0.25rem" }}
                src={track.imageUrl}
                size="l"
              />
            )}
            <MarqueeTextCSS maxWidth={180}>{track.title}</MarqueeTextCSS>
          </Flex>
        </Button>
      </RevealFx>

      {hover && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            zIndex: 20,
            minWidth: "260px",
            background: "var(--surface-background)",
            border: "1px solid var(--neutral-alpha-weak)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            padding: "12px",
          }}
        >
          <Flex gap="12" vertical="center">
            {track.imageUrl && <Avatar src={track.imageUrl} size="l" />}
            <Flex direction="column" gap="4" style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "var(--on-background-strong)",
                  fontWeight: 600,
                }}
              >
                <MarqueeTextCSS maxWidth={200}>{track.title}</MarqueeTextCSS>
              </div>
              <div style={{ color: "var(--neutral-weak)", fontSize: 12 }}>
                <MarqueeTextCSS maxWidth={200}>{track.artist}</MarqueeTextCSS>
              </div>
              <div style={{ color: "var(--neutral-weak)", fontSize: 12 }}>
                <MarqueeTextCSS maxWidth={200}>{track.album}</MarqueeTextCSS>
              </div>
            </Flex>
          </Flex>
        </div>
      )}
    </div>
  );
}
