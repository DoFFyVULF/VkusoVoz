import { NextRequest } from "next/server";
import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!["RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"].includes(session.role)) return unauthorized("Доступ запрещён");
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
    const status = req.nextUrl.searchParams.get("status");
    try {
      const ownerRestaurants = await prisma.restaurant.findMany({ where: { ownerId: session.id }, select: { id: true } });
      const ids = ownerRestaurants.map((r) => r.id);
      if (!ids.length) return ok({ items: [], total: 0, page, limit, pages: 0 });
      const where: Record<string, unknown> = { restaurantId: { in: ids } };
      if (status) where.status = status;
      const [items, total] = await Promise.all([
        prisma.order.findMany({ where: where as never, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { items: true } }),
        prisma.order.count({ where: where as never }),
      ]);
      return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
    } catch {
      return ok({ items: [], total: 0, page, limit, pages: 0 });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
