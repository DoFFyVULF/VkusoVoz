"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  image?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasLoaded: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
  markLoaded: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasLoaded: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user && user.id),
      isLoading: false,
      hasLoaded: true,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clear: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasLoaded: true,
    }),

  markLoaded: () => set({ isLoading: false, hasLoaded: true }),
}));
