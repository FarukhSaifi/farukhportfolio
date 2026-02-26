"use client";

import {
  SPOTIFY_QUERY_KEYS,
  SPOTIFY_STATUS,
  SPOTIFY_UI,
} from "@/lib/constants";
import { Flex, Heading, Text } from "@once-ui-system/core";
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
    const spotify = searchParams?.get(SPOTIFY_QUERY_KEYS.SPOTIFY);
    const token = searchParams?.get(SPOTIFY_QUERY_KEYS.TOKEN);

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

  const isSuccess = spotifyStatus === SPOTIFY_STATUS.SUCCESS;

  return (
    <Flex
      direction="column"
      fillWidth
      gap="m"
      marginBottom="xl"
      padding="l"
      background={isSuccess ? "brand-alpha-weak" : "accent-alpha-weak"}
      border={isSuccess ? "brand-alpha-medium" : "accent-alpha-medium"}
      radius="m"
    >
      <Heading
        variant="heading-strong-m"
        onBackground={isSuccess ? "brand-weak" : "accent-weak"}
      >
        {isSuccess ? SPOTIFY_UI.TITLE_CONNECTED : SPOTIFY_UI.TITLE_ERROR}
      </Heading>

      {isSuccess && refreshToken && (
        <>
          <Text variant="body-default-m" onBackground="brand-weak">
            {SPOTIFY_UI.MESSAGE_CONNECTED}
          </Text>
          <Text variant="body-default-s" onBackground="brand-weak">
            <strong>{SPOTIFY_UI.LABEL_REFRESH_TOKEN}</strong> {refreshToken}
          </Text>
          <Text variant="body-default-xs" onBackground="brand-weak">
            {SPOTIFY_UI.INSTRUCTION_TOKEN} {SPOTIFY_UI.ENV_VAR_NAME}
          </Text>
        </>
      )}

      {spotifyStatus === SPOTIFY_STATUS.ERROR && (
        <Text variant="body-default-m" onBackground="accent-weak">
          {SPOTIFY_UI.MESSAGE_ERROR}
        </Text>
      )}
    </Flex>
  );
}
