import "server-only";
import { prisma } from "@/lib/prisma";

export type DeliveryCheck = {
  allowed: boolean;
  fee: number;
  minOrderAmount: number;
  message?: string;
};

export async function checkZone(restaurantId: string, _addressId?: string | null): Promise<DeliveryCheck> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { deliveryFee: true, minOrderAmount: true, isActive: true },
    });
    if (!restaurant) return { allowed: false, fee: 0, minOrderAmount: 0, message: "Ресторан не найден" };
    if (!restaurant.isActive) return { allowed: false, fee: 0, minOrderAmount: 0, message: "Ресторан не принимает заказы" };
    const zones = await prisma.restaurantZone.findMany({ where: { restaurantId, isActive: true }, orderBy: { deliveryFee: "asc" } });
    if (zones.length === 0) {
      return { allowed: true, fee: restaurant.deliveryFee, minOrderAmount: restaurant.minOrderAmount };
    }
    const cheapest = zones[0];
    return { allowed: true, fee: cheapest.deliveryFee, minOrderAmount: cheapest.minOrderAmount };
  } catch {
    return { allowed: true, fee: 0, minOrderAmount: 0 };
  }
}

export function calculateDeliveryFee(baseFee: number, subtotal: number, freeThreshold?: number): number {
  if (freeThreshold && subtotal >= freeThreshold) return 0;
  return baseFee;
}
