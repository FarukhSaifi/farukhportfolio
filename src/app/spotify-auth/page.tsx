"use client";

import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "spotify_refresh_token";

export default function SpotifyAuthPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    console.log("SpotifyAuthPage: useEffect running");
    console.log("Search params:", searchParams);

    // Check if there's a stored token
    const storedToken = localStorage.getItem(STORAGE_KEY);
    setHasStoredToken(!!storedToken);
    console.log("Stored token exists:", storedToken ? "✅ Yes" : "❌ No");
    if (storedToken) {
      console.log("🔑 Stored token value:", storedToken);
    }

    if (searchParams) {
      const errorParam = searchParams.get("error");
      const messageParam = searchParams.get("message");

      console.log("Error from params:", errorParam);
      console.log("Message from params:", messageParam);

      setError(errorParam);
      setMessage(messageParam);
    }

    setIsLoading(false);
  }, [searchParams]);

  const handleAuth = () => {
    console.log("SpotifyAuthPage: handleAuth called");
    setIsLoading(true);
    window.location.href = "/api/spotify/auth";
  };

  const clearStoredToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasStoredToken(false);
    console.log("🗑️ Stored token cleared from localStorage");
  };

  console.log("SpotifyAuthPage: render", { error, message, isLoading, hasStoredToken });

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
      >
        <Heading variant="display-strong-l">🔄 Loading...</Heading>
        <Text variant="body-default-l">Please wait...</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      fillWidth
      style={{ minHeight: "100vh" }}
      gap="xl"
      padding="xl"
    >
      <Heading variant="display-strong-l">🎵 Spotify Authorization</Heading>

      <Card padding="xl" maxWidth="l" style={{ textAlign: "center" }}>
        {error ? (
          <Flex direction="column" gap="l">
            <Heading variant="heading-strong-m" onBackground="accent-weak">
              ❌ Authorization Error
            </Heading>

            {error === "auth_failed" && (
              <Text variant="body-default-m" onBackground="accent-weak">
                The Spotify authorization was cancelled or failed. Please try again.
              </Text>
            )}

            {error === "no_code" && (
              <Text variant="body-default-m" onBackground="accent-weak">
                No authorization code received from Spotify. Please try again.
              </Text>
            )}

            {error === "token_exchange_failed" && (
              <Text variant="body-default-m" onBackground="accent-weak">
                Failed to exchange the authorization code for tokens: {message}
              </Text>
            )}

            <Button onClick={handleAuth} variant="primary">
              Try Again
            </Button>
          </Flex>
        ) : (
          <Flex direction="column" gap="l">
            {hasStoredToken && (
              <Flex
                background="neutral-alpha-weak"
                border="neutral-alpha-medium"
                radius="m"
                padding="m"
                marginBottom="l"
                alignItems="center"
                gap="m"
              >
                <Text variant="body-default-s" onBackground="neutral-weak">
                  💡 <strong>You already have a stored refresh token!</strong>
                </Text>
                <Button onClick={clearStoredToken} variant="secondary" size="s">
                  Clear Token
                </Button>
              </Flex>
            )}

            <Text variant="body-default-l" style={{ textAlign: "center" }}>
              To enable the Spotify Now Playing feature, you need to authorize this app to access
              your Spotify account.
            </Text>

            <Text
              variant="body-default-m"
              style={{ textAlign: "center" }}
              onBackground="neutral-weak"
            >
              This will allow the app to see what you're currently playing on Spotify and display it
              in the header.
            </Text>

            <Flex direction="column" gap="m" marginTop="l">
              <Text variant="body-default-s" onBackground="neutral-weak">
                <strong>Required Permissions:</strong>
              </Text>
              <Flex
                direction="column"
                gap="xs"
                alignItems="flex-start"
                style={{ marginLeft: "1rem" }}
              >
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  • See what you're currently playing
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  • See your playback state
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  • See your recently played tracks
                </Text>
              </Flex>
            </Flex>

            <Text
              variant="body-default-xs"
              style={{ textAlign: "center" }}
              onBackground="neutral-weak"
            >
              After authorization, you'll receive a refresh token that will be stored in your
              browser and can be used for API calls.
            </Text>

            <Button onClick={handleAuth} variant="primary" size="l">
              Authorize with Spotify
            </Button>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
