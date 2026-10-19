"use client";

import { useToast } from "@/hooks/useToast";
import {
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  ROUTES,
  SPOTIFY_CONFIG,
  SPOTIFY_UI,
  SUCCESS_MESSAGES,
  musicApiUrl,
} from "@/lib/constants";
import { Button, Card, Flex, Heading, Spinner, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * OAuth callback page. Exchanges the code via a server route; tokens never reach the browser.
 */
export default function SpotifySuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const hasExecuted = useRef(false);

  const exchangeCode = useCallback(async () => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const spotifyError = urlParams.get(SPOTIFY_CONFIG.QUERY.ERROR);
      const code = urlParams.get(SPOTIFY_CONFIG.QUERY.CODE);
      const state = urlParams.get(SPOTIFY_CONFIG.QUERY.STATE);

      if (spotifyError) {
        const message =
          spotifyError === SPOTIFY_CONFIG.QUERY.ACCESS_DENIED
            ? ERROR_MESSAGES.SPOTIFY.AUTH_CANCELLED
            : `${ERROR_MESSAGES.SPOTIFY.AUTH_FAILED} (Spotify: ${spotifyError}). ${ERROR_MESSAGES.SPOTIFY.DASHBOARD_REDIRECT_HINT}`;
        setError(message);
        showError(SPOTIFY_UI.TOAST_AUTH_FAILED_TITLE, message);
        return;
      }

      if (!code) {
        setError(ERROR_MESSAGES.SPOTIFY.NO_AUTH_CODE);
        return;
      }

      const response = await fetch(musicApiUrl("EXCHANGE_CODE", DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY), {
        method: HTTP_METHODS.POST,
        headers: { [SPOTIFY_CONFIG.HEADERS.CONTENT_TYPE]: SPOTIFY_CONFIG.HEADERS.JSON },
        credentials: SPOTIFY_CONFIG.FETCH_CREDENTIALS,
        body: JSON.stringify({ code, state }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        const errorMessage = `${ERROR_MESSAGES.SPOTIFY.EXCHANGE_CODE_FAILED_PREFIX}${payload.error || ERROR_MESSAGES.SPOTIFY.AUTH_FAILED}`;
        setError(errorMessage);
        showError(SPOTIFY_UI.TOAST_EXCHANGE_FAILED_TITLE, errorMessage);
        return;
      }

      success(SUCCESS_MESSAGES.SPOTIFY.CONNECTED_TOAST_TITLE, SUCCESS_MESSAGES.SPOTIFY.TOKENS_SAVED_TOAST);
    } catch (err: unknown) {
      const errorMessage = `Error: ${err instanceof Error ? err.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR}`;
      setError(errorMessage);
      showError(SPOTIFY_UI.TOAST_CONNECTION_ERROR_TITLE, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [success, showError]);

  useEffect(() => {
    // PKCE cookies are host-bound; keep callback on loopback IP in local dev
    if (window.location.hostname === SPOTIFY_CONFIG.LOCALHOST_HOST) {
      const url = new URL(window.location.href);
      url.hostname = SPOTIFY_CONFIG.LOOPBACK_HOST;
      window.location.replace(url.toString());
      return;
    }

    exchangeCode();
  }, [exchangeCode]);

  if (isLoading) {
    return (
      <Flex
        direction="column"
        fillWidth
        horizontal="center"
        vertical="center"
        style={{ position: "fixed", inset: 0, zIndex: 10 }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m">
          <Flex direction="column" gap="l" horizontal="center">
            <Spinner size="l" />
            <Heading variant="display-strong-l">{SPOTIFY_UI.LOADING_PROCESSING}</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {SPOTIFY_UI.LOADING_EXCHANGING}
            </Text>
          </Flex>
        </Card>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        direction="column"
        fillWidth
        horizontal="center"
        vertical="center"
        style={{ position: "fixed", inset: 0, zIndex: 10 }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card padding="xl" background="accent-alpha-weak" border="accent-alpha-medium" radius="m" maxWidth="l">
          <Flex direction="column" gap="l" style={{ alignItems: "center" }}>
            <Heading variant="display-strong-m" onBackground="accent-weak">
              {SPOTIFY_UI.ERROR_TITLE}
            </Heading>
            <Text variant="body-default-m" onBackground="accent-weak" style={{ textAlign: "center" }}>
              {error}
            </Text>
            <Button href={ROUTES.SPOTIFY_AUTH} variant="primary" size="l">
              {SPOTIFY_UI.TRY_AGAIN}
            </Button>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex style={{ minHeight: "50vh", justifyContent: "center", alignItems: "center" }}>
      <Card padding="xl" maxWidth="m">
        <Flex direction="column" gap="l" style={{ alignItems: "center" }}>
          <Heading variant="display-strong-m">{SPOTIFY_UI.SUCCESS_TITLE}</Heading>
          <Flex direction="column" gap="m" style={{ alignItems: "center" }}>
            <Text variant="body-default-m">{SPOTIFY_UI.MESSAGE_CONNECTED}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {SPOTIFY_UI.TOKENS_SAVED_MESSAGE}
            </Text>
          </Flex>
          <Flex gap="m">
            <Button href={ROUTES.HOME} variant="primary">
              {SPOTIFY_UI.GO_TO_HOME}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
