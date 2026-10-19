"use client";

import { ADMIN_ACTION_KEYS, NOW_PLAYING_UI } from "@/lib/constants";
import type { NowPlayingPayload } from "@/lib/interfaces";
import { Avatar, Button, Card, Column, Heading, Row, Spinner, Text } from "@once-ui-system/core";
import { useCallback, useState } from "react";

function shouldUnoptimizePreviewImage(imageUrl: string, forceUnoptimized: boolean): boolean {
  if (forceUnoptimized) {
    return true;
  }
  return NOW_PLAYING_UI.UNOPTIMIZED_IMAGE_HOST_MARKERS.some((marker) => imageUrl.includes(marker));
}

type MusicServicePanelCopy = {
  HEADING: string;
  CONNECTION: string;
  CONNECTED: string;
  NOT_CONNECTED: string;
  CONNECT: string;
  REFRESH: string;
  DISCONNECT: string;
  PREVIEW: string;
  LIVE: string;
  LAST_PLAYED: string;
  NO_TRACK: string;
  ACTION_ERROR: string;
  REFRESHED: string;
  DISCONNECTED: string;
  API_NOTE?: string;
};

type MusicServicePanelProps = {
  copy: MusicServicePanelCopy;
  isConnected: boolean;
  connectionLoading: boolean;
  previewLoading: boolean;
  payload: NowPlayingPayload | null;
  /** Spotify connect is a plain redirect; Apple wraps authenticate in runAction. */
  connectMode?: "redirect" | "async";
  unoptimizedPreviewImage?: boolean;
  /** Preview treats non-playing as last-played (Apple). */
  treatIdleAsLastPlayed?: boolean;
  /** When false, omit the public-preview card (e.g. YouTube Music has no detection). */
  hidePreview?: boolean;
  authenticate: () => void | Promise<void>;
  refreshToken: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export function MusicServicePanel({
  copy,
  isConnected,
  connectionLoading,
  previewLoading,
  payload,
  connectMode = "redirect",
  unoptimizedPreviewImage = false,
  treatIdleAsLastPlayed = false,
  hidePreview = false,
  authenticate,
  refreshToken,
  disconnect,
}: MusicServicePanelProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = useCallback(
    async (key: string, action: () => Promise<void>, successMessage: string) => {
      setActionLoading(key);
      setError(null);
      setMessage(null);
      try {
        await action();
        setMessage(successMessage);
      } catch {
        setError(copy.ACTION_ERROR);
      } finally {
        setActionLoading(null);
      }
    },
    [copy.ACTION_ERROR],
  );

  const track = payload?.track ?? null;
  const isLastPlayed = Boolean(payload?.isLastPlayed);
  const previewStatusLabel =
    isLastPlayed || (treatIdleAsLastPlayed && !payload?.isPlaying) ? copy.LAST_PLAYED : copy.LIVE;
  const unoptimizedImage = Boolean(
    track?.imageUrl && shouldUnoptimizePreviewImage(track.imageUrl, unoptimizedPreviewImage),
  );

  return (
    <Column gap="l" fillWidth>
      <Card padding="l" background="neutral-alpha-weak" border="neutral-alpha-medium" radius="m" fillWidth>
        <Column gap="m">
          <Heading variant="heading-strong-m">{copy.HEADING}</Heading>

          {copy.API_NOTE ? (
            <Text variant="body-default-s" onBackground="neutral-weak">
              {copy.API_NOTE}
            </Text>
          ) : null}

          <Row gap="m" vertical="center" wrap>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {copy.CONNECTION}
            </Text>
            {connectionLoading ? (
              <Spinner size="s" />
            ) : (
              <Text variant="label-default-s" onBackground={isConnected ? "brand-weak" : "accent-weak"}>
                {isConnected ? copy.CONNECTED : copy.NOT_CONNECTED}
              </Text>
            )}
          </Row>

          <Row gap="s" wrap>
            {connectMode === "async" ? (
              <Button
                variant="primary"
                size="m"
                loading={actionLoading === ADMIN_ACTION_KEYS.CONNECT}
                disabled={Boolean(actionLoading)}
                onClick={() => {
                  void runAction(ADMIN_ACTION_KEYS.CONNECT, () => Promise.resolve(authenticate()), copy.CONNECTED);
                }}
              >
                {copy.CONNECT}
              </Button>
            ) : (
              <Button variant="primary" size="m" onClick={authenticate} disabled={Boolean(actionLoading)}>
                {copy.CONNECT}
              </Button>
            )}
            <Button
              variant="secondary"
              size="m"
              loading={actionLoading === ADMIN_ACTION_KEYS.REFRESH}
              disabled={!isConnected || Boolean(actionLoading)}
              onClick={() => {
                void runAction(ADMIN_ACTION_KEYS.REFRESH, refreshToken, copy.REFRESHED);
              }}
            >
              {copy.REFRESH}
            </Button>
            <Button
              variant="danger"
              size="m"
              loading={actionLoading === ADMIN_ACTION_KEYS.DISCONNECT}
              disabled={!isConnected || Boolean(actionLoading)}
              onClick={() => {
                void runAction(ADMIN_ACTION_KEYS.DISCONNECT, disconnect, copy.DISCONNECTED);
              }}
            >
              {copy.DISCONNECT}
            </Button>
          </Row>

          {message ? (
            <Text variant="body-default-s" onBackground="brand-weak">
              {message}
            </Text>
          ) : null}
          {error ? (
            <Text variant="body-default-s" onBackground="accent-weak">
              {error}
            </Text>
          ) : null}
        </Column>
      </Card>

      {hidePreview ? null : (
        <Card padding="l" background="neutral-alpha-weak" border="neutral-alpha-medium" radius="m" fillWidth>
          <Column gap="m">
            <Heading variant="heading-strong-s">{copy.PREVIEW}</Heading>

            {previewLoading ? (
              <Spinner size="s" />
            ) : !track ? (
              <Text variant="body-default-m" onBackground="neutral-weak">
                {copy.NO_TRACK}
              </Text>
            ) : (
              <Column gap="m">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {previewStatusLabel}
                </Text>
                <Row gap="m" vertical="center">
                  {track.imageUrl ? <Avatar src={track.imageUrl} size="l" unoptimized={unoptimizedImage} /> : null}
                  <Column gap="4" style={{ minWidth: 0 }}>
                    <Text variant="heading-strong-s">{track.title}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {track.artist}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {track.album}
                    </Text>
                  </Column>
                </Row>
              </Column>
            )}
          </Column>
        </Card>
      )}
    </Column>
  );
}
