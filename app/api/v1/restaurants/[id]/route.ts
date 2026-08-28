import { NextRequest } from "next/server";
import { ok, notFound, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { restaurantsMock, demoRestaurant } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      const r = await prisma.restaurant.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { schedules: true, zones: true } });
      if (r) return ok(r);
    } catch {}
    const mock = restaurantsMock.find((x) => x.slug === id || x.id === id);
    if (mock) return ok({ ...mock, schedules: [], zones: [] });
    if (id === demoRestaurant.slug) return ok(demoRestaurant);
    return notFound("Ресторан не найден");
  } catch (e) {
    return handleUnknown(e);
  }
}
