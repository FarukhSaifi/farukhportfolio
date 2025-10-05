"use client";

import { useSpotify } from "@/contexts/SpotifyContext";
import { Button, Card, Flex, Heading, Spinner, Text } from "@/once-ui/components";
import { useEffect, useRef, useState } from "react";

export default function SpotifySuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { updateRefreshToken, updateAccessToken, tokens } = useSpotify();
  const hasExecuted = useRef(false);

  useEffect(() => {
    const exchangeCodeForTokens = async () => {
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
          updateRefreshToken(tokenData.refresh_token);
          updateAccessToken(tokenData.access_token, tokenData.expires_in);

          setRefreshToken(tokenData.refresh_token);
          setAccessToken(tokenData.access_token);
        } else {
          const errorData = await response.json();
          setError(`Failed to exchange code: ${errorData.error}`);
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    exchangeCodeForTokens();
  }, []);

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

            {refreshToken && (
              <Flex direction="column" gap="s" alignItems="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  <strong>Refresh Token:</strong> {refreshToken.substring(0, 50)}...
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  This token has been stored in your browser and will be used for API calls.
                </Text>
              </Flex>
            )}

            {accessToken && (
              <Flex direction="column" gap="s" alignItems="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  <strong>Access Token:</strong> {accessToken.substring(0, 50)}...
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  This token will be used for API calls and automatically refreshed.
                </Text>
              </Flex>
            )}

            <Flex direction="column" gap="m" alignItems="center">
              <Text variant="body-default-s">
                <strong>Context State:</strong>
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak" style={{ fontFamily: "monospace" }}>
                {JSON.stringify(tokens, null, 2)}
              </Text>
            </Flex>
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
