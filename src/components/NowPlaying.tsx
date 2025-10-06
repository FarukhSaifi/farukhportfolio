"use client";

import { useSpotifyNowPlaying } from "@/hooks/useSpotify";
import { useToast } from "@/hooks/useToast";
import { Avatar, Button, Flex, Icon, RevealFx, Spinner } from "@/once-ui/components";
import { useEffect, useState } from "react";
import MarqueeTextCSS from "./MarqueeTextCSS";
import PublicNowPlaying from "./PublicNowPlaying";

export default function NowPlaying() {
  const { payload, loading, error } = useSpotifyNowPlaying();
  const { error: showError, info } = useToast();
  const [hover, setHover] = useState(false);
  const [lastTrack, setLastTrack] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        setIsAuthenticated(data.success && data.data?.isAuthenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show toast notifications for track changes
  useEffect(() => {
    if (payload?.isPlaying && payload.track) {
      const currentTrack = `${payload.track.title} - ${payload.track.artist}`;

      if (lastTrack && lastTrack !== currentTrack) {
        info("Now Playing", `🎵 ${payload.track.title} by ${payload.track.artist}`);
      }

      setLastTrack(currentTrack);
    } else if (payload && !payload.isPlaying && lastTrack) {
      info("Music Stopped", "No music is currently playing");
      setLastTrack(null);
    }
  }, [payload, lastTrack, info]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showError("Spotify Error", error);
    }
  }, [error, showError]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <Flex gap="s" alignItems="center">
        <Spinner size="s" />
      </Flex>
    );
  }

  // If not authenticated, show public component
  if (!isAuthenticated) {
    return <PublicNowPlaying />;
  }

  // If authenticated, show admin component with full functionality
  if (loading) {
    return (
      <Flex gap="s" alignItems="center">
        <Spinner size="s" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Button
        variant="secondary"
        size="s"
        onClick={() => (window.location.href = "/spotify-auth")}
        className="text-sm text-blue-500 hover:underline"
        title={error}
      >
        <Icon name="spotify" size="s" style={{ marginRight: "0.5rem", marginBottom: "0rem", marginTop: "-0.25rem" }} />
        Connect Spotify
      </Button>
    );
  }

  if (!payload || !payload.isPlaying || !payload.track) {
    return null;
  }

  const track = payload.track;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <RevealFx translateY="12" delay={0.4} justifyContent="flex-start">
        <Button id="about" data-border="rounded" href={track.songUrl || "#"} variant="secondary" size="l" arrowIcon>
          <Flex gap="8" alignItems="center">
            {track.imageUrl && (
              <Avatar style={{ marginLeft: "-1.5rem", marginRight: "0.25rem" }} src={track.imageUrl} size="l" />
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
          <Flex gap="12" alignItems="center">
            {track.imageUrl && <Avatar src={track.imageUrl} size="l" />}
            <Flex direction="column" gap="4" style={{ minWidth: 0 }}>
              <div style={{ color: "var(--on-background-strong)", fontWeight: 600 }}>
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
