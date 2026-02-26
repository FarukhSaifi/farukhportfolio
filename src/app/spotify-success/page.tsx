"use client";

import { useDatabaseSpotify } from "@/contexts/DatabaseSpotifyContext";
import { useToast } from "@/hooks/useToast";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  ROUTES,
  SPOTIFY_UI,
  SUCCESS_MESSAGES,
} from "@/lib/constants";
import {
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";

export default function SpotifySuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateRefreshToken, updateAccessToken } = useDatabaseSpotify();
  const { success, error: showError } = useToast();
  const hasExecuted = useRef(false);

  const exchangeCodeForTokens = useCallback(async () => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        setError(ERROR_MESSAGES.SPOTIFY.NO_AUTH_CODE);
        return;
      }

      const response = await fetch(API_ENDPOINTS.SPOTIFY.EXCHANGE_CODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const tokenData = await response.json();

        // Save token to MongoDB for public access
        const saveResponse = await fetch(API_ENDPOINTS.SPOTIFY.SAVE_TOKEN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
          }),
        });

        if (saveResponse.ok) {
          // Update context for current user
          updateRefreshToken(tokenData.refresh_token);
          updateAccessToken(tokenData.access_token, tokenData.expires_in);

          // Show success toast
          success(
            SUCCESS_MESSAGES.SPOTIFY.CONNECTED_TOAST_TITLE,
            SUCCESS_MESSAGES.SPOTIFY.TOKENS_SAVED_TOAST,
          );
        } else {
          const saveError = await saveResponse.json();
          const errorMessage = `Failed to save token: ${saveError.error}`;
          setError(errorMessage);
          showError("Save Failed", errorMessage);
        }
      } else {
        const errorData = await response.json();
        const errorMessage = `Failed to exchange code: ${errorData.error}`;
        setError(errorMessage);
        showError("Exchange Failed", errorMessage);
      }
    } catch (err: any) {
      const errorMessage = `Error: ${err.message}`;
      setError(errorMessage);
      showError("Connection Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [updateRefreshToken, updateAccessToken, success, showError]);

  useEffect(() => {
    exchangeCodeForTokens();
  }, [exchangeCodeForTokens]);

  if (isLoading) {
    return (
      <Flex
        direction="column"
        fillWidth
        style={{
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card
          padding="xl"
          background="neutral-strong"
          border="neutral-medium"
          radius="m"
        >
          <Flex direction="column" gap="l" style={{ alignItems: "center" }}>
            <Spinner size="l" />
            <Heading variant="display-strong-l">
              {SPOTIFY_UI.LOADING_PROCESSING}
            </Heading>
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
        style={{
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card
          padding="xl"
          background="accent-alpha-weak"
          border="accent-alpha-medium"
          radius="m"
          maxWidth="l"
        >
          <Flex direction="column" gap="l" style={{ alignItems: "center" }}>
            <Heading variant="display-strong-m" onBackground="accent-weak">
              {SPOTIFY_UI.ERROR_TITLE}
            </Heading>
            <Text
              variant="body-default-m"
              onBackground="accent-weak"
              style={{ textAlign: "center" }}
            >
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
    <Flex
      style={{
        minHeight: "50vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card padding="xl" maxWidth="m">
        <Flex direction="column" gap="l" style={{ alignItems: "center" }}>
          <Heading variant="display-strong-m">
            {SPOTIFY_UI.SUCCESS_TITLE}
          </Heading>

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
