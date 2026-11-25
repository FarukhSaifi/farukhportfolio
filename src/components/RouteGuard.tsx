"use client";

import NotFound from "@/app/not-found";
import { API_ENDPOINTS, isAuthRequiredPath, ROUTE_GUARD_UI, ROUTES } from "@/lib/constants";
import { routes } from "@/resources";
import { Button, Column, Flex, Heading, PasswordInput, Spinner } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

function isRouteEnabled(pathname: string): boolean {
  if (pathname in routes) {
    return routes[pathname as keyof typeof routes];
  }

  const dynamicRoutes = [
    ROUTES.BLOG,
    ROUTES.WORK,
    ROUTES.ADMIN,
    ROUTES.SPOTIFY_AUTH,
    ROUTES.SPOTIFY_SUCCESS,
    ROUTES.YOUTUBE_MUSIC_SUCCESS,
  ] as const;

  for (const route of dynamicRoutes) {
    if (pathname.startsWith(route) && routes[route]) {
      return true;
    }
  }

  return false;
}

async function fetchAuthStatus(signal: AbortSignal): Promise<boolean> {
  const response = await fetch(API_ENDPOINTS.AUTH.CHECK_AUTH, { signal });
  if (!response.ok) return false;

  const data = (await response.json()) as { success?: boolean; data?: { isAuthenticated?: boolean } };
  return Boolean(data.success && data.data?.isAuthenticated);
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const rawPathname = usePathname();
  // usePathname() can be null/"" during SSR / first client paint (especially `/` on Vercel).
  // Do not treat an unresolved path as disabled — that flashed <NotFound /> before the real page.
  const pathnameReady = Boolean(rawPathname && rawPathname.length > 0);
  const pathname = pathnameReady ? rawPathname! : ROUTES.HOME;

  const routeEnabled = useMemo(() => isRouteEnabled(pathname), [pathname]);
  // Auth for admin + music OAuth pages only. Never require auth while pathname is unknown.
  const isPasswordRequired = pathnameReady && isAuthRequiredPath(pathname);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [authChecking, setAuthChecking] = useState(false);

  useEffect(() => {
    if (!isPasswordRequired) {
      setAuthChecking(false);
      setIsAuthenticated(false);
      setError(undefined);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    setAuthChecking(true);
    setIsAuthenticated(false);

    fetchAuthStatus(controller.signal)
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        setAuthChecking(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isPasswordRequired]);

  const handlePasswordSubmit = async () => {
    const response = await fetch(API_ENDPOINTS.AUTH.AUTHENTICATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setError(undefined);
    } else {
      setError(ROUTE_GUARD_UI.INCORRECT_PASSWORD);
    }
  };

  // Only block with 404 once the path is known and the route is disabled in config.
  if (pathnameReady && !routeEnabled) {
    return <NotFound />;
  }

  // Public routes: no auth spinner / password gate.
  if (!isPasswordRequired) {
    return <>{children}</>;
  }

  if (authChecking) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <Heading align="center" wrap="balance">
          {ROUTE_GUARD_UI.PASSWORD_PROTECTED}
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          <PasswordInput
            id="password"
            label={ROUTE_GUARD_UI.PASSWORD_LABEL}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
          />
          <Button onClick={handlePasswordSubmit}>{ROUTE_GUARD_UI.SUBMIT}</Button>
        </Column>
      </Column>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
