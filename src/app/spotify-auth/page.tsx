"use client";

import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useSearchParams } from "next/navigation";

export default function SpotifyAuthPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");

  const handleAuth = () => {
    window.location.href = "/api/spotify/auth";
  };

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
              After authorization, you'll receive a refresh token to add to your environment
              variables.
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
