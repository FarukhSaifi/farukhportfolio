"use client";

import { useSpotify } from "@/contexts/SpotifyContext";
import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useEffect, useState } from "react";

export default function SpotifySuccessPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateRefreshToken, updateAccessToken, tokens } = useSpotify();

  useEffect(() => {
    console.log("🎉 Spotify Success Page: Component mounted");

    const exchangeCodeForTokens = async () => {
      try {
        // Check if we have a token in the URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          console.log(
            "🔑 Spotify Success Page: Found authorization code:",
            code.substring(0, 20) + "..."
          );

          // Exchange the code for tokens
          const response = await fetch("/api/spotify/exchange-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            const tokenData = await response.json();
            console.log("✅ Successfully exchanged code for tokens:", tokenData);

            // Store the tokens
            updateRefreshToken(tokenData.refresh_token);
            updateAccessToken(tokenData.access_token, tokenData.expires_in);

            setRefreshToken(tokenData.refresh_token);
            setAccessToken(tokenData.access_token);
          } else {
            const errorData = await response.json();
            console.error("❌ Failed to exchange code for tokens:", errorData);
            setError(`Failed to exchange code: ${errorData.error}`);
          }
        } else {
          console.log("❌ Spotify Success Page: No authorization code found");
          setError("No authorization code found in URL");
        }
      } catch (err: any) {
        console.error("❌ Error exchanging code for tokens:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    exchangeCodeForTokens();
  }, [updateRefreshToken, updateAccessToken]);

  const clearStoredToken = () => {
    console.log("🗑️ Spotify Success Page: Clearing stored token");
    setRefreshToken(null);
    setAccessToken(null);
    // The context will handle clearing localStorage
  };

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ minHeight: "50vh" }}>
        <Text>Exchanging authorization code for tokens...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ minHeight: "50vh" }}>
        <Card padding="xl" maxWidth="m">
          <Flex direction="column" gap="l" alignItems="center">
            <Heading variant="display-strong-m">❌ Error</Heading>
            <Text variant="body-default-m" style={{ textAlign: "center" }}>
              {error}
            </Text>
            <Button href="/spotify-auth" variant="primary">
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
            <Text variant="body-default-m">
              Your Spotify account has been successfully connected!
            </Text>

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
              <Text
                variant="body-default-xs"
                onBackground="neutral-weak"
                style={{ fontFamily: "monospace" }}
              >
                {JSON.stringify(tokens, null, 2)}
              </Text>
            </Flex>
          </Flex>

          <Flex gap="m">
            <Button href="/" variant="primary">
              Go to Home
            </Button>
            <Button onClick={clearStoredToken} variant="secondary">
              Clear Token
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
