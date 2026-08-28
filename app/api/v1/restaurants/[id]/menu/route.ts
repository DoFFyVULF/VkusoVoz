import { NextRequest } from "next/server";
import { ok, notFound, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { demoRestaurant } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      const restaurant = await prisma.restaurant.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
      if (restaurant) {
        const categories = await prisma.dishCategory.findMany({ where: { restaurantId: restaurant.id, isActive: true }, orderBy: { sortOrder: "asc" }, include: { dishes: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" }, include: { optionGroups: { include: { items: true } } } } } });
        return ok({ categories });
      }
    } catch {}
    if (id === demoRestaurant.slug || id === "mamma-roma" || id === "4") {
      const categories = demoRestaurant.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, dishes: demoRestaurant.menu.find((m) => m.categoryId === c.id)?.dishes ?? [] }));
      return ok({ categories });
    }
    return notFound("Меню не найдено");
  } catch (e) {
    return handleUnknown(e);
  }
}
