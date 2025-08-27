"use client";

import { Flex, Icon, SmartLink, Text } from "@/once-ui/components";
import { useEffect, useState } from "react";

interface Track {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

interface SpotifyData {
  isPlaying: boolean;
  track: Track | null;
}

export const NowPlayingBanner = () => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrack = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/spotify/now-playing");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SpotifyData = await response.json();
      setSpotifyData(data);
    } catch (err) {
      console.error("Failed to fetch Spotify data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();

    // Refresh every 1 minute
    const interval = setInterval(fetchTrack, 60000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if loading, error, or not playing
  if (isLoading || error || !spotifyData?.isPlaying || !spotifyData?.track) {
    return null;
  }

  const { track } = spotifyData;

  return (
    <Flex
      gap="8"
      alignItems="center"
      paddingX="12"
      paddingY="4"
      background="brand-alpha-weak"
      border="brand-alpha-medium"
      radius="full"
      marginLeft="12"
      hide="s"
    >
      <Icon name="music" onBackground="brand-weak" size="s" />
      <Flex direction="column" gap="2" maxWidth="xl">
        <Text variant="body-default-xs" wrap="nowrap" onBackground="brand-weak">
          {track.title}
        </Text>
        <Text variant="body-default-xs" wrap="nowrap" onBackground="brand-weak">
          {track.artist}
        </Text>
      </Flex>
      <SmartLink
        href={track.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        prefixIcon="externalLink"
      >
        Open
      </SmartLink>
    </Flex>
  );
};

export default NowPlayingBanner;
