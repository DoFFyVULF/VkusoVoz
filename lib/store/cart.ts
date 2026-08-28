"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartOption = {
  groupId: string;
  groupName: string;
  itemId: string;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  dishId: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  options: CartOption[];
  restaurantId: string;
  restaurantName?: string;
  comment?: string;
};

export type RestaurantGroup = {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (dishId: string, optionsKey: string) => void;
  updateQuantity: (dishId: string, optionsKey: string, quantity: number) => void;
  updateComment: (dishId: string, optionsKey: string, comment: string) => void;
  clear: () => void;
  clearRestaurant: (restaurantId: string) => void;
  subtotal: () => number;
  totalQuantity: () => number;
  getOptionsKey: (options: CartOption[]) => string;
  getGroups: () => RestaurantGroup[];
  getGroup: (restaurantId: string) => RestaurantGroup | null;
};

function getOptionsKey(options: CartOption[]): string {
  if (!options.length) return "base";
  return [...options]
    .sort((a, b) => a.itemId.localeCompare(b.itemId))
    .map((o) => o.itemId)
    .join("|");
}

function itemTotal(item: CartItem): number {
  const optionsDelta = item.options.reduce((s, o) => s + o.priceDelta, 0);
  return (item.price + optionsDelta) * item.quantity;
}

function groupItems(items: CartItem[]): RestaurantGroup[] {
  const map = new Map<string, RestaurantGroup>();
  for (const it of items) {
    const existing = map.get(it.restaurantId);
    if (existing) {
      existing.items.push(it);
      existing.subtotal += itemTotal(it);
      existing.itemCount += it.quantity;
    } else {
      map.set(it.restaurantId, {
        restaurantId: it.restaurantId,
        restaurantName: it.restaurantName ?? it.restaurantId,
        items: [it],
        subtotal: itemTotal(it),
        itemCount: it.quantity,
      });
    }
  }
  // Stable order: by first appearance in the items array
  return Array.from(map.values());
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      getOptionsKey,

      addItem: (item) => {
        const items = get().items;
        const key = getOptionsKey(item.options);
        const idx = items.findIndex(
          (i) => i.dishId === item.dishId && getOptionsKey(i.options) === key
        );
        if (idx >= 0) {
          const next = [...items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
          set({ items: next });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (dishId, optionsKey) => {
        set({ items: get().items.filter((i) => !(i.dishId === dishId && getOptionsKey(i.options) === optionsKey)) });
      },

      updateQuantity: (dishId, optionsKey, quantity) => {
        if (quantity < 1) {
          get().removeItem(dishId, optionsKey);
          return;
        }
        const next = get().items.map((i) =>
          i.dishId === dishId && getOptionsKey(i.options) === optionsKey ? { ...i, quantity } : i
        );
        set({ items: next });
      },

      updateComment: (dishId, optionsKey, comment) => {
        const next = get().items.map((i) =>
          i.dishId === dishId && getOptionsKey(i.options) === optionsKey ? { ...i, comment } : i
        );
        set({ items: next });
      },

      clear: () => set({ items: [] }),

      clearRestaurant: (restaurantId) => {
        set({ items: get().items.filter((i) => i.restaurantId !== restaurantId) });
      },

      subtotal: () => get().items.reduce((s, i) => s + itemTotal(i), 0),
      totalQuantity: () => get().items.reduce((s, i) => s + i.quantity, 0),

      getGroups: () => groupItems(get().items),
      getGroup: (restaurantId) => {
        const items = get().items.filter((i) => i.restaurantId === restaurantId);
        if (items.length === 0) return null;
        return {
          restaurantId,
          restaurantName: items[0]?.restaurantName ?? restaurantId,
          items,
          subtotal: items.reduce((s, i) => s + itemTotal(i), 0),
          itemCount: items.reduce((s, i) => s + i.quantity, 0),
        };
      },
    }),
    {
      name: "vkusovoz-cart",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    updateComment: store.updateComment,
    clear: store.clear,
    clearRestaurant: store.clearRestaurant,
    subtotal: store.subtotal(),
    totalQuantity: store.totalQuantity(),
    getOptionsKey: store.getOptionsKey,
    getGroups: store.getGroups(),
    getGroup: store.getGroup,
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
}
