import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiException } from "./api-response";

export type ServerCartItem = {
  id: string;
  dishId: string;
  quantity: number;
  comment?: string | null;
  dish: { id: string; name: string; price: number; weight?: number | null; image?: string | null; restaurantId: string; isAvailable: boolean };
  options: { optionItemId: string; name: string; priceDelta: number; quantity: number }[];
};

export type ServerCart = {
  id: string;
  userId: string;
  restaurantId: string | null;
  items: ServerCartItem[];
  subtotal: number;
};

function calcItemTotal(price: number, options: { priceDelta: number; quantity: number }[], qty: number): number {
  const delta = options.reduce((s, o) => s + o.priceDelta * o.quantity, 0);
  return (price + delta) * qty;
}

export async function getOrCreateCart(userId: string): Promise<ServerCart> {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            dish: { select: { id: true, name: true, price: true, weight: true, image: true, restaurantId: true, isAvailable: true } },
            selectedOptions: { include: { optionItem: { select: { id: true, name: true, priceDelta: true } } } },
          },
        },
      },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              dish: { select: { id: true, name: true, price: true, weight: true, image: true, restaurantId: true, isAvailable: true } },
              selectedOptions: { include: { optionItem: { select: { id: true, name: true, priceDelta: true } } } },
            },
          },
        },
      });
    }
    const items: ServerCartItem[] = cart.items.map((ci) => ({
      id: ci.id,
      dishId: ci.dishId,
      quantity: ci.quantity,
      comment: ci.comment,
      dish: ci.dish,
      options: ci.selectedOptions.map((o) => ({ optionItemId: o.optionItemId, name: o.optionItem.name, priceDelta: o.optionItem.priceDelta, quantity: o.quantity })),
    }));
    const subtotal = items.reduce((s, it) => s + calcItemTotal(it.dish.price, it.options, it.quantity), 0);
    return { id: cart.id, userId, restaurantId: cart.restaurantId, items, subtotal };
  } catch {
    return { id: `mock-${userId}`, userId, restaurantId: null, items: [], subtotal: 0 };
  }
}

export async function addToCart(userId: string, input: { dishId: string; quantity: number; options?: { optionItemId: string; quantity?: number }[]; comment?: string }): Promise<ServerCart> {
  const dish = await prisma.dish.findUnique({ where: { id: input.dishId }, select: { id: true, restaurantId: true, price: true, isAvailable: true } }).catch(() => null);
  if (!dish) throw new ApiException("NOT_FOUND", "Блюдо не найдено");
  if (!dish.isAvailable) throw new ApiException("UNPROCESSABLE", "Блюдо недоступно");
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId, restaurantId: dish.restaurantId } });
  if (cart.restaurantId && cart.restaurantId !== dish.restaurantId) {
    throw new ApiException("CONFLICT", "В корзине уже есть блюда из другого ресторана. Очистите корзину.");
  }
  if (!cart.restaurantId) await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: dish.restaurantId } });

  const sortedOptions = [...(input.options ?? [])].sort((a, b) => a.optionItemId.localeCompare(b.optionItemId));
  const existingItems = await prisma.cartItem.findMany({ where: { cartId: cart.id, dishId: input.dishId }, include: { selectedOptions: true } });
  let matched: string | null = null;
  for (const ci of existingItems) {
    const ids = ci.selectedOptions.map((o) => o.optionItemId).sort();
    const incoming = sortedOptions.map((o) => o.optionItemId).sort();
    if (ids.length === incoming.length && ids.every((v, i) => v === incoming[i])) matched = ci.id;
  }
  if (matched) {
    const cur = existingItems.find((x) => x.id === matched)!;
    const newQty = Math.min(99, cur.quantity + input.quantity);
    await prisma.cartItem.update({ where: { id: matched }, data: { quantity: newQty, comment: input.comment ?? cur.comment } });
  } else {
    const ci = await prisma.cartItem.create({ data: { cartId: cart.id, dishId: input.dishId, quantity: input.quantity, comment: input.comment } });
    if (sortedOptions.length) {
      await prisma.selectedCartItemOption.createMany({
        data: sortedOptions.map((o) => ({ cartItemId: ci.id, optionItemId: o.optionItemId, quantity: o.quantity ?? 1 })),
      });
    }
  }
  return getOrCreateCart(userId);
}

export async function updateCartItem(userId: string, itemId: string, data: { quantity: number; comment?: string }): Promise<ServerCart> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiException("NOT_FOUND", "Корзина пуста");
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw new ApiException("NOT_FOUND", "Позиция не найдена");
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: data.quantity, comment: data.comment } });
  return getOrCreateCart(userId);
}

export async function removeCartItem(userId: string, itemId: string): Promise<ServerCart> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiException("NOT_FOUND", "Корзина пуста");
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  const remaining = await prisma.cartItem.count({ where: { cartId: cart.id } });
  if (remaining === 0) await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } });
  return getOrCreateCart(userId);
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } });
}
