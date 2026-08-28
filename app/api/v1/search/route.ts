import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, validationFail, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { restaurantsMock, dishesMock } from "@/lib/mock-data";

const querySchema = z.object({
  q: z.string().min(1, "Слишком короткий запрос").max(100).transform((v) => v.trim()),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    if (!parsed.success) return validationFail(parsed.error);
    const { q, limit } = parsed.data;
    try {
      const [restaurants, dishes] = await Promise.all([
        prisma.restaurant.findMany({ where: { status: "ACTIVE", OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: limit }),
        prisma.dish.findMany({ where: { isAvailable: true, OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: limit, include: { restaurant: { select: { id: true, name: true, slug: true } } } }),
      ]);
      return ok({ restaurants, dishes, q });
    } catch {
      const low = q.toLowerCase();
      const restaurants = restaurantsMock.filter((r) => r.name.toLowerCase().includes(low) || r.cuisine.toLowerCase().includes(low)).slice(0, limit);
      const dishes = dishesMock.filter((d) => d.name.toLowerCase().includes(low) || d.description.toLowerCase().includes(low)).slice(0, limit);
      return ok({ restaurants, dishes, q });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
