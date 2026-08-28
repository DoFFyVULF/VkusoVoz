"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FavoritesState = {
  restaurantSlugs: string[];
  dishIds: string[];
  toggleRestaurant: (slug: string) => void;
  toggleDish: (id: string) => void;
  isRestaurantFavorite: (slug: string) => boolean;
  isDishFavorite: (id: string) => boolean;
};

/**
 * Локальное избранное. Сейчас без бэка — пользовательский список
 * сохраняется в localStorage. При появлении API можно подменить
 * реализацию toggle/is* на запросы без изменения сигнатур.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      restaurantSlugs: [],
      dishIds: [],
      toggleRestaurant: (slug) =>
        set((s) => ({
          restaurantSlugs: s.restaurantSlugs.includes(slug)
            ? s.restaurantSlugs.filter((x) => x !== slug)
            : [...s.restaurantSlugs, slug],
        })),
      toggleDish: (id) =>
        set((s) => ({
          dishIds: s.dishIds.includes(id)
            ? s.dishIds.filter((x) => x !== id)
            : [...s.dishIds, id],
        })),
      isRestaurantFavorite: (slug) => get().restaurantSlugs.includes(slug),
      isDishFavorite: (id) => get().dishIds.includes(id),
    }),
    {
      name: "vkusovoz:favorites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
