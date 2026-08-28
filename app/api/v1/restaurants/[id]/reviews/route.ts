import { NextRequest } from "next/server";
import { ok, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { demoRestaurant } from "@/lib/mock-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
    try {
      const restaurant = await prisma.restaurant.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
      if (restaurant) {
        const [items, total] = await Promise.all([
          prisma.review.findMany({ where: { restaurantId: restaurant.id, status: "APPROVED" }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { user: { select: { id: true, name: true } } } }),
          prisma.review.count({ where: { restaurantId: restaurant.id, status: "APPROVED" } }),
        ]);
        return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
      }
    } catch {}
    const items = demoRestaurant.reviews.map((r) => ({ id: r.id, rating: r.rating, text: r.text, createdAt: r.date, user: { name: r.author } }));
    return ok({ items, total: items.length, page, limit, pages: 1 });
  } catch (e) {
    return handleUnknown(e);
  }
}
