import { ok, handleUnknown } from "@/lib/server/api-response";
import { prisma } from "@/lib/prisma";
import { quickCategories } from "@/lib/mock-data";

export async function GET() {
  try {
    try {
      const cats = await prisma.dishCategory.findMany({ select: { id: true, name: true, slug: true, restaurantId: true }, take: 100 });
      if (cats.length) return ok(cats);
    } catch {}
    return ok(quickCategories.map((name, i) => ({ id: `cat-${i}`, name, slug: name.toLowerCase(), restaurantId: null })));
  } catch (e) {
    return handleUnknown(e);
  }
}
