"use client";

import * as React from "react";
import { useAuthStore, type AuthUser } from "@/lib/store/auth";

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/v1/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: AuthUser };
    if (!json.success || !json.data || !json.data.id || json.data.id.startsWith("mock-")) {
      return null;
    }
    return json.data;
  } catch {
    return null;
  }
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasLoaded = useAuthStore((s) => s.hasLoaded);

  const refresh = React.useCallback(async () => {
    const { setUser, clear, setLoading } = useAuthStore.getState();
    setLoading(true);
    const me = await fetchMe();
    if (me) {
      setUser(me);
    } else {
      clear();
    }
  }, []);

  React.useEffect(() => {
    if (useAuthStore.getState().hasLoaded) return;
    let cancelled = false;
    useAuthStore.setState({ isLoading: true });

    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      const { setUser, clear } = useAuthStore.getState();
      if (me) {
        setUser(me);
      } else {
        clear();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAuthenticated, isLoading, user, refresh, hasLoaded };
}
