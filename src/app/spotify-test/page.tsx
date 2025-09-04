"use client";

import { useSpotify } from "@/contexts/SpotifyContext";
import { Button, Card, Flex, Heading, Text } from "@/once-ui/components";
import { useEffect, useState } from "react";

export default function SpotifyTestPage() {
  const [apiStatus, setApiStatus] = useState<string>("Not tested");
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const { tokens, hasRefreshToken, hasValidAccessToken, clearTokens, updateRefreshToken } =
    useSpotify();

  useEffect(() => {
    console.log("🔍 Test page: Loading with context tokens");
    console.log("🔍 Test page: Context tokens:", tokens);
  }, [tokens]);

  const checkTokenStatus = async () => {
    try {
      setTokenStatus("Checking...");
      const response = await fetch("/api/spotify/token-status");
      const data = await response.json();
      setTokenStatus(data);
      console.log("🔍 Token status:", data);
    } catch (error: any) {
      setTokenStatus({ error: error.message });
      console.error("❌ Error checking token status:", error);
    }
  };

  const testAPI = async () => {
    console.log("🧪 Test page: Testing API call");
    setApiStatus("Testing...");
    try {
      const response = await fetch("/api/spotify/now-playing", {
        headers: {
          "x-spotify-token": tokens.refreshToken || "",
          "x-token-type": "refresh",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API test successful:", data);
        setApiStatus("✅ Success");
      } else {
        const errorData = await response.json();
        console.error("❌ API test failed:", errorData);
        setApiStatus(`❌ Failed: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error("❌ API test error:", error);
      setApiStatus(`❌ Error: ${error.message}`);
    }
  };

  const simulateToken = () => {
    const testToken = `test_refresh_token_${Date.now()}`;
    console.log("🧪 Test page: Storing test token:", testToken);
    updateRefreshToken(testToken);
    setApiStatus("Test token stored");
  };

  const clearToken = () => {
    console.log("🗑️ Test page: Clearing tokens");
    clearTokens();
    setApiStatus("Tokens cleared");
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
      <Heading variant="display-strong-l">🧪 Spotify Token Test</Heading>

      <Card padding="xl" maxWidth="l" style={{ textAlign: "center" }}>
        <Flex direction="column" gap="l">
          <Heading variant="heading-strong-m">LocalStorage Status</Heading>

          <Flex direction="column" gap="m">
            <Text variant="body-default-m">
              <strong>Stored Token:</strong> {tokens.refreshToken ? "✅ Found" : "❌ Not found"}
            </Text>

            {tokens.refreshToken && (
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ wordBreak: "break-all", fontFamily: "monospace" }}
              >
                {tokens.refreshToken}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="m">
            <Heading variant="heading-strong-m">API Test</Heading>
            <Text variant="body-default-m">
              <strong>Status:</strong> {apiStatus}
            </Text>
          </Flex>

          {tokenStatus && (
            <Flex direction="column" gap="m">
              <Heading variant="heading-strong-m">Token Status</Heading>
              <Flex
                background="neutral-alpha-weak"
                border="neutral-alpha-medium"
                radius="m"
                padding="m"
              >
                <Text
                  variant="body-default-xs"
                  onBackground="neutral-weak"
                  style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                >
                  {typeof tokenStatus === "string"
                    ? tokenStatus
                    : JSON.stringify(tokenStatus, null, 2)}
                </Text>
              </Flex>
            </Flex>
          )}

          <Flex gap="m" justifyContent="center" wrap={true}>
            <Button onClick={testAPI} variant="primary">
              Test API Call
            </Button>
            <Button onClick={simulateToken} variant="secondary">
              Store Test Token
            </Button>
            <Button onClick={clearToken} variant="secondary">
              Clear Token
            </Button>
            <Button onClick={checkTokenStatus} variant="secondary">
              Check Token Status
            </Button>
            <Button onClick={() => clearTokens()} variant="secondary">
              Clear All Tokens
            </Button>
          </Flex>

          <Text variant="body-default-xs" onBackground="neutral-weak">
            💡 This page helps test localStorage token functionality and API connectivity.
          </Text>

          <Flex direction="column" gap="m">
            <Heading variant="heading-strong-m">Token Information</Heading>
            <Flex
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="m"
              padding="m"
            >
              <Text
                variant="body-default-xs"
                onBackground="neutral-weak"
                style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(tokens, null, 2)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
