import { NextRequest } from "next/server";
import { ok, notFound, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { dishesMock } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      const dish = await prisma.dish.findUnique({ where: { id }, include: { optionGroups: { include: { items: true } }, category: true, restaurant: { select: { id: true, name: true, slug: true } } } });
      if (dish) return ok(dish);
    } catch {}
    const mock = dishesMock.find((d) => d.id === id);
    if (mock) return ok({ ...mock, optionGroups: [], category: null, restaurant: { id: mock.restaurantId, name: mock.restaurantSlug, slug: mock.restaurantSlug } });
    return notFound("Блюдо не найдено");
  } catch (e) {
    return handleUnknown(e);
  }
}
