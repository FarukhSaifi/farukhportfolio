"use client";

import { SPOTIFY_QUERY_KEYS, SPOTIFY_STATUS, SPOTIFY_UI } from "@/lib/constants";
import { Flex, Heading, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Displays Spotify connection status from URL params.
 * Never renders tokens or secrets.
 */
function SpotifyStatusNotificationContent() {
  const searchParams = useSearchParams();
  const [spotifyStatus, setSpotifyStatus] = useState<string | null>(null);

  useEffect(() => {
    const spotify = searchParams?.get(SPOTIFY_QUERY_KEYS.SPOTIFY);
    if (spotify) {
      setSpotifyStatus(spotify);
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
      <Heading variant="heading-strong-m" onBackground={isSuccess ? "brand-weak" : "accent-weak"}>
        {isSuccess ? SPOTIFY_UI.TITLE_CONNECTED : SPOTIFY_UI.TITLE_ERROR}
      </Heading>

      {isSuccess && (
        <Text variant="body-default-m" onBackground="brand-weak">
          {SPOTIFY_UI.MESSAGE_CONNECTED}
        </Text>
      )}

      {spotifyStatus === SPOTIFY_STATUS.ERROR && (
        <Text variant="body-default-m" onBackground="accent-weak">
          {SPOTIFY_UI.MESSAGE_ERROR}
        </Text>
      )}
    </Flex>
  );
}

export default function SpotifyStatusNotification() {
  return (
    <Suspense fallback={null}>
      <SpotifyStatusNotificationContent />
    </Suspense>
  );
}
