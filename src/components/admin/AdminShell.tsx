"use client";

import { ADMIN_TAB_QUERY, ADMIN_UI, API_ENDPOINTS, HTTP_METHODS, ROUTES, SPOTIFY_CONFIG } from "@/lib/constants";
import type { AdminServiceId, AdminSessionUser } from "@/lib/interfaces";
import { Button, Column, Heading, Row, SegmentedControl, Spinner, Text } from "@once-ui-system/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_SERVICES, DEFAULT_ADMIN_SERVICE_ID, getAdminService, isAdminServiceId } from "./services/registry";

function AdminShellContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const tabFromUrl = useMemo<AdminServiceId>(() => {
    const raw = searchParams?.get(ADMIN_TAB_QUERY);
    return isAdminServiceId(raw) ? raw : DEFAULT_ADMIN_SERVICE_ID;
  }, [searchParams]);

  // Local tab state so the panel switches immediately (URL sync can lag)
  const [activeTab, setActiveTab] = useState<AdminServiceId>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const activeService = getAdminService(activeTab);
  const ActivePanel = activeService.Panel;

  useEffect(() => {
    const raw = searchParams?.get(ADMIN_TAB_QUERY);
    if (!isAdminServiceId(raw)) {
      router.replace(`${ROUTES.ADMIN}?${ADMIN_TAB_QUERY}=${DEFAULT_ADMIN_SERVICE_ID}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.CHECK_AUTH, {
          credentials: SPOTIFY_CONFIG.FETCH_CREDENTIALS,
        });
        const data = await response.json();
        if (!cancelled) {
          setUser(data.success && data.data?.isAuthenticated ? data.data.user : null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      if (!isAdminServiceId(value) || value === activeTab) {
        return;
      }
      setActiveTab(value);
      const next = `${ROUTES.ADMIN}?${ADMIN_TAB_QUERY}=${value}`;
      window.history.pushState(null, "", next);
      router.replace(next);
    },
    [activeTab, router],
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: HTTP_METHODS.POST,
        credentials: SPOTIFY_CONFIG.FETCH_CREDENTIALS,
      });
    } finally {
      window.location.href = ROUTES.ADMIN;
    }
  }, []);

  return (
    <Column maxWidth="m" fillWidth gap="l" paddingY="32" paddingX="l">
      <Row fillWidth horizontal="between" vertical="center" wrap gap="m">
        <Column gap="4">
          <Heading variant="display-strong-s">{ADMIN_UI.TITLE}</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {ADMIN_UI.SUBTITLE}
          </Text>
        </Column>
        <Column gap="8" horizontal="end">
          {sessionLoading ? (
            <Spinner size="s" />
          ) : (
            user?.email && (
              <Text variant="label-default-s" onBackground="neutral-weak">
                {ADMIN_UI.SESSION_LABEL} {user.email}
              </Text>
            )
          )}
          <Button variant="secondary" size="s" loading={signingOut} onClick={handleSignOut}>
            {ADMIN_UI.SIGN_OUT}
          </Button>
        </Column>
      </Row>

      <SegmentedControl
        fillWidth
        value={activeTab}
        buttons={ADMIN_SERVICES.map((service) => ({
          value: service.id,
          label: service.label,
        }))}
        onChange={handleTabChange}
      />

      {!activeService.enabled && (
        <Text variant="label-default-s" onBackground="neutral-weak">
          {ADMIN_UI.COMING_SOON}
        </Text>
      )}

      <ActivePanel />
    </Column>
  );
}

export function AdminShell() {
  return (
    <Suspense
      fallback={
        <Column fillWidth horizontal="center" vertical="center" style={{ position: "fixed", inset: 0, zIndex: 10 }}>
          <Spinner />
        </Column>
      }
    >
      <AdminShellContent />
    </Suspense>
  );
}
