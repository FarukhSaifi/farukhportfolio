"use client";

import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SpotifySuccessPage() {
  const searchParams = useSearchParams();
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = searchParams.get("refresh_token");
    if (token) {
      setRefreshToken(token);
    }
  }, [searchParams]);

  const copyToClipboard = async () => {
    if (refreshToken) {
      try {
        await navigator.clipboard.writeText(refreshToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  if (!refreshToken) {
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
        <Heading variant="display-strong-l">❌ Authorization Failed</Heading>
        <Text variant="body-default-l" style={{ textAlign: "center" }}>
          No refresh token received. Please try the authorization process again.
        </Text>
        <Button as="a" href="/spotify-auth" variant="primary">
          Try Again
        </Button>
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
      <Heading variant="display-strong-l">✅ Spotify Connected Successfully!</Heading>

      <Card padding="xl" maxWidth="m" style={{ textAlign: "center" }}>
        <Text variant="body-default-l" marginBottom="l">
          Your Spotify account has been successfully connected! Here's what you need to do next:
        </Text>

        <Flex direction="column" gap="m" marginBottom="xl">
          <Text variant="body-default-m" onBackground="neutral-weak">
            <strong>Step 1:</strong> Copy the refresh token below
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            <strong>Step 2:</strong> Add it to your .env.local file
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            <strong>Step 3:</strong> Restart your development server
          </Text>
        </Flex>

        <Flex direction="column" gap="m" marginBottom="xl">
          <Text variant="body-default-s" onBackground="neutral-weak">
            <strong>Refresh Token:</strong>
          </Text>

          <Flex
            background="neutral-alpha-weak"
            border="neutral-alpha-medium"
            radius="m"
            padding="m"
            alignItems="center"
            gap="m"
          >
            <Text
              variant="body-default-s"
              fontFamily="mono"
              onBackground="neutral-weak"
              style={{ wordBreak: "break-all" }}
            >
              {refreshToken}
            </Text>

            <Button size="s" variant="secondary" onClick={copyToClipboard} disabled={copied}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Flex>
        </Flex>

        <Text variant="body-default-xs" onBackground="neutral-weak">
          Add this line to your .env.local file:
        </Text>

        <Flex
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          padding="m"
          marginBottom="l"
        >
          <Text variant="body-default-xs" fontFamily="mono" onBackground="neutral-weak">
            SPOTIFY_REFRESH_TOKEN={refreshToken}
          </Text>
        </Flex>

        <Flex gap="m" justifyContent="center">
          <Button as="a" href="/" variant="primary">
            Go to Home
          </Button>
          <Button as="a" href="/spotify-auth" variant="secondary">
            Authorize Another Account
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
