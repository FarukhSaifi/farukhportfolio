"use client";

import {
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  SPOTIFY_AUTH_ERROR,
  SPOTIFY_CONFIG,
  SPOTIFY_UI,
  musicApiUrl,
} from "@/lib/constants";
import { Button, Card, Flex, Heading, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SpotifyAuthPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Spotify rejects localhost; PKCE cookies are host-bound — stay on loopback IP locally
    if (window.location.hostname === SPOTIFY_CONFIG.LOCALHOST_HOST) {
      const url = new URL(window.location.href);
      url.hostname = SPOTIFY_CONFIG.LOOPBACK_HOST;
      window.location.replace(url.toString());
      return;
    }

    if (searchParams) {
      setError(searchParams.get(SPOTIFY_CONFIG.QUERY.ERROR));
      setMessage(searchParams.get(SPOTIFY_CONFIG.QUERY.MESSAGE));
    }
  }, [searchParams]);

  const handleAuth = () => {
    setIsLoading(true);
    const authUrl = new URL(musicApiUrl("AUTH", DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY), window.location.origin);
    window.location.href = authUrl.toString();
  };

  if (isLoading) {
    return (
      <Flex
        direction="column"
        horizontal="center"
        vertical="center"
        fillWidth
        style={{ position: "fixed", inset: 0, zIndex: 10 }}
        gap="xl"
        padding="xl"
      >
        <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m">
          <Flex direction="column" gap="l" horizontal="center">
            <Heading variant="display-strong-l">{SPOTIFY_UI.AUTH_LOADING}</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {SPOTIFY_UI.AUTH_PLEASE_WAIT}
            </Text>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      horizontal="center"
      vertical="center"
      fillWidth
      style={{ minHeight: "100vh" }}
      gap="xl"
      padding="xl"
    >
      <Card padding="xl" background="neutral-weak" border="neutral-alpha-medium" radius="m" maxWidth="l">
        <Flex direction="column" gap="l" horizontal="center" fillWidth>
          <Heading variant="display-strong-l">{SPOTIFY_UI.AUTH_TITLE}</Heading>
          {error ? (
            <Flex direction="column" gap="l" horizontal="center">
              <Card padding="l" background="accent-alpha-weak" border="accent-alpha-medium" radius="m" fillWidth>
                <Flex direction="column" gap="m" horizontal="center">
                  <Heading variant="heading-strong-m" onBackground="accent-weak">
                    {SPOTIFY_UI.AUTH_ERROR_TITLE}
                  </Heading>

                  {error === SPOTIFY_AUTH_ERROR.AUTH_FAILED && (
                    <Text variant="body-default-m" onBackground="accent-weak" style={{ textAlign: "center" }}>
                      {ERROR_MESSAGES.SPOTIFY.AUTH_CANCELLED}
                    </Text>
                  )}

                  {error === SPOTIFY_AUTH_ERROR.NO_CODE && (
                    <Text variant="body-default-m" onBackground="accent-weak" style={{ textAlign: "center" }}>
                      {ERROR_MESSAGES.SPOTIFY.NO_CODE_RECEIVED}
                    </Text>
                  )}

                  {error === SPOTIFY_AUTH_ERROR.TOKEN_EXCHANGE_FAILED && (
                    <Text variant="body-default-m" onBackground="accent-weak" style={{ textAlign: "center" }}>
                      {ERROR_MESSAGES.SPOTIFY.TOKEN_EXCHANGE_FAILED_PREFIX}
                      {message}
                    </Text>
                  )}

                  <Button onClick={handleAuth} variant="primary" size="l">
                    {SPOTIFY_UI.AUTH_TRY_AGAIN}
                  </Button>
                </Flex>
              </Card>
            </Flex>
          ) : (
            <Flex direction="column" gap="l" horizontal="center">
              <Text variant="body-default-l" onBackground="neutral-strong" style={{ textAlign: "center" }}>
                {SPOTIFY_UI.AUTH_INTRO}
              </Text>

              <Text variant="body-default-m" onBackground="neutral-weak" style={{ textAlign: "center" }}>
                {SPOTIFY_UI.AUTH_INTRO_DETAIL}
              </Text>

              <Text variant="body-default-s" onBackground="neutral-weak" style={{ textAlign: "center" }}>
                {SPOTIFY_UI.AUTH_ADMIN_NOTE}
              </Text>

              <Card padding="l" background="neutral-alpha-weak" border="neutral-alpha-medium" radius="m" fillWidth>
                <Flex direction="column" gap="m">
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <strong>{SPOTIFY_UI.AUTH_REQUIRED_PERMISSIONS}</strong>
                  </Text>
                  <Flex direction="column" gap="xs" horizontal="start" style={{ marginLeft: "1rem" }}>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {SPOTIFY_UI.AUTH_PERMISSION_CURRENTLY_PLAYING}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {SPOTIFY_UI.AUTH_PERMISSION_PLAYBACK_STATE}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {SPOTIFY_UI.AUTH_PERMISSION_RECENTLY_PLAYED}
                    </Text>
                  </Flex>
                </Flex>
              </Card>

              <Text variant="body-default-xs" onBackground="neutral-weak" style={{ textAlign: "center" }}>
                {SPOTIFY_UI.AUTH_AFTER_MESSAGE}
              </Text>

              <Button onClick={handleAuth} variant="primary" size="l">
                {SPOTIFY_UI.AUTH_AUTHORIZE_BUTTON}
              </Button>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}

export default function SpotifyAuthPage() {
  return (
    <Suspense
      fallback={
        <Flex
          direction="column"
          horizontal="center"
          vertical="center"
          fillWidth
          style={{ minHeight: "100vh" }}
          gap="xl"
          padding="xl"
        >
          <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m">
            <Flex direction="column" gap="l" horizontal="center">
              <Heading variant="display-strong-l">{SPOTIFY_UI.AUTH_LOADING}</Heading>
              <Text variant="body-default-l" onBackground="neutral-weak">
                {SPOTIFY_UI.AUTH_PLEASE_WAIT}
              </Text>
            </Flex>
          </Card>
        </Flex>
      }
    >
      <SpotifyAuthPageContent />
    </Suspense>
  );
}
