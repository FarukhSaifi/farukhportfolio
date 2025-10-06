"use client";

import { useDatabaseSpotify } from "@/contexts/DatabaseSpotifyContext";
import { useToast } from "@/hooks/useToast";
import { Button, Card, Flex, Heading, Spinner, Text } from "@/once-ui/components";
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
        setError("No authorization code found");
        return;
      }

      const response = await fetch("/api/spotify/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const tokenData = await response.json();

        // Save token to MongoDB for public access
        const saveResponse = await fetch("/api/spotify/save-token", {
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
          success("Spotify Connected!", "Your tokens have been saved to the database and are now publicly accessible.");
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
        alignItems="center"
        justifyContent="center"
        fillWidth
        style={{ minHeight: "100vh" }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card padding="xl" background="neutral-strong" border="neutral-medium" radius="m">
          <Flex direction="column" gap="l" alignItems="center">
            <Spinner size="l" />
            <Heading variant="display-strong-l">🔄 Processing...</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Exchanging authorization code for tokens...
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
        alignItems="center"
        justifyContent="center"
        fillWidth
        style={{ minHeight: "100vh" }}
        gap="xl"
        padding="xl"
        background="neutral-weak"
      >
        <Card padding="xl" background="accent-alpha-weak" border="accent-alpha-medium" radius="m" maxWidth="l">
          <Flex direction="column" gap="l" alignItems="center">
            <Heading variant="display-strong-m" onBackground="accent-weak">
              ❌ Error
            </Heading>
            <Text variant="body-default-m" onBackground="accent-weak" style={{ textAlign: "center" }}>
              {error}
            </Text>
            <Button href="/spotify-auth" variant="primary" size="l">
              Try Again
            </Button>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex justifyContent="center" alignItems="center" style={{ minHeight: "50vh" }}>
      <Card padding="xl" maxWidth="m">
        <Flex direction="column" gap="l" alignItems="center">
          <Heading variant="display-strong-m">🎉 Spotify Connected!</Heading>

          <Flex direction="column" gap="m" alignItems="center">
            <Text variant="body-default-m">Your Spotify account has been successfully connected!</Text>

            <Text variant="body-default-s" onBackground="neutral-weak">
              Your tokens have been saved to the database and are now publicly accessible.
            </Text>
          </Flex>

          <Flex gap="m">
            <Button href="/" variant="primary">
              Go to Home
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
