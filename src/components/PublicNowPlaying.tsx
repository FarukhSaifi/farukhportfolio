"use client";

import { Avatar, Card, Flex, Icon, Text } from "@/once-ui/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SimplifiedTrack {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

interface PublicNowPlayingPayload {
  isPlaying: boolean;
  track: SimplifiedTrack | null;
  timestamp: string;
}

type FetchResult = {
  ok: boolean;
  data?: PublicNowPlayingPayload;
  error?: string;
};

function usePublicNowPlaying() {
  const [payload, setPayload] = useState<PublicNowPlayingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pollTimerRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  const fetchPublicNowPlaying = useCallback(async (): Promise<FetchResult> => {
    try {
      const response = await fetch("/api/spotify/public-now-playing", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { ok: false, error: errorData.error || "Failed to fetch public now playing" };
      }

      const data = await response.json();
      return { ok: true, data: data.data };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;

    const poll = async () => {
      if (!isVisibleRef.current) return;

      const result = await fetchPublicNowPlaying();
      if (result.ok && result.data) {
        setPayload(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch public now playing");
      }
      setLoading(false);
    };

    // Initial fetch
    poll();

    // Poll every 30 seconds
    pollTimerRef.current = window.setInterval(poll, 30000);
  }, [fetchPublicNowPlaying]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current) {
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const value = useMemo(() => ({ payload, loading, error }), [payload, loading, error]);

  return value;
}

export default function PublicNowPlaying() {
  const { payload, loading, error } = usePublicNowPlaying();

  if (loading) {
    return (
      <Card padding="m" background="neutral-strong" border="neutral-medium" radius="m">
        <Flex gap="s" alignItems="center">
          <Icon name="music" onBackground="neutral-weak" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Loading public music...
          </Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="m" background="accent-alpha-weak" border="accent-alpha-medium" radius="m">
        <Flex gap="s" alignItems="center">
          <Icon name="music" onBackground="accent-weak" />
          <Text variant="body-default-s" onBackground="accent-weak">
            Public music unavailable
          </Text>
        </Flex>
      </Card>
    );
  }

  if (!payload || !payload.isPlaying || !payload.track) {
    return (
      <Card padding="m" background="neutral-strong" border="neutral-medium" radius="m">
        <Flex gap="s" alignItems="center">
          <Icon name="music" onBackground="neutral-weak" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            No public music playing
          </Text>
        </Flex>
      </Card>
    );
  }

  const track = payload.track;

  return (
    <Card padding="m" background="brand-alpha-weak" border="brand-alpha-medium" radius="m">
      <Flex gap="s" alignItems="center">
        {track.imageUrl && <Avatar src={track.imageUrl} size="s" />}
        <Flex direction="column" gap="xs">
          <Text variant="body-default-s" onBackground="brand-weak">
            <strong>Public Now Playing:</strong>
          </Text>
          <Text variant="heading-strong-xs" onBackground="brand-strong">
            {track.title}
          </Text>
          <Text variant="body-default-xs" onBackground="brand-weak">
            {track.artist}
          </Text>
        </Flex>
        <Icon name="chevronRight" onBackground="brand-weak" />
      </Flex>
    </Card>
  );
}
