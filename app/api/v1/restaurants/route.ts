import { NextRequest } from "next/server";
import { ok, handleUnknown, validationFail } from "@/lib/server/api-response";
import { restaurantQuerySchema } from "@/lib/validators/restaurant";
import { prisma } from "@/lib/prisma";
import { restaurantsMock } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = restaurantQuerySchema.safeParse(params);
    if (!parsed.success) return validationFail(parsed.error);
    const { q, city, status, sort, order, page, limit } = parsed.data;
    try {
      const where: Record<string, unknown> = {};
      if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
      if (city) where.city = city;
      if (status) where.status = status;
      else where.status = "ACTIVE";
      const orderBy: Record<string, string> = {};
      if (sort === "rating") orderBy.rating = order;
      else if (sort === "deliveryTime") orderBy.deliveryTimeMin = order;
      else if (sort === "createdAt") orderBy.createdAt = order;
      else orderBy.rating = order;
      const [items, total] = await Promise.all([
        prisma.restaurant.findMany({ where: where as never, orderBy: orderBy as never, skip: (page - 1) * limit, take: limit }),
        prisma.restaurant.count({ where: where as never }),
      ]);
      return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
    } catch {
      let filtered = [...restaurantsMock];
      if (q) filtered = filtered.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || r.cuisine.toLowerCase().includes(q.toLowerCase()));
      if (city) filtered = filtered.filter((r) => r.name.includes(city));
      filtered.sort((a, b) => (order === "asc" ? a.rating - b.rating : b.rating - a.rating));
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      return ok({ items, total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
