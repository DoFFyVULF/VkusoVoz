import { NextRequest } from "next/server";
import { ok, unauthorized, validationFail, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { restaurantQuerySchema } from "@/lib/validators/restaurant";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (session.role !== "ADMIN") return unauthorized("Доступ запрещён");
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = restaurantQuerySchema.safeParse(params);
    if (!parsed.success) return validationFail(parsed.error);
    const { page, limit, status, q } = parsed.data;
    try {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (q) where.name = { contains: q, mode: "insensitive" };
      const [items, total] = await Promise.all([
        prisma.restaurant.findMany({ where: where as never, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.restaurant.count({ where: where as never }),
      ]);
      return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
    } catch {
      return ok({ items: [], total: 0, page, limit, pages: 0 });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
