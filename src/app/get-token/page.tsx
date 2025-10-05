"use client";

import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useState } from "react";

export default function GetTokenPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = () => {
    setIsLoading(true);
    // Redirect to Spotify authorization
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
      <Heading variant="display-strong-l">🎵 Get Spotify Token</Heading>

      <Card padding="xl" maxWidth="m" style={{ textAlign: "center" }}>
        <Text variant="body-default-l" marginBottom="l">
          Click the button below to get your Spotify refresh token.
        </Text>

        <Text variant="body-default-m" marginBottom="xl" onBackground="neutral-weak">
          This will redirect you to Spotify to authorize the app and get your token.
        </Text>

        <Button onClick={handleGetToken} variant="primary" size="l" disabled={isLoading}>
          {isLoading ? "Redirecting..." : "Get Spotify Token"}
        </Button>

        <Text variant="body-default-xs" marginTop="l" onBackground="neutral-weak">
          After authorization, you'll be redirected to the about page with your token.
        </Text>
      </Card>
    </Flex>
  );
}
