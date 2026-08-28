import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    try {
      const [restaurants, dishes] = await Promise.all([
        prisma.favoriteRestaurant.findMany({ where: { userId: session.id }, include: { restaurant: true } }),
        prisma.favoriteDish.findMany({ where: { userId: session.id }, include: { dish: true } }),
      ]);
      return ok({ restaurants, dishes });
    } catch {
      return ok({ restaurants: [], dishes: [] });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
