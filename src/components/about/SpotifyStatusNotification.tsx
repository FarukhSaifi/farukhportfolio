"use client";

import {
  Column,
  Flex,
  Heading,
  Text,
} from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Client component for displaying Spotify connection status
 * Handles URL search params for Spotify authentication callback
 */
export default function SpotifyStatusNotification() {
  const searchParams = useSearchParams();
  const [spotifyStatus, setSpotifyStatus] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const spotify = searchParams?.get("spotify");
    const token = searchParams?.get("token");

    if (spotify) {
      setSpotifyStatus(spotify);
      if (token) {
        setRefreshToken(token);
      }
    }
  }, [searchParams]);

  if (!spotifyStatus) {
    return null;
  }

  return (
    <Flex
      direction="column"
      fillWidth
      gap="m"
      marginBottom="xl"
      padding="l"
      background={
        spotifyStatus === "success"
          ? "brand-alpha-weak"
          : "accent-alpha-weak"
      }
      border={
        spotifyStatus === "success"
          ? "brand-alpha-medium"
          : "accent-alpha-medium"
      }
      radius="m"
    >
      <Heading
        variant="heading-strong-m"
        onBackground={
          spotifyStatus === "success" ? "brand-weak" : "accent-weak"
        }
      >
        {spotifyStatus === "success"
          ? "✅ Spotify Connected!"
          : "❌ Spotify Error"}
      </Heading>

      {spotifyStatus === "success" && refreshToken && (
        <>
          <Text variant="body-default-m" onBackground="brand-weak">
            Your Spotify account has been successfully connected!
          </Text>
          <Text variant="body-default-s" onBackground="brand-weak">
            <strong>Refresh Token:</strong> {refreshToken}
          </Text>
          <Text variant="body-default-xs" onBackground="brand-weak">
            Copy this token and add it to your .env.local file as
            SPOTIFY_REFRESH_TOKEN
          </Text>
        </>
      )}

      {spotifyStatus === "error" && (
        <Text variant="body-default-m" onBackground="accent-weak">
          There was an error connecting to Spotify. Please try again.
        </Text>
      )}
    </Flex>
  );
}
