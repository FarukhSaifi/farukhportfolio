"use client";

import { Button, Card, Flex, Heading, Text } from "@once-ui-system/core";
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

  console.log("SpotifyAuthPage: render", {
    error,
    message,
    isLoading,
    hasStoredToken,
  });

  if (isLoading) {
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
        <Card
          padding="xl"
          background="neutral-strong"
          border="neutral-medium"
          radius="m"
        >
          <Flex direction="column" gap="l" horizontal="center">
            <Heading variant="display-strong-l">🔄 Loading...</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Please wait...
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
      // background="neutral-weak"
    >
      <Card
        padding="xl"
        background="neutral-weak"
        border="neutral-alpha-medium"
        radius="m"
        maxWidth="l"
      >
        <Flex direction="column" gap="l" horizontal="center" fillWidth>
          <Heading variant="display-strong-l">🎵 Spotify Authorization</Heading>
          {error ? (
            <Flex direction="column" gap="l" horizontal="center">
              <Card
                padding="l"
                background="accent-alpha-weak"
                border="accent-alpha-medium"
                radius="m"
                fillWidth
              >
                <Flex direction="column" gap="m" horizontal="center">
                  <Heading
                    variant="heading-strong-m"
                    onBackground="accent-weak"
                  >
                    ❌ Authorization Error
                  </Heading>

                  {error === "auth_failed" && (
                    <Text
                      variant="body-default-m"
                      onBackground="accent-weak"
                      style={{ textAlign: "center" }}
                    >
                      The Spotify authorization was cancelled or failed. Please
                      try again.
                    </Text>
                  )}

                  {error === "no_code" && (
                    <Text
                      variant="body-default-m"
                      onBackground="accent-weak"
                      style={{ textAlign: "center" }}
                    >
                      No authorization code received from Spotify. Please try
                      again.
                    </Text>
                  )}

                  {error === "token_exchange_failed" && (
                    <Text
                      variant="body-default-m"
                      onBackground="accent-weak"
                      style={{ textAlign: "center" }}
                    >
                      Failed to exchange the authorization code for tokens:{" "}
                      {message}
                    </Text>
                  )}

                  <Button onClick={handleAuth} variant="primary" size="l">
                    Try Again
                  </Button>
                </Flex>
              </Card>
            </Flex>
          ) : (
            <Flex direction="column" gap="l" horizontal="center">
              {hasStoredToken && (
                <Card
                  padding="m"
                  background="brand-alpha-weak"
                  border="brand-alpha-medium"
                  radius="m"
                  fillWidth
                >
                  <Flex vertical="center" gap="m" horizontal="between">
                    <Text variant="body-default-s" onBackground="brand-weak">
                      💡{" "}
                      <strong>You already have a stored refresh token!</strong>
                    </Text>
                    <Button
                      onClick={clearStoredToken}
                      variant="secondary"
                      size="s"
                    >
                      Clear Token
                    </Button>
                  </Flex>
                </Card>
              )}

              <Text
                variant="body-default-l"
                onBackground="neutral-strong"
                style={{ textAlign: "center" }}
              >
                To enable the Spotify Now Playing feature, you need to authorize
                this app to access your Spotify account.
              </Text>

              <Text
                variant="body-default-m"
                onBackground="neutral-weak"
                style={{ textAlign: "center" }}
              >
                This will allow the app to see what you&apos;re currently
                playing on Spotify and display it in the header.
              </Text>

              <Card
                padding="l"
                background="neutral-alpha-weak"
                border="neutral-alpha-medium"
                radius="m"
                fillWidth
              >
                <Flex direction="column" gap="m">
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <strong>Required Permissions:</strong>
                  </Text>
                  <Flex
                    direction="column"
                    gap="xs"
                    horizontal="start"
                    style={{ marginLeft: "1rem" }}
                  >
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      • See what you&apos;re currently playing
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      • See your playback state
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      • See your recently played tracks
                    </Text>
                  </Flex>
                </Flex>
              </Card>

              <Text
                variant="body-default-xs"
                onBackground="neutral-weak"
                style={{ textAlign: "center" }}
              >
                After authorization, you&apos;ll receive a refresh token that
                will be stored in your browser and can be used for API calls.
              </Text>

              <Button onClick={handleAuth} variant="primary" size="l">
                Authorize with Spotify
              </Button>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
