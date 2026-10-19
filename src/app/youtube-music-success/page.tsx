"use client";

import { useToast } from "@/hooks/useToast";
import {
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  ROUTES,
  YOUTUBE_MUSIC_CONFIG,
  YOUTUBE_MUSIC_UI,
  musicApiUrl,
} from "@/lib/constants";
import { Button, Card, Flex, Heading, Spinner, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Google OAuth callback. Exchanges the code server-side; tokens never reach the browser.
 */
export default function YoutubeMusicSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const hasExecuted = useRef(false);

  const exchangeCode = useCallback(async () => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthError = urlParams.get(YOUTUBE_MUSIC_CONFIG.QUERY.ERROR);
      const code = urlParams.get(YOUTUBE_MUSIC_CONFIG.QUERY.CODE);
      const state = urlParams.get(YOUTUBE_MUSIC_CONFIG.QUERY.STATE);

      if (oauthError) {
        const message =
          oauthError === YOUTUBE_MUSIC_CONFIG.QUERY.ACCESS_DENIED
            ? ERROR_MESSAGES.YOUTUBE_MUSIC.AUTH_CANCELLED
            : `${ERROR_MESSAGES.YOUTUBE_MUSIC.AUTH_FAILED} (${oauthError}). ${ERROR_MESSAGES.YOUTUBE_MUSIC.DASHBOARD_REDIRECT_HINT}`;
        setError(message);
        showError(YOUTUBE_MUSIC_UI.TOAST_AUTH_FAILED_TITLE, message);
        return;
      }

      if (!code) {
        setError(ERROR_MESSAGES.YOUTUBE_MUSIC.NO_AUTH_CODE);
        return;
      }

      const response = await fetch(
        musicApiUrl("EXCHANGE_CODE", DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC),
        {
          method: HTTP_METHODS.POST,
          headers: { [YOUTUBE_MUSIC_CONFIG.HEADERS.CONTENT_TYPE]: YOUTUBE_MUSIC_CONFIG.HEADERS.JSON },
          credentials: YOUTUBE_MUSIC_CONFIG.FETCH_CREDENTIALS,
          body: JSON.stringify({ code, state }),
        },
      );

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        const errorMessage = `${ERROR_MESSAGES.YOUTUBE_MUSIC.EXCHANGE_CODE_FAILED_PREFIX}${payload.error || ERROR_MESSAGES.YOUTUBE_MUSIC.AUTH_FAILED}`;
        setError(errorMessage);
        showError(YOUTUBE_MUSIC_UI.TOAST_EXCHANGE_FAILED_TITLE, errorMessage);
        return;
      }

      success(YOUTUBE_MUSIC_UI.TOAST_CONNECTED_TITLE, YOUTUBE_MUSIC_UI.TOKENS_SAVED_MESSAGE);
    } catch (err: unknown) {
      const errorMessage = `Error: ${err instanceof Error ? err.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR}`;
      setError(errorMessage);
      showError(YOUTUBE_MUSIC_UI.TOAST_CONNECTION_ERROR_TITLE, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [success, showError]);

  useEffect(() => {
    // PKCE cookies are host-bound; keep callback on loopback IP in local dev
    if (window.location.hostname === YOUTUBE_MUSIC_CONFIG.LOCALHOST_HOST) {
      const url = new URL(window.location.href);
      url.hostname = YOUTUBE_MUSIC_CONFIG.LOOPBACK_HOST;
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
            <Heading variant="display-strong-l">{YOUTUBE_MUSIC_UI.LOADING_PROCESSING}</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {YOUTUBE_MUSIC_UI.LOADING_EXCHANGING}
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
        <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m" maxWidth="l">
          <Flex direction="column" gap="l" horizontal="center">
            <Heading variant="heading-strong-l">{YOUTUBE_MUSIC_UI.ERROR_TITLE}</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {error}
            </Text>
            <Flex gap="m" wrap horizontal="center">
              <Button href={ROUTES.ADMIN} variant="primary">
                {YOUTUBE_MUSIC_UI.GO_TO_ADMIN}
              </Button>
              <Button
                href={musicApiUrl("AUTH", DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC)}
                variant="secondary"
              >
                {YOUTUBE_MUSIC_UI.TRY_AGAIN}
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    );
  }

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
      <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m" maxWidth="l">
        <Flex direction="column" gap="l" horizontal="center">
          <Heading variant="display-strong-l">{YOUTUBE_MUSIC_UI.SUCCESS_TITLE}</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {YOUTUBE_MUSIC_UI.TOKENS_SAVED_MESSAGE}
          </Text>
          <Button href={`${ROUTES.ADMIN}?tab=youtube-music`} variant="primary">
            {YOUTUBE_MUSIC_UI.GO_TO_ADMIN}
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
